// src/app/instructions/page.tsx (Server Component with Quick Status-Based Redirects)

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkUserAccessStatus, getSubscriptionRedirectUrl, debugUserAccess } from '@/lib/accessControl';
import { getSubscriptionInfo } from '@/lib/subscriptionStatus';
import Link from 'next/link';
import InstructionsClient from './InstructionsClient'; // Client component for interaction

// Example Instructions List
const instructionsList = [
    "You will have 30 minutes to complete your writing task.",
    "Read the prompt carefully before you start writing.",
    "Plan your response structure (introduction, body paragraphs, conclusion).",
    "Write clearly and try to use varied vocabulary and sentence structures.",
    "Check your spelling, grammar, and punctuation before finishing.",
    "The timer will start as soon as you click 'Start Test'."
];

// Props type for search params
type InstructionsPageProps = {
  searchParams: { genre?: string };
};

// --- Server Component: InstructionsPage ---
export default async function InstructionsPage({ searchParams }: InstructionsPageProps) {
    // --- Create Supabase Client ---
    const supabase = createClient();

    // Check user session first
    console.log("InstructionsPage: Checking user session...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        // Redirect to login if not authenticated
        console.log("InstructionsPage: No user session, redirecting to login.");
        redirect('/login?message=Please log in to access instructions');
    }
    console.log(`InstructionsPage: User ${user.id} found.`);

    // --- QUICK STATUS-BASED REDIRECT CHECK ---
    console.log(`InstructionsPage: Checking subscription status for quick redirect...`);
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
    const hasAccess = await checkUserAccessStatus(user.id);
    if (!hasAccess) {
        const redirectUrl = await getSubscriptionRedirectUrl(user.id);
        console.log(`User ${user.id} denied access to /instructions, redirecting to ${redirectUrl}`);
        redirect(redirectUrl);
    }
    console.log(`InstructionsPage: User ${user.id} has access.`);

    // Check if genre is provided, redirect to practice if not
    const genre = searchParams.genre;
    if (!genre) {
        console.log("InstructionsPage: No genre provided, redirecting to practice.");
        redirect('/practice');
    }

    // If user has access and genre is provided, render the page content
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    Writing Test Instructions
                </h1>

                <div className="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                    <p className="font-semibold text-indigo-800">Selected Genre: {genre}</p>
                </div>

                <div className="space-y-3 text-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800">Please read carefully:</h2>
                    <ul className="list-disc list-inside space-y-1.5 pl-2">
                        {instructionsList.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Client component for the start test button */}
                <InstructionsClient genre={genre} />

                <div className="text-sm text-center text-gray-600 pt-2">
                    <Link href="/practice" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                        Choose a different genre
                    </Link>
                </div>
            </div>
        </div>
    );
}