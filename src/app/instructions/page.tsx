// src/app/instructions/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Example Instructions - Modify as needed
const instructionsList = [
    "You will have 30 minutes to complete your writing task.",
    "Read the prompt carefully before you start writing.",
    "Plan your response structure (introduction, body paragraphs, conclusion).",
    "Write clearly and try to use varied vocabulary and sentence structures.",
    "Check your spelling, grammar, and punctuation before finishing.",
    "The timer will start as soon as you click 'Start Test'."
];

export default function InstructionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const genre = searchParams.get('genre'); // Get genre from URL query ?genre=...

    // Redirect back if genre is missing
    useEffect(() => {
        if (!genre) {
            console.log("No genre found, redirecting from instructions to practice.");
            router.replace('/practice'); // Use replace to avoid adding broken page to history
        }
    }, [genre, router]);

    const handleStartTest = () => {
        if (genre) {
            // Navigate to the writing page, passing the genre along
            router.push(`/writing?genre=${encodeURIComponent(genre)}`);
        } else {
            // Fallback just in case
            alert("Could not determine the genre. Please select one again.");
            router.push('/practice');
        }
    };

    // Render loading or null if genre is not yet confirmed (or redirecting)
    if (!genre) {
         return <div className="p-6 text-center">Loading or invalid genre...</div>;
    }

    return (
        // Using similar styling to auth pages
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

                <div className='pt-4'>
                    <button
                        onClick={handleStartTest}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                    >
                       Start Test
                    </button>
                </div>
                 <div className="text-sm text-center text-gray-600 pt-2">
                    <Link href="/practice" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                        Choose a different genre
                    </Link>
                </div>
            </div>
        </div>
    );
}