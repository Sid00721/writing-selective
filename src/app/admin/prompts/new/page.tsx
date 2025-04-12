// src/app/admin/prompts/new/page.tsx
"use client"; // This page requires client-side interactivity for the form

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // Use browser client
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the genres consistently with your database values
// Use the shorter values that match your DB (as fixed in the practice page)
const validGenres = ['Creative', 'Persuasive', 'Article', 'Diary Entry', 'News Report'];

export default function AddNewPromptPage() {
    const router = useRouter();
    const supabase = createClient();

    // Form state
    const [genre, setGenre] = useState<string>(validGenres[0]); // Default to the first genre
    const [promptText, setPromptText] = useState('');
    const [isActive, setIsActive] = useState(true); // Default to active

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!genre || !promptText.trim()) {
            setErrorMessage('Please select a genre and enter prompt text.');
            setIsLoading(false);
            return;
        }

        const newPromptData = {
            genre: genre,
            prompt_text: promptText.trim(),
            is_active: isActive,
        };

        // Use Supabase client to insert (Admin RLS policy must allow this)
        const { error } = await supabase.from('prompts').insert(newPromptData);

        setIsLoading(false);

        if (error) {
            console.error("Error inserting prompt:", error);
             if (error.message.includes('permission denied')) {
                setErrorMessage('Permission denied. Ensure you have admin rights and RLS policies are correct.');
            } else {
                 setErrorMessage(`Failed to add prompt: ${error.message}`);
            }
        } else {
            setSuccessMessage('Prompt added successfully!');
            // Optionally clear form
            // setGenre(validGenres[0]);
            // setPromptText('');
            // setIsActive(true);

            // Redirect back to the prompts list after a short delay
            setTimeout(() => {
                router.push('/admin/prompts');
                 // Optional: router.refresh(); // If you want to force a refresh on the list page
            }, 1500); // 1.5 second delay
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold">Add New Writing Prompt</h2>
                 <Link href="/admin/prompts" className="text-blue-600 hover:underline text-sm">
                     &larr; Back to Prompts List
                 </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Genre Selection */}
                <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                    </label>
                    <select
                        id="genre"
                        name="genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        disabled={isLoading}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm border"
                    >
                        {validGenres.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                {/* Prompt Text */}
                <div>
                    <label htmlFor="promptText" className="block text-sm font-medium text-gray-700 mb-1">
                        Prompt Text
                    </label>
                    <textarea
                        id="promptText"
                        name="promptText"
                        rows={6}
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        disabled={isLoading}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter the full text of the writing prompt..."
                    />
                </div>

                {/* Is Active Checkbox */}
                <div className="flex items-center">
                     <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Active (prompt can be selected for practice sessions)
                    </label>
                </div>

                 {/* Messages */}
                {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}


                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-2">
                     <Link href="/admin/prompts" className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                         Cancel
                     </Link>
                     <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                     >
                        {isLoading ? 'Saving...' : 'Save Prompt'}
                    </button>
                </div>
            </form>
        </div>
    );
}