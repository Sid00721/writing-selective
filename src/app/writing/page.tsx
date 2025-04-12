// src/app/writing/page.tsx (Updated for Don't Repeat Prompts)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WritingSession from '@/components/WritingSession';
import Link from 'next/link'; // Make sure Link is imported
import { checkUserAccessStatus } from '@/lib/accessControl';

// Define the structure of the prompt data
interface Prompt {
  id: number; // Or string if your IDs are UUIDs etc.
  genre: string;
  prompt_text: string;
  // Add other fields if needed, e.g., is_active
  is_active?: boolean;
}

// Define the props structure including searchParams
interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WritingPage({ searchParams }: PageProps) {
  console.log("--- /writing page received searchParams:", searchParams);
  const supabase = await createClient();

  // 1. Check user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login?message=Please log in to write');
  }

   // --- NEW: ADD ACCESS CHECK ---
   const hasAccess = await checkUserAccessStatus(user.id);
   if (!hasAccess) {
     // User is logged in but doesn't have subscription/free access
     console.log(`User ${user.id} denied access to /writing, redirecting to /pricing`);
     redirect('/pricing'); // Redirect non-subscribed users
   }
   // --- END ACCESS CHECK ---
   
  // 2. Get selected genre from query parameters
  const selectedGenre = typeof searchParams?.genre === 'string' ? searchParams.genre : null;

  // Redirect back to practice page if no valid genre is selected
  if (!selectedGenre) {
    console.log('No genre selected, redirecting to /practice');
    redirect('/practice');
  }

  // --- NEW STEP: Fetch IDs of prompts already submitted by the user ---
  const { data: submittedPromptsData, error: submittedError } = await supabase
    .from('submissions')
    .select('prompt_id') // Only need the prompt ID
    .eq('user_id', user.id); // Filter for the current user

  if (submittedError) {
    console.error("Error fetching user's submitted prompts:", submittedError.message);
    // Handle error - maybe redirect or show a generic error message
    return (
        <div className="container mx-auto p-6 text-center">
             <p className="text-red-500">Error checking your submission history. Please try again.</p>
             <Link href="/practice" className="text-blue-600 hover:underline mt-4 inline-block">Choose a genre</Link>
        </div>
    );
  }

  // Create an array of IDs the user has already submitted (handle potential null IDs if possible in DB)
  const submittedPromptIds = (submittedPromptsData || [])
                             .map(sub => sub.prompt_id)
                             .filter(id => id !== null) as number[]; // Filter out nulls and assert type
  console.log("User has submitted prompts with IDs:", submittedPromptIds); // For debugging
  // --- END OF NEW STEP ---

  // 3. Fetch active prompts for the selected genre, EXCLUDING submitted ones
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('is_active', true) // Ensure only active prompts are considered
    .eq('genre', selectedGenre); // Filter by genre

  // Add the filter to exclude submitted prompt IDs IF the array is not empty
  if (submittedPromptIds.length > 0) {
    // Use the format: .not('column', 'in', '(value1, value2, ...)')
    // Ensure IDs are correctly formatted if they are strings/UUIDs
    query = query.not('id', 'in', `(${submittedPromptIds.join(',')})`);
    console.log("Querying prompts excluding IDs:", submittedPromptIds); // For debugging
  }

  const { data: availablePrompts, error: fetchError } = await query;

  // Handle potential fetching errors
  if (fetchError) {
    console.error(`Error fetching available prompts for genre "${selectedGenre}":`, fetchError.message);
    return (
        <div className="container mx-auto p-6 text-center">
            <p className="text-red-500">Error loading writing prompt. Please try again later.</p>
            <Link href="/practice" className="text-blue-600 hover:underline mt-4 inline-block">Choose a different genre</Link>
        </div>
    );
  }

  // --- MODIFIED STEP: Handle case where NO *unsubmitted* prompts are left ---
  if (!availablePrompts || availablePrompts.length === 0) {
    // Handle case where no *available* (active and unsubmitted) prompts are found for this genre
    return (
        <div className="container mx-auto p-6 text-center">
            <p className="text-gray-600 font-semibold">Congratulations!</p>
            <p className="text-gray-500 mt-2">You seem to have completed all available &apos;{selectedGenre}&apos; prompts.</p>
            <p className="text-gray-500 mt-1">Check back later or try another genre.</p>
            <Link href="/practice" className="text-blue-600 hover:underline mt-6 inline-block">Choose a different genre</Link>
        </div>
    );
  }
  // --- END OF MODIFIED STEP ---

  // 4. Select a random prompt from the *available* list
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  const currentPrompt: Prompt = availablePrompts[randomIndex];

  // 5. Render the Writing Session with the selected prompt
  return (
    <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Writing Practice</h1>
        <p className="text-center text-gray-500 mb-6">Genre: {selectedGenre}</p>
        {/* Pass the selected, available prompt to the session component */}
        <WritingSession currentPrompt={currentPrompt} />
    </div>
  );
}