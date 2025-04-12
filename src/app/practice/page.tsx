// src/app/practice/page.tsx (Server Component - Imports Client Component)

// Imports for the Server Component part
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
// Remove Link if not used directly here
// import Link from 'next/link';
import { checkUserAccessStatus } from '@/lib/accessControl';
// ---> ADD IMPORT for the separate client component <---
import GenreSelectionGrid from './GenreSelectionGrid';

// Genres data definition
// IMPORTANT: Ensure dbValue matches your database exactly
const genres = [
    { name: 'Creative Writing', dbValue: 'Creative', description: 'Develop imaginative stories with engaging characters and plots.', color: 'bg-pink-100 border-pink-300' },
    { name: 'Persuasive Writing', dbValue: 'Persuasive', description: 'Craft compelling arguments to convince your audience.', color: 'bg-blue-100 border-blue-300' },
    { name: 'Article Writing', dbValue: 'Article', description: 'Create informative and engaging articles on various topics.', color: 'bg-green-100 border-green-300' },
    { name: 'Diary Entry', dbValue: 'Diary Entry', description: 'Write personal reflections from a specific perspective.', color: 'bg-yellow-100 border-yellow-300' },
    { name: 'News Report', dbValue: 'News Report', description: 'Develop factual news stories with the key information.', color: 'bg-purple-100 border-purple-300' },
];

// --- Server Component: PracticePage ---
export default async function PracticePage() {
    const supabase = await createClient();

    // Check user session first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        // Redirect to login if not authenticated
        redirect('/login?message=Please log in to practice');
    }

    // --- ADD ACCESS CHECK ---
    const hasAccess = await checkUserAccessStatus(user.id);
    if (!hasAccess) {
        // User is logged in but doesn't have subscription/free access
        console.log(`User ${user.id} denied access to /practice, redirecting to /pricing`);
        redirect('/pricing'); // Redirect non-subscribed users to pricing page
    }
    // --- END ACCESS CHECK ---

    // If user has access, render the page content including the client component for interaction
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"> {/* Added dark text color */}
                Choose a Writing Genre
            </h1>
            <p className="text-lg text-gray-900 text-center mb-10">
                Select a genre to practice your writing skills. Each genre offers unique prompts to help you prepare for the NSW selective test.
            </p>

            {/* Render the client component responsible for the grid and navigation */}
            <GenreSelectionGrid genres={genres} />
        </div>
    );
}
// --- End Server Component ---
