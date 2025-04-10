// src/app/dashboard/page.tsx (Enhanced with Submissions List)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use server client
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

// Define an interface for the data structure we expect from the query
// including the joined 'prompts' data
interface SubmissionWithPrompt {
  id: number; // Or string if your submission ID is different
  created_at: string; // Supabase returns timestamp as string
  prompt_id: number; // Or string
  // We expect a nested 'prompts' object due to the foreign key relationship
  prompts: {
    id: number; // Or string
    genre: string;
    prompt_text: string;
  } | null; // It could be null if the related prompt was deleted and FK was SET NULL
  // Add other submission fields if needed, like content_json
}


export default async function DashboardPage() {
  const supabase = await createClient(); // Create server client

  // 1. Check user session (existing code)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.log('Redirecting to login from /dashboard');
    redirect('/login');
  }

  // 2. Fetch submissions WITH related prompt data for the current user
  const { data: submissions, error: fetchError } = await supabase
    .from('submissions')
    // Select columns from 'submissions' and specific columns from 'prompts'
    .select(`
      id,
      created_at,
      prompt_id,
      prompts ( id, genre, prompt_text )
    `)
    // Filter to get only the current user's submissions
    .eq('user_id', user.id)
    // Order by creation date, newest first
    .order('created_at', { ascending: false });

  // Basic error handling for the fetch
  if (fetchError) {
    console.error("Error fetching submissions:", fetchError.message);
    // Optionally render an error message instead of just logging
  }

  // Cast data to our interface (optional, but helps with TypeScript)
  const typedSubmissions = submissions as SubmissionWithPrompt[] | null;


  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="text-lg mb-8">
        Welcome back, {user.email}!
      </p>

      {/* 3. Display Submissions Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Your Past Submissions</h2>
        {fetchError && (
             <p className="text-red-500">Could not load submissions. Please try again later.</p>
        )}
        {!fetchError && (!typedSubmissions || typedSubmissions.length === 0) && (
          <p className="text-gray-500">You have not completed any writing sessions yet.</p>
        )}
        {!fetchError && typedSubmissions && typedSubmissions.length > 0 && (
          <ul className="space-y-4">
            {typedSubmissions.map((submission) => (
              <Link key={submission.id} href={`/submission/${submission.id}`} legacyBehavior={false}>
              <li className="border p-4 rounded hover:bg-gray-100 cursor-pointer"> {/* Added cursor-pointer */}
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-lg">
                      {submission.prompts?.genre || 'Unknown Genre'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(submission.created_at).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-gray-700 truncate">
                    Prompt: {submission.prompts?.prompt_text || 'Prompt details unavailable.'}
                </p>
              </li>
          </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}