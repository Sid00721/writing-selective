// src/app/practice/page.tsx (Server Component - WITH createClient FIX)

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import { checkUserAccessStatus, getSubscriptionRedirectUrl, debugUserAccess } from '@/lib/accessControl';
import { getSubscriptionInfo } from '@/lib/subscriptionStatus';
import GenreSelectionGrid from './GenreSelectionGrid'; // Client component for interaction

// Genres data definition (Ensure dbValue matches your database exactly)
const genres = [
    { name: 'Creative Writing', dbValue: 'Creative', description: 'Develop imaginative stories with engaging characters and plots.', bgColor: 'bg-pink-100', borderColor: 'border-pink-300', textColor: 'text-pink-700', buttonHoverBg: 'hover:bg-pink-200' },
    { name: 'Persuasive Writing', dbValue: 'Persuasive', description: 'Craft compelling arguments to convince your audience.', bgColor: 'bg-sky-100', borderColor: 'border-sky-300', textColor: 'text-sky-700', buttonHoverBg: 'hover:bg-sky-200' }, // Changed blue to sky for better Tailwind naming
    { name: 'Article Writing', dbValue: 'Article', description: 'Create informative and engaging articles on various topics.', bgColor: 'bg-green-100', borderColor: 'border-green-300', textColor: 'text-green-700', buttonHoverBg: 'hover:bg-green-200' },
    { name: 'Diary Entry', dbValue: 'Diary Entry', description: 'Write personal reflections from a specific perspective.', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300', textColor: 'text-yellow-700', buttonHoverBg: 'hover:bg-yellow-200' },
    { name: 'News Report', dbValue: 'News Report', description: 'Develop factual news stories with the key information.', bgColor: 'bg-purple-100', borderColor: 'border-purple-300', textColor: 'text-purple-700', buttonHoverBg: 'hover:bg-purple-200' },
];

// --- Server Component: PracticePage ---
export default async function PracticePage() {
    // --- Create Supabase Client ---
    const supabase = createClient();

    // Check user session first
    console.log("PracticePage: Checking user session...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        // Redirect to login if not authenticated
        console.log("PracticePage: No user session, redirecting to login.");
        redirect('/login?message=Please log in to practice');
    }
    console.log(`PracticePage: User ${user.id} found.`);

    // --- QUICK STATUS-BASED REDIRECT CHECK ---
    console.log(`PracticePage: Checking subscription status for quick redirect...`);
    const subscriptionInfo = await getSubscriptionInfo(user.id);
    
    if (subscriptionInfo) {
        // Quick redirect for users who need to handle subscription first
        if (subscriptionInfo.subscriptionStatus === 'trial') {
            console.log(`User ${user.id} has 'trial' status, redirecting to start trial`);
            redirect('/pricing');
        }
        
        if (!subscriptionInfo.hasAccess) {
            console.log(`User ${user.id} has no access, redirecting to subscription page`);
            redirect('/pricing');
        }
    }

    // --- FALLBACK ACCESS CHECK (if subscription info failed) ---
    console.log(`PracticePage: Checking access for user ${user.id}...`);
    
    // Debug the access check
    await debugUserAccess(user.id);
    
    const hasAccess = await checkUserAccessStatus(user.id);
    if (!hasAccess) {
        // User is logged in but doesn't have subscription/free access
        const redirectUrl = await getSubscriptionRedirectUrl(user.id);
        console.log(`User ${user.id} denied access to /practice, redirecting to ${redirectUrl}`);
        redirect(redirectUrl); // Redirect to appropriate subscription page
    }
    console.log(`PracticePage: User ${user.id} has access.`);
    // --- END ACCESS CHECK ---

    // If user has access, render the page content including the client component for interaction
     return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                    Choose a Writing Genre
                </h1>
                <p className="text-lg text-gray-700 mb-10 md:mb-12">
                    Select a genre to practice your writing skills. Each genre offers unique prompts to help you prepare for the NSW selective test.
                </p>
            </div>
            <GenreSelectionGrid genres={genres} />
        </div>
    );
}
// --- End Server Component ---