// src/app/admin/submissions/[id]/page.tsx (Uses RPC to fetch data)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import Link from 'next/link';
import ReadOnlyLexical from '@/components/ReadOnlyLexical';
import { type SerializedEditorState } from 'lexical';
import { type PostgrestError } from '@supabase/supabase-js'; // For error typing

// --- Interface Definitions (Restored) ---
interface PageProps {
  params: { id: string }; // id from the URL, likely a string from router
}

interface SubmissionAdminData {
    id: number; // Adjust type if UUID
    created_at: string;
    content_json: SerializedEditorState | null; // Allow null if DB can be null
    user_id: string; // UUID string
    prompt_genre: string | null;
    prompt_text: string | null;
    user_email: string | null; // Email from auth.users
}
// --- End Interface Definitions ---


export default async function AdminSubmissionDetailPage({ params }: PageProps) {
  // --- Read Environment Variables ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // --- Check if variables exist ---
  if (!supabaseUrl || !supabaseKey) {
    console.error("Admin Submission Detail Error: Supabase URL or Anon Key missing!");
    // Render an error message or handle appropriately
    return (
        <div className="container mx-auto p-6 text-center text-red-500">
            Server configuration error. Cannot load submission details.
        </div>
    );
  }

  // --- Create Client ---
  const supabase = createClient();

  // Convert param ID to number if your DB function expects bigint/int
  // If your ID is UUID, keep it as string: const submissionId = params.id;
  const submissionId = parseInt(params.id, 10);
  if (isNaN(submissionId)) {
      // Handle invalid ID in URL
      return (
          <div className="container mx-auto p-6 text-center text-red-500">
              Invalid Submission ID in URL.
          </div>
      );
  }

  // 1. Check user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login'); // Redirect to login if no user
  }

  // 2. Check if user is admin (using the is_admin function)
  let isAdmin = false;
  const { data: isAdminResult, error: isAdminError } = await supabase.rpc('is_admin');

  if (isAdminError) {
       console.error("Security check failed: Error checking admin status:", isAdminError.message);
       // Fail secure - deny access if check fails
       return (
           <div className="container mx-auto p-6 text-center text-red-500">
               Could not verify user permissions.
           </div>
       );
   } else {
       // Ensure the RPC result is explicitly checked for true
       isAdmin = isAdminResult === true;
   }

  // 3. Fetch data using RPC - ONLY if user is admin
  let submissionData: SubmissionAdminData | null = null;
  let fetchError: PostgrestError | null = null;

  if (!isAdmin) {
      console.warn(`User ${user.id} is not admin, denying access to admin submission view.`);
      // Explicitly deny access if not admin
       return (
           <div className="container mx-auto p-6 text-center text-red-500">
               Access Denied. You do not have permission to view this page.
           </div>
       );
  } else {
      // Admin fetches using RPC
      console.log(`Admin ${user.id} fetching submission ${submissionId} via RPC...`);
      const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_submission_details_for_admin', { input_submission_id: submissionId })
          .single(); // Expect a single object back

      fetchError = rpcError; // Store potential error
      // Type assertion - ensure RPC returns data matching the interface
      submissionData = rpcData as SubmissionAdminData | null;
  }

  // 4. Handle errors or data not found after attempting fetch
  if (fetchError || !submissionData) {
       // Log the specific error if it exists
       console.error(`Error fetching submission ${submissionId} via RPC or not found/authorized:`, fetchError?.message ?? 'Data was null');
       return (
           <div className="container mx-auto p-6">
               <p className="text-red-500 text-center">Could not load submission. It might not exist or you do not have permission to view it.</p>
               <div className="text-center mt-4">
                   {/* Point back to admin submissions list */}
                   <Link href={"/admin/submissions"} className="text-blue-600 hover:underline">Back to Submissions</Link>
               </div>
           </div>
       );
   }

  // 5. Render the page with the fetched data
  return (
    <div className="container mx-auto p-6">
      <Link href={"/admin/submissions"} className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Submissions</Link>
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Submission Details</h1>

      {/* Display Prompt Info */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Original Prompt</h2>
          <p className="text-sm text-gray-500 mb-1">Genre: {submissionData.prompt_genre || 'N/A'}</p>
          <p className="text-gray-700 whitespace-pre-wrap">{submissionData.prompt_text || 'N/A'}</p>
      </div>

      {/* Display Submission Meta Info (Date and Email/User ID) */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mb-4">
          <p>
              Submitted on: {new Date(submissionData.created_at).toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' })}
          </p>
          {/* Display Email fetched via RPC */}
          {submissionData.user_email ? (
              <p>
                  Student Email: <span className="font-medium text-gray-700">{submissionData.user_email}</span>
              </p>
          // Optionally display User ID as fallback if email was null in auth.users
          ) : submissionData.user_id ? (
               <p>
                   User ID: <span className="font-medium text-gray-700">{submissionData.user_id}</span>
               </p>
          ) : null}
      </div>

      {/* Display Submitted Content */}
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Student&apos;s Submission</h2>
          <div className="prose max-w-none"> {/* Basic prose styling */}
              {submissionData.content_json ? (
                  // Cast content_json if ReadOnlyLexical is very strict about the type
                  <ReadOnlyLexical initialJsonState={submissionData.content_json as SerializedEditorState} />
              ) : (
                  <p className='text-gray-500'>No content saved for this submission.</p>
              )}
          </div>
      </div>
    </div>
  );
}

// Removed commented-out type definitions at the end as they weren't directly used here.