// src/app/submission/[id]/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import SubmissionReviewTabs from '@/components/SubmissionReviewTabs'; // <-- NEW COMPONENT
import { type SubmissionData } from '@/components/submission-types'; // <-- Assuming you'll create this

// It's good practice to define shared types in a separate file.
// Create a file like 'src/types/submission-types.ts' and put interfaces there:
/*
// src/types/submission-types.ts
export interface Highlight { quote?: string; criterion?: string; comment?: string; }
export interface Suggestions {
    structure_organisation?: string[]; language_vocabulary?: string[];
    grammar_spelling_punctuation?: string[]; genre_conventions?: string[];
    creativity_effectiveness_voice?: string[];
    [key: string]: string[] | undefined;
}
export interface ScoreDataItem { score?: number; explanation?: string; }
export interface ScoresByCriterion {
    structure_organisation?: ScoreDataItem; language_vocabulary?: ScoreDataItem;
    grammar_spelling_punctuation?: ScoreDataItem; genre_conventions?: ScoreDataItem;
    creativity_effectiveness_voice?: ScoreDataItem;
    [key: string]: ScoreDataItem | undefined;
}
export interface SubmissionData {
    id: number; created_at: string; content_json: object | null;
    prompts: { genre: string; prompt_text: string; } | null;
    feedback_status: 'pending' | 'completed' | 'error' | null;
    overall_score: number | null; scores_by_criterion: ScoresByCriterion | null;
    marker_notes: string | null; highlights: Highlight[] | null; suggestions: Suggestions | null;
}
*/

interface PageProps {
  params: { id: string };
}

export default async function SubmissionDetailPage({ params }: PageProps) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Submission Detail Page Error: Supabase URL or Anon Key missing!");
      return ( <div className="container mx-auto p-6 text-center text-red-500">Server configuration error.</div> );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const submissionId = params.id;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect('/login');
    }

    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select(`
          id, created_at, content_json, feedback_status, overall_score,
          scores_by_criterion, marker_notes, highlights, suggestions, overall_strengths, overall_areas_for_improvement,
          prompts ( genre, prompt_text )
      `)
      .eq('id', submissionId)
      .eq('user_id', user.id)
      .single<SubmissionData>();

    if (fetchError || !submission) {
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
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-6 inline-block text-sm">&larr; Back to Dashboard</Link>
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">
            Submission Review: {submission.prompts?.genre ? `${submission.prompts.genre} - ` : ''}
            <span className="text-gray-600 text-lg sm:text-xl">
                 Submitted {new Date(submission.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
        </h1>

        {/* Pass all submission data to the client component that handles tabs */}
        <SubmissionReviewTabs submission={submission} />

      </div>
    );
}