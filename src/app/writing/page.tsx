// src/app/writing/page.tsx (Updated for Genre Selection & Random Prompt)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WritingSession from '@/components/WritingSession';

// Define the structure of the prompt data
interface Prompt {
  id: number; // Or string
  genre: string;
  prompt_text: string;
}

// Define the props structure including searchParams
interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WritingPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  // 1. Check user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Get selected genre from query parameters
  const selectedGenre = typeof searchParams?.genre === 'string' ? searchParams.genre : null;

  // Redirect back to practice page if no valid genre is selected
  if (!selectedGenre) {
    console.log('No genre selected, redirecting to /practice');
    redirect('/practice');
  }

  // 3. Fetch active prompts for the selected genre
  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('*')
    .eq('is_active', true)
    .eq('genre', selectedGenre); // Filter by genre

  if (fetchError) {
    console.error(`Error fetching prompts for genre "${selectedGenre}":`, fetchError.message);
    return (
        <div className="container mx-auto p-6 text-center">
            <p className="text-red-500">Error loading writing prompt. Please try again later.</p>
            <Link href="/practice" className="text-blue-600 hover:underline mt-4 inline-block">Choose a different genre</Link>
        </div>
    );
  }

  if (!prompts || prompts.length === 0) {
    // Handle case where no active prompts are found for this genre
    return (
        <div className="container mx-auto p-6 text-center">
            <p className="text-gray-600">No active &apos;{selectedGenre}&apos; prompts available right now. Please try another genre.</p>
            <Link href="/practice" className="text-blue-600 hover:underline mt-4 inline-block">Choose a different genre</Link>
        </div>
    );
  }

  // 4. Select a random prompt from the fetched list
  const randomIndex = Math.floor(Math.random() * prompts.length);
  const currentPrompt: Prompt = prompts[randomIndex];

  // 5. Render the Writing Session with the selected prompt
  return (
    <div className="container mx-auto p-6">
       <h1 className="text-3xl font-bold mb-4 text-center">Writing Practice</h1>
       <p className="text-center text-gray-500 mb-6">Genre: {selectedGenre}</p>
       <WritingSession currentPrompt={currentPrompt} />
    </div>
  );
}

// Re-add Link import if not already present globally
import Link from 'next/link';