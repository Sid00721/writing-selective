// src/app/submission/[id]/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use server client
import Link from 'next/link';
import ReadOnlyLexical from '@/components/ReadOnlyLexical'; // Adjust path if needed
import { type SerializedEditorState } from 'lexical'; // Assuming this is the type for content_json

// --- Interfaces ---
interface PageProps {
  params: { id: string };
}

// Define structure for feedback highlights
interface Highlight {
  quote?: string;
  criterion?: string;
  comment?: string;
}

// Define structure for feedback suggestions (keys match criteria keys used in feedbackActions)
interface Suggestions {
  structure_organisation?: string[];
  language_vocabulary?: string[];
  grammar_spelling_punctuation?: string[];
  genre_conventions?: string[];
  creativity_effectiveness_voice?: string[];
}

// Define structure for scores by criterion (keys match criteria keys used in feedbackActions)
interface ScoresByCriterion {
    structure_organisation?: { score?: number; explanation?: string };
    language_vocabulary?: { score?: number; explanation?: string };
    grammar_spelling_punctuation?: { score?: number; explanation?: string };
    genre_conventions?: { score?: number; explanation?: string };
    creativity_effectiveness_voice?: { score?: number; explanation?: string };
}

// SubmissionData Interface including feedback fields
interface SubmissionData {
  id: number;
  created_at: string;
  content_json: object | null; // Accept generic object, ReadOnlyLexical handles parsing
  prompts: {
    genre: string;
    prompt_text: string;
  } | null;
  feedback_status: 'pending' | 'completed' | 'error' | null;
  overall_score: number | null;
  scores_by_criterion: ScoresByCriterion | null;
  marker_notes: string | null;
  highlights: Highlight[] | null; // Expecting array of Highlight objects
  suggestions: Suggestions | null;
}
// --- End Interfaces ---


export default async function SubmissionDetailPage({ params }: PageProps) {
    // --- Environment Variable Check ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("Submission Detail Page Error: Supabase URL or Anon Key missing!");
      return ( <div className="container mx-auto p-6 text-center text-red-500">Server configuration error.</div> );
    }

    // --- Create Supabase Server Client ---
    const supabase = createClient(supabaseUrl, supabaseKey);

    const submissionId = params.id;

    // 1. Check user session
    console.log(`SubmissionDetail [${submissionId}]: Checking user session...`);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log(`SubmissionDetail [${submissionId}]: No user session, redirecting to login.`);
      redirect('/login');
    }
    console.log(`SubmissionDetail [${submissionId}]: User ${user.id} found.`);

    // 2. Fetch the specific submission, including all feedback fields
    console.log(`SubmissionDetail [${submissionId}]: Fetching submission data for user ${user.id}...`);
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select(`
          id,
          created_at,
          content_json,
          feedback_status,
          overall_score,
          scores_by_criterion,
          marker_notes,
          highlights,
          suggestions,
          prompts ( genre, prompt_text )
      `)
      .eq('id', submissionId)
      .eq('user_id', user.id)
      .single<SubmissionData>(); // Use the updated interface for type hinting

    // 3. Handle errors or not found/unauthorized
    if (fetchError || !submission) { // Check submission directly now
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
    console.log(`SubmissionDetail [${submissionId}]: Submission data fetched successfully. Status: ${submission.feedback_status}`);

    // Use the fetched data directly (no need for separate typedSubmission variable)
    const typedSubmission = submission;

    // 4. Render the page
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl"> {/* Wider max-width */}
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-6 inline-block text-sm">&larr; Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Submission Review</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Prompt & Submission */}
            <div className="lg:col-span-2 space-y-6">
                {/* Display Prompt Info */}
                <div className="p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Original Prompt</h2>
                    <p className="text-sm text-gray-500 mb-1.5 font-medium">Genre: {typedSubmission.prompts?.genre ?? 'N/A'}</p>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{typedSubmission.prompts?.prompt_text ?? 'Prompt text not available.'}</p>
                    <p className="text-xs text-gray-400 mt-3">
                        Submitted on: {new Date(typedSubmission.created_at).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                </div>

                {/* Display Submitted Content with Highlighting */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Submission</h2>
                    <div className="prose prose-lg max-w-none min-h-[200px]">
                        {typedSubmission.content_json ? (
                            <ReadOnlyLexical
                                initialJsonState={typedSubmission.content_json}
                                // *** Pass the highlights data to the component ***
                                highlights={typedSubmission.feedback_status === 'completed' ? typedSubmission.highlights : []}
                             />
                        ) : (
                            <p className='text-gray-500 italic'>No content saved for this submission.</p>
                        )}
                    </div>
                </div>
            </div>

             {/* Right Column: Feedback */}
            <div className="lg:col-span-1 space-y-6">
                <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm sticky top-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Feedback</h2>

                    {/* --- Conditional Rendering based on Status --- */}
                    {typedSubmission.feedback_status === 'pending' && (
                        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-blue-700 animate-pulse">Feedback generation is in progress...</p>
                            <p className="text-xs text-blue-600 mt-1">This can take up to a minute. Please check back shortly.</p>
                        </div>
                    )}

                    {typedSubmission.feedback_status === 'error' && (
                         <div className="text-center p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-700 font-semibold">Feedback Generation Failed</p>
                            {typedSubmission.marker_notes && <p className="text-sm text-red-600 mt-1">{typedSubmission.marker_notes}</p>}
                            <p className="text-xs text-red-500 mt-2">Please try submitting again or contact support if the issue persists.</p>
                        </div>
                    )}

                    {typedSubmission.feedback_status === 'completed' && (
                        <>
                            {/* Overall Score */}
                            <div className="mb-5 text-center">
                                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Overall Score</p>
                                <p className="text-5xl font-bold text-gray-800">{typedSubmission.overall_score ?? '--'} / 25</p>
                            </div>

                             {/* Marker Notes */}
                             <div className="mb-5">
                                <h3 className="text-lg font-semibold mb-2 text-gray-700">Marker Notes</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap leading-relaxed">
                                    {typedSubmission.marker_notes || 'No overall comments provided.'}
                                </p>
                            </div>

                             {/* Score Breakdown */}
                             <div className="mb-5">
                                <h3 className="text-lg font-semibold mb-2 text-gray-700">Score Breakdown</h3>
                                <div className="text-sm text-gray-600 space-y-1.5 border-t pt-3">
                                    {typedSubmission.scores_by_criterion ? (
                                        Object.entries(typedSubmission.scores_by_criterion).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-baseline">
                                                <span className="font-medium text-gray-700">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                                                <span className="font-semibold text-gray-800">{value?.score ?? 'N/A'}/5</span>
                                            </div>
                                            // Optionally add explanation display toggle:
                                            // {value?.explanation && <p className="text-xs text-gray-500 pl-2">{value.explanation}</p>}
                                        ))
                                    ) : <p className="text-gray-500 italic">No score breakdown available.</p>}
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="mb-5">
                                <h3 className="text-lg font-semibold mb-2 text-gray-700">Suggestions for Improvement</h3>
                                <div className="text-sm text-gray-700 space-y-3 border-t pt-3">
                                    {typedSubmission.suggestions && Object.values(typedSubmission.suggestions).some(arr => arr && arr.length > 0) ? ( // Check if any suggestions exist
                                        Object.entries(typedSubmission.suggestions).flatMap(([key, value]) =>
                                            value && Array.isArray(value) && value.length > 0 ? [
                                                <div key={key}>
                                                   <strong className="block mb-1 text-gray-600">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                                                   <ul className="list-disc list-inside pl-2 space-y-0.5 text-gray-600">
                                                        {value.map((suggestion: string, index: number) =>
                                                            <li key={index}>{suggestion}</li>
                                                        )}
                                                   </ul>
                                                </div>
                                            ] : []
                                        )
                                    ) : <p className="text-gray-500 italic">No specific suggestions provided (great work, or check marker notes!).</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Case where status is null or unexpected */}
                     {typedSubmission.feedback_status !== 'pending' && typedSubmission.feedback_status !== 'error' && typedSubmission.feedback_status !== 'completed' && (
                        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                           <p className="text-yellow-700">Feedback has not been generated for this submission yet.</p>
                        </div>
                     )}
                </div>
            </div>

        </div>
      </div>
    );
}