// src/app/submission/[id]/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
// We will create and import this component next:
import ReadOnlyLexical from '@/components/ReadOnlyLexical';
import { type SerializedEditorState } from 'lexical';

// Define expected params shape
interface PageProps {
  params: { id: string }; // id from the URL
}

// Define the shape of our submission data
interface SubmissionData {
    id: number;
    created_at: string;
    content_json: SerializedEditorState; // Stores the parsed Lexical JSON state
    prompts: {
        genre: string;
        prompt_text: string;
    } | null;
}


export default async function SubmissionDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const submissionId = params.id;

  // 1. Check user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Fetch the specific submission, joining prompt data
  // Use .single() to get one record or error
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

  // 3. Handle errors or not found
  if (fetchError || !typedSubmission) {
      console.error("Error fetching submission or not found/authorized:", fetchError?.message);
      // You could show a proper "Not Found" page here
      return (
          <div className="container mx-auto p-6">
             <p className="text-red-500 text-center">Could not load submission. It might not exist or you do not have permission to view it.</p>
             <div className="text-center mt-4">
                 <Link href="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
             </div>
          </div>
      );
  }

  return (
    <div className="container mx-auto p-6">
      <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Submission Details</h1>

      {/* Display Prompt Info */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
         <h2 className="text-xl font-semibold mb-2">Original Prompt</h2>
         <p className="text-sm text-gray-500 mb-1">Genre: {typedSubmission.prompts?.genre || 'N/A'}</p>
         <p className="text-gray-700 whitespace-pre-wrap">{typedSubmission.prompts?.prompt_text || 'N/A'}</p>
      </div>

       {/* Display Submission Date */}
       <p className="text-sm text-gray-500 mb-4">
           Submitted on: {new Date(typedSubmission.created_at).toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' })}
       </p>

      {/* Display Submitted Content */}
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h2 className="text-xl font-semibold mb-4  text-gray-900">Your Submission</h2>
         <div className="prose max-w-none"> {/* Basic prose styling */}
             {/* Use the ReadOnlyLexical component */}
            {typedSubmission.content_json ? (
                <ReadOnlyLexical initialJsonState={typedSubmission.content_json} />
            ) : (
                <p className='text-gray-500'>No content saved for this submission.</p>
            )}
         </div>
      </div>
    </div>
  );
}