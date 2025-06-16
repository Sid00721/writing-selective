// src/app/dashboard/page.tsx (With Conditional Access Button & createClient FIX)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { NotebookPen, CalendarDays, Eye, ArrowRight, CreditCard } from 'lucide-react';
import { checkUserAccessStatus } from '@/lib/accessControl'; // Import the check function

// Interface for fetched submission data
interface SubmissionWithPrompt {
  id: number;
  created_at: string;
  prompt_id: number;
  prompts: { // Nested prompt data
    id: number;
    genre: string;
    prompt_text: string;
  } | null; // Prompt might be null if deleted? Or handle join failure
  user_id: string; // Included user_id from select
}


export default async function DashboardPage() {
    // --- Read Environment Variables ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // --- Check if variables exist ---
    if (!supabaseUrl || !supabaseKey) {
      console.error("Dashboard Page Error: Supabase URL or Anon Key missing!");
      // Render an error message or handle appropriately
      return (
          <div className="container mx-auto p-6 text-center text-red-500">
              Server configuration error. Cannot load dashboard.
          </div>
      );
    }

    // --- Create Client ---
    const supabase = createClient();

    // 1. Check user session
    console.log("Dashboard: Checking user session...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log("Dashboard: No user session found, redirecting to login.");
      redirect('/login');
    }
    console.log(`Dashboard: User ${user.id} found.`);

    // 2. Check User Access Status (Subscription/Permissions)
    console.log(`Dashboard: Checking access status for user ${user.id}...`);
    const hasAccess = await checkUserAccessStatus(user.id); // Assuming this function exists and works
    console.log(`Dashboard: User has access: ${hasAccess}`);

    // 3. Fetch user's submissions (using the client created above)
    console.log(`Dashboard: Fetching submissions for user ${user.id}...`);
    const { data: submissions, error: fetchError } = await supabase
        .from('submissions')
        .select(`
            id, created_at, prompt_id, user_id,
            prompts ( id, genre, prompt_text )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (fetchError) {
        console.error("Dashboard: Error fetching submissions:", fetchError.message);
        // We'll still render the page but show an error for the submissions section
    }

    // Type cast or default to empty array
    const typedSubmissions = (submissions || []) as unknown as SubmissionWithPrompt[];
    console.log(`Dashboard: Found ${typedSubmissions.length} submissions.`);

    // --- Define Button Text & Link based on Access ---
    const practiceLinkTarget = hasAccess ? "/practice" : "/pricing";
    const practiceButtonText = hasAccess ? "Start New Writing Practice" : "Subscribe to Practice";
    const PracticeButtonIcon = hasAccess ? ArrowRight : CreditCard;
    // --- End Button Logic ---

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 sm:p-8">
            <div className="container mx-auto max-w-5xl">

                {/* Header section */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">Dashboard</h1>
                        <p className="text-lg text-gray-600">
                          Welcome back, {user.email}!
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        {/* Conditional Start/Subscribe Button */}
                        <Link
                            href={practiceLinkTarget}
                            className={`inline-flex items-center px-6 py-2.5 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${
                                hasAccess
                                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' // Style for access
                                : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400' // Style for subscribe prompt
                            }`}
                        >
                            {practiceButtonText}
                            <PracticeButtonIcon className="ml-2 h-5 w-5" />
                        </Link>
                        <LogoutButton />
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Past Submissions</h2>
                    {fetchError && (
                         <p className="text-red-500 bg-red-50 p-4 rounded border border-red-200 text-center">Could not load submissions: {fetchError.message}</p>
                    )}
                    {!fetchError && typedSubmissions.length === 0 && (
                        // Empty state (keep as is)
                        <div className="text-center py-10 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                           <NotebookPen className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1}/>
                           <h3 className="mt-2 text-lg font-medium text-gray-900">No Submissions Yet</h3>
                           <p className="mt-1 text-sm text-gray-500">Start a new writing practice session to see your submissions here.</p>
                           <div className="mt-6">
                               <Link
                                   href={practiceLinkTarget}
                                   className={`inline-flex items-center px-4 py-2 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out text-sm ${
                                       hasAccess
                                       ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                                       : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400'
                                   }`}
                                >
                                   {hasAccess ? 'Start Practice' : 'Subscribe Now'}
                                   <PracticeButtonIcon className="ml-1.5 h-4 w-4" />
                               </Link>
                           </div>
                       </div>
                    )}
                    {!fetchError && typedSubmissions.length > 0 && (
                        // Grid layout for submission cards (keep as is)
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {typedSubmissions.map((submission) => (
                                <Link key={submission.id} href={`/submission/${submission.id}`} className="block group">
                                    <div className="border border-slate-200 bg-gradient-to-br from-white to-slate-50 rounded-lg p-5 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer h-full flex flex-col">
                                        {/* Card content */}
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                <NotebookPen className="mr-1.5 h-4 w-4" strokeWidth={2}/>
                                                {submission.prompts?.genre || 'Unknown Genre'}
                                            </span>
                                            <span className="flex items-center text-xs text-gray-500">
                                                <CalendarDays className="mr-1 h-4 w-4" strokeWidth={2}/>
                                                {new Date(submission.created_at).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm line-clamp-3 flex-grow mb-3">
                                           {submission.prompts?.prompt_text || 'Prompt details unavailable.'}
                                        </p>
                                        <div className="mt-auto text-right text-sm font-medium text-indigo-600 group-hover:underline flex items-center justify-end">
                                            View Details <Eye className="ml-1 h-4 w-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}