// src/app/writing/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import WritingSession from '@/components/WritingSession'; // Ensure this path is correct
import Link from 'next/link';
import { checkUserAccessStatus } from '@/lib/accessControl'; // Keep access check

// Define the structure of the prompt data
interface Prompt {
  id: number; // Or string if your IDs are UUIDs etc.
  genre: string;
  prompt_text: string;
  is_active?: boolean; // is_active is used in the query
}

// Define the props structure including searchParams
interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WritingPage({ searchParams }: PageProps) {
  console.log("--- /writing page received searchParams:", searchParams);

  // --- Read Environment Variables ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using Anon key for server component

  // --- Check if variables exist ---
  if (!supabaseUrl || !supabaseKey) {
    console.error("Writing Page Error: Supabase URL or Anon Key missing!");
    return (
        <div className="container mx-auto p-6 text-center text-red-500">
            Server configuration error. Cannot load writing session.
        </div>
    );
  }

  // --- Create Client by PASSING variables ---
  const supabase = createClient(supabaseUrl, supabaseKey);


  // 1. Check user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login?message=Please log in to write');
  }

  // --- ADD ACCESS CHECK ---
  const hasAccess = await checkUserAccessStatus(user.id);
  if (!hasAccess) {
    console.log(`User ${user.id} denied access to /writing, redirecting to /pricing`);
    redirect('/pricing');
  }
  // --- END ACCESS CHECK ---

  // 2. Get selected genre from query parameters
  const selectedGenre = typeof searchParams?.genre === 'string' ? searchParams.genre : null;

  // Redirect back to practice page if no valid genre is selected
  if (!selectedGenre) {
    console.log('No genre selected, redirecting to /practice');
    redirect('/practice');
  }
  console.log("Attempting to find prompt for GENRE:", selectedGenre, "for USER:", user.id);


  // --- Fetch IDs of prompts already submitted by the user ---
  const { data: submittedPromptsData, error: submittedError } = await supabase
    .from('submissions')
    .select('prompt_id') // Only need the prompt ID
    .eq('user_id', user.id); // Filter for the current user

  if (submittedError) {
    console.error("Error fetching user's submitted prompts:", submittedError.message);
    return (
        <div className="container mx-auto p-6 text-center">
            <p className="text-red-500">Error checking your submission history. Please try again.</p>
            <Link href="/practice" className="text-blue-600 hover:underline mt-4 inline-block">Choose a genre</Link>
        </div>
    );
  }

  // Create an array of IDs the user has already submitted
  const submittedPromptIds = (submittedPromptsData || [])
                                .map(sub => sub.prompt_id)
                                .filter(id => id !== null && id !== undefined) as number[]; // Ensure not null/undefined
  console.log("User has submitted prompt IDs:", submittedPromptIds);
  // --- END OF FETCH SUBMITTED IDS ---

  // 3. Fetch active prompts for the selected genre, EXCLUDING submitted ones
  let query = supabase
    .from('prompts')
    .select('*') // Select all fields of the prompt for debugging, can refine later
    .eq('is_active', true) // Ensure only active prompts are considered
    .eq('genre', selectedGenre); // Filter by genre

  console.log("Initial query for available prompts (before excluding submitted): genre =", selectedGenre, "is_active = true");

  // Add the filter to exclude submitted prompt IDs IF the array is not empty
  if (submittedPromptIds.length > 0) {
    query = query.not('id', 'in', `(${submittedPromptIds.join(',')})`);
    console.log("Querying prompts EXCLUDING IDs:", submittedPromptIds);
  } else {
    console.log("No submitted prompts to exclude for this user, or submittedPromptIds array is empty.");
  }

  const { data: availablePrompts, error: fetchPromptsError } = await query; // Renamed error variable

  console.log("AVAILABLE PROMPTS after filtering:", availablePrompts);
  console.log("Error fetching available prompts:", fetchPromptsError);


  // Handle potential fetching errors for available prompts
  if (fetchPromptsError) {
    console.error(`Error fetching available prompts for genre "${selectedGenre}":`, fetchPromptsError.message);
    return (
        <div className="container mx-auto p-6 text-center">
            <p className="text-red-500">Error loading writing prompt. Please try again later.</p>
            <Link href="/practice" className="text-blue-600 hover:underline mt-4 inline-block">Choose a different genre</Link>
        </div>
    );
  }

  // --- Handle case where NO *unsubmitted* prompts are left ---
  if (!availablePrompts || availablePrompts.length === 0) {
    console.log(`No unattempted '${selectedGenre}' prompts found. Displaying 'all completed' message.`);
    return (
        <div className="container mx-auto p-6 text-center">
            <p className="text-gray-600 font-semibold text-xl">Congratulations!</p>
            <p className="text-gray-500 mt-2">You seem to have completed all available &apos;{selectedGenre}&apos; prompts.</p>
            <p className="text-gray-500 mt-1">Check back later or try another genre.</p>
            <Link href="/practice" className="text-blue-600 hover:underline mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Choose a different genre
            </Link>
        </div>
    );
  }
  // --- END OF NO PROMPTS LEFT HANDLING ---

  // 4. Select a random prompt from the *available* list
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  // Ensure currentPrompt is correctly typed as Prompt.
  // The 'select(*)' will fetch all columns, so it should match the Prompt interface.
  const currentPrompt: Prompt = availablePrompts[randomIndex] as Prompt;
  console.log("Selected prompt for session:", currentPrompt);


  // 5. Render the Writing Session with the selected prompt
  return (
    // Increased max-width for the overall writing page content
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto"> {/* INCREASED WIDTH HERE from max-w-3xl */}
        <WritingSession currentPrompt={currentPrompt} />
      </div>
    </div>
  );
}