// src/app/practice/page.tsx (Server Component - WITH createClient FIX)

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import { checkUserAccessStatus } from '@/lib/accessControl';
import GenreSelectionGrid from './GenreSelectionGrid'; // Client component for interaction

// Genres data definition (Ensure dbValue matches your database exactly)
const genres = [
    { name: 'Creative Writing', dbValue: 'Creative', description: 'Develop imaginative stories with engaging characters and plots.', color: 'bg-pink-100 border-pink-300' },
    { name: 'Persuasive Writing', dbValue: 'Persuasive', description: 'Craft compelling arguments to convince your audience.', color: 'bg-blue-100 border-blue-300' },
    { name: 'Article Writing', dbValue: 'Article', description: 'Create informative and engaging articles on various topics.', color: 'bg-green-100 border-green-300' },
    { name: 'Diary Entry', dbValue: 'Diary Entry', description: 'Write personal reflections from a specific perspective.', color: 'bg-yellow-100 border-yellow-300' },
    { name: 'News Report', dbValue: 'News Report', description: 'Develop factual news stories with the key information.', color: 'bg-purple-100 border-purple-300' },
];

// --- Server Component: PracticePage ---
export default async function PracticePage() {
    // --- Read Environment Variables ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // --- Check if variables exist ---
    if (!supabaseUrl || !supabaseKey) {
      console.error("Practice Page Error: Supabase URL or Anon Key missing!");
      return (
          <div className="container mx-auto p-6 text-center text-red-500">
              Server configuration error. Cannot load practice page.
          </div>
      );
    }

    // --- Create Client by PASSING variables (without await) ---
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check user session first
    console.log("PracticePage: Checking user session...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        // Redirect to login if not authenticated
        console.log("PracticePage: No user session, redirecting to login.");
        redirect('/login?message=Please log in to practice');
    }
    console.log(`PracticePage: User ${user.id} found.`);

    // --- ADD ACCESS CHECK ---
    console.log(`PracticePage: Checking access for user ${user.id}...`);
    const hasAccess = await checkUserAccessStatus(user.id);
    if (!hasAccess) {
        // User is logged in but doesn't have subscription/free access
        console.log(`User ${user.id} denied access to /practice, redirecting to /pricing`);
        redirect('/pricing'); // Redirect non-subscribed users to pricing page
    }
    console.log(`PracticePage: User ${user.id} has access.`);
    // --- END ACCESS CHECK ---

    // If user has access, render the page content including the client component for interaction
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
                Choose a Writing Genre
            </h1>
            <p className="text-lg text-gray-700 text-center mb-10 max-w-3xl mx-auto"> {/* Slightly adjusted color/width */}
                Select a genre to practice your writing skills. Each genre offers unique prompts to help you prepare for the NSW selective test.
            </p>

            {/* Render the client component responsible for the grid and navigation */}
            {/* Pass the genres data to the client component */}
            <GenreSelectionGrid genres={genres} />
        </div>
    );
}
// --- End Server Component ---