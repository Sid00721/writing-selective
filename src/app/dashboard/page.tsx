// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkUserAccessStatus } from '@/lib/accessControl';
import { getSubscriptionInfo } from '@/lib/subscriptionStatus';

// Import Dashboard UI Components
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { TrialStatusBanner } from '@/components/dashboard/TrialStatusBanner';
import { RecentSubmissionsList } from '@/components/dashboard/RecentSubmissionsList';
import type { SubmissionItemData } from '@/components/dashboard/SubmissionListItem'; // Assuming this path

// Interface for the raw data fetched from Supabase for each submission item
interface RawSupabaseSubmission {
    id: number;
    created_at: string;
    feedback_status?: 'pending' | 'completed' | 'error' | null;
    prompts: { genre: string; prompt_text: string; } | { genre: string; prompt_text: string; }[] | null;
    overall_score?: number | null;
    // scores_by_criterion is not directly used for the list display anymore,
    // but it's good to keep in the select if you might use it for other calculations
    // or if your overall_score depends on it.
    scores_by_criterion?: Record<string, number | string> | null;
}

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  let userNameForWelcome = user.email?.split('@')[0]; // Default to part of email
  try {
    const { data: userProfileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (userProfileData && userProfileData.full_name) {
      userNameForWelcome = userProfileData.full_name;
    }
  } catch (profileError) {
    console.error("Error fetching user profile for name:", profileError);
  }

  // --- Fetch initial submissions AND total count for the list ---
  let submissionFetchErrorMsg: string | null = null;
  const initialItemsPerPage = 10; // How many to load initially
  let initialTotalCount = 0;

  // Fetch initial submissions with total count based on default filters (none in this case, just user's submissions)
  const { data: rawInitialSubmissions, error: fetchError, count: rawInitialTotalCount } = await supabase
    .from('submissions')
    .select(`
        id,
        created_at,
        feedback_status,
        prompts ( genre, prompt_text ),
        overall_score
    `, { count: 'exact' }) // Get total count matching these initial criteria
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) // Default sort for initial load
    .limit(initialItemsPerPage);

  if (fetchError) {
    console.error("Dashboard: Error fetching initial submissions:", fetchError.message);
    submissionFetchErrorMsg = `Could not load recent submissions: ${fetchError.message}`;
  } else {
    initialTotalCount = rawInitialTotalCount || 0;
  }

  const initialSubmissionsForList: SubmissionItemData[] = (rawInitialSubmissions || []).map((sub: RawSupabaseSubmission) => {
    const currentPromptData = Array.isArray(sub.prompts) ? sub.prompts[0] : sub.prompts;
    const maxPossibleScore = 25; // Ensure this matches your scoring system
    const overallScoreNum = typeof sub.overall_score === 'number' ? sub.overall_score : 0;
    const overallScorePercentage = maxPossibleScore > 0 ? Math.round((overallScoreNum / maxPossibleScore) * 100) : 0;

    return {
      id: sub.id,
      genre: currentPromptData?.genre || 'N/A',
      promptTitle: currentPromptData?.prompt_text || 'Untitled Prompt',
      date: new Date(sub.created_at).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
      overallScorePercentage: overallScorePercentage,
      feedbackStatus: sub.feedback_status,
      viewLink: `/submission/${sub.id}`,
    };
  });

  // --- Fetch data for Overview Stats Cards ---
  // 1. Total Practices (already fetched as initialTotalCount if filters were minimal, or fetch separately for all-time total)
  // For simplicity, if initialTotalCount represents all scored submissions, we can use it.
  // Or, for a true "all practices ever" count (even unscored):
  const { count: allTimeTotalPracticesCount, error: countError } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if (countError) console.error("Error fetching all-time total practices count:", countError.message);
  const actualTotalPractices = (allTimeTotalPracticesCount ?? 0).toString();

  // 2. Average Score (from all scored submissions)
  let overallAverageScorePercentageString = "N/A";
  const { data: allScoresData, error: allScoresError } = await supabase
    .from('submissions')
    .select('overall_score')
    .eq('user_id', user.id)
    .not('overall_score', 'is', null);

  if (allScoresError) {
    console.error("Error fetching all scores for average:", allScoresError.message);
  } else if (allScoresData && allScoresData.length > 0) {
    const validScores = allScoresData.map(s => s.overall_score).filter(score => typeof score === 'number') as number[];
    if (validScores.length > 0) {
      const sumOfScores = validScores.reduce((acc, score) => acc + score, 0);
      const averageRawScore = sumOfScores / validScores.length;
      const maxPossibleScore = 25; // Ensure this matches your scoring system
      overallAverageScorePercentageString = Math.round((averageRawScore / maxPossibleScore) * 100) + "%";
    }
  }

  // 3. Words Written - Sum all word counts from user's submissions
  let totalWordsWritten = 0;
  const { data: wordCountData, error: wordCountError } = await supabase
    .from('submissions')
    .select('word_count')
    .eq('user_id', user.id)
    .not('word_count', 'is', null);

  if (wordCountError) {
    console.error("Error fetching word counts:", wordCountError.message);
  } else if (wordCountData && wordCountData.length > 0) {
    totalWordsWritten = wordCountData.reduce((sum, submission) => {
      const wordCount = submission.word_count;
      return sum + (typeof wordCount === 'number' ? wordCount : 0);
    }, 0);
  }

  const totalWordsWrittenString = totalWordsWritten.toLocaleString();

  const overviewStatsData = [
    { id: 'practices', label: "Total Practices", value: actualTotalPractices, subtext: "Great progress!" },
    { id: 'avgScore', label: "Average Score", value: overallAverageScorePercentageString, subtext: "Excellent work!" },
    { id: 'wordsWritten', label: "Words Written", value: totalWordsWrittenString, subtext: "Keep writing!" },
  ];

  const hasAccess = await checkUserAccessStatus(user.id);
  
  // Get subscription info for trial status banner
  const subscriptionInfo = await getSubscriptionInfo(user.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        <WelcomeHeader userName={userNameForWelcome} />
        
        {/* Trial Status Banner */}
        {subscriptionInfo && (
          <TrialStatusBanner subscriptionInfo={subscriptionInfo} />
        )}
        
        <OverviewStats stats={overviewStatsData} />

        <div className="mt-6 md:mt-8">
          {submissionFetchErrorMsg ? (
            <div className="bg-white p-6 rounded-xl shadow-lg text-red-500 text-center"> {/* Seamless card style for error */}
              {submissionFetchErrorMsg}
            </div>
          ) : (
            <RecentSubmissionsList
              initialSubmissions={initialSubmissionsForList}
              initialTotalCount={initialTotalCount} // Pass the total count for initial filter set
              userId={user.id}
              hasAccess={hasAccess}
              practiceLinkTarget={hasAccess ? "/practice" : "/pricing"}
              itemsPerPage={5} // How many to load per "load more" click via API
            />
          )}
        </div>

        {/* Performance Statistics Section is REMOVED as per your request */}

      </div>
      {/* A global footer for authenticated pages would typically go in an AuthenticatedLayout.tsx */}
    </div>
  );
}