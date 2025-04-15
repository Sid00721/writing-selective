// src/app/submission/[id]/page.tsx (WITH createClient FIX)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import Link from 'next/link';
import ReadOnlyLexical from '@/components/ReadOnlyLexical'; // Ensure this component exists
import { type SerializedEditorState } from 'lexical';

// Define expected params shape
interface PageProps {
  params: { id: string }; // id from the URL
}

// Define the shape of our submission data including nested prompt info
interface SubmissionData {
    id: number;
    created_at: string;
    content_json: SerializedEditorState | null; // Allow null if Lexical state can be null
    prompts: { // Nested data from the join
        genre: string;
        prompt_text: string;
    } | null; // Prompt relation might be null
}


export default async function SubmissionDetailPage({ params }: PageProps) {
    // --- Read Environment Variables ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // --- Check if variables exist ---
    if (!supabaseUrl || !supabaseKey) {
      console.error("Submission Detail Page Error: Supabase URL or Anon Key missing!");
      return (
          <div className="container mx-auto p-6 text-center text-red-500">
              Server configuration error. Cannot load submission details.
          </div>
      );
    }

    // --- Create Client by PASSING variables (without await) ---
    const supabase = createClient(supabaseUrl, supabaseKey);

    const submissionId = params.id; // Get ID from params

    // 1. Check user session
    console.log(`SubmissionDetail [${submissionId}]: Checking user session...`);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log(`SubmissionDetail [${submissionId}]: No user session, redirecting to login.`);
      redirect('/login');
    }
    console.log(`SubmissionDetail [${submissionId}]: User ${user.id} found.`);

    // 2. Fetch the specific submission, joining prompt data
    console.log(`SubmissionDetail [${submissionId}]: Fetching submission data for user ${user.id}...`);
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select(`
          id,
          created_at,
          content_json,
          prompts ( genre, prompt_text )
      `)
      .eq('id', submissionId) // Filter by submission ID from URL
      .eq('user_id', user.id) // SECURITY: Ensure user owns this submission
      .single(); // Expect only one result

    // Cast data to our interface
    const typedSubmission = submission as SubmissionData | null;

    // 3. Handle errors or not found/unauthorized
    if (fetchError || !typedSubmission) {
        console.error(`SubmissionDetail [${submissionId}]: Error fetching submission or not found/authorized:`, fetchError?.message ?? 'Data was null');
        return (
            <div className="container mx-auto p-6">
                <p className="text-red-500 text-center">Could not load submission. It might not exist or you do not have permission to view it.</p>
                <div className="text-center mt-4">
                    <Link href="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
                </div>
            </div>
        );
    }
    console.log(`SubmissionDetail [${submissionId}]: Submission data fetched successfully.`);

    // 4. Render the page with the fetched data
    return (
      <div className="container mx-auto p-6 max-w-4xl"> {/* Added max-width */}
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-6 inline-block text-sm">&larr; Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Submission Details</h1>

        {/* Display Prompt Info */}
        <div className="mb-8 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Original Prompt</h2>
            <p className="text-sm text-gray-500 mb-1.5 font-medium">Genre: {typedSubmission.prompts?.genre || 'N/A'}</p>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{typedSubmission.prompts?.prompt_text || 'Prompt text not available.'}</p>
        </div>

        {/* Display Submission Date */}
        <p className="text-sm text-gray-500 mb-4">
            Submitted on: <span className="font-medium text-gray-700">{new Date(typedSubmission.created_at).toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' })}</span>
        </p>

        {/* Display Submitted Content */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Submission</h2>
            <div className="prose prose-lg max-w-none"> {/* Using prose for typography, adjust size */}
                {/* Use the ReadOnlyLexical component */}
                {typedSubmission.content_json ? (
                    <ReadOnlyLexical initialJsonState={typedSubmission.content_json} />
                ) : (
                    <p className='text-gray-500 italic'>No content saved for this submission.</p>
                )}
            </div>
        </div>
      </div>
    );
}