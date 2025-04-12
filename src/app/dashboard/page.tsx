// src/app/dashboard/page.tsx (Professional Polish)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
// Import icons from lucide-react
import { NotebookPen, CalendarDays, Eye, ArrowRight } from 'lucide-react';

interface SubmissionWithPrompt {
  id: number;
  created_at: string;
  prompt_id: number;
  prompts: {
    id: number;
    genre: string;
    prompt_text: string;
  } | null;
  // user_id is fetched but not directly displayed if email is available
  user_id: string;
  // Ensure your RPC function or select query returns these nested structures
  // If using RPC, ensure the function returns aliased columns correctly
  // users: { email: string | null } | null; // Example if needed
}


export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Check user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Fetch submissions WITH related prompt data
  // Ensure your fetch logic (direct select or RPC) provides the nested prompts data
  const { data: submissions, error: fetchError } = await supabase
    .from('submissions')
    .select(`
      id, created_at, prompt_id, user_id,
      prompts ( id, genre, prompt_text )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Cast data (handle potential null from fetch)
  const typedSubmissions = (submissions || []) as unknown as SubmissionWithPrompt[];

  return (
    // Add a subtle background gradient for depth
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 sm:p-8">
      <div className="container mx-auto max-w-5xl"> {/* Limit width */}

        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12">
          <div>
             <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">Dashboard</h1>
             <p className="text-lg text-gray-600">
               Welcome back, {user.email}!
             </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* Start Writing Button */}
            <Link href="/practice" className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
              Start New Writing Practice
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <LogoutButton /> {/* Use existing LogoutButton */}
          </div>
        </div>

        {/* Submissions Section */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Your Past Submissions</h2>
          {fetchError && (
               <p className="text-red-500 bg-red-50 p-4 rounded border border-red-200">Could not load submissions. Please try again later.</p>
          )}
          {!fetchError && typedSubmissions.length === 0 && (
            <div className="text-center py-10 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <NotebookPen className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1}/>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No Submissions Yet</h3>
                <p className="mt-1 text-sm text-gray-500">Start a new writing practice session to see your submissions here.</p>
                <div className="mt-6">
                    <Link href="/practice" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-sm">
                        Start Practice
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                </div>
            </div>
          )}
          {!fetchError && typedSubmissions.length > 0 && (
            // Grid layout for submission cards
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {typedSubmissions.map((submission) => (
                <Link key={submission.id} href={`/submission/${submission.id}`} className="block group">
                    <div className="border border-slate-200 bg-gradient-to-br from-white to-slate-50 rounded-lg p-5 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer h-full flex flex-col"> {/* Card styling */}
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
                        <p className="text-gray-700 text-sm line-clamp-3 flex-grow mb-3"> {/* Limit prompt lines */}
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