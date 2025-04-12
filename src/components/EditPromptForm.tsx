// src/components/EditPromptForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Re-use the Prompt type (consider defining it in a shared types file later)
interface Prompt {
    id: number; // Or string
    created_at: string;
    genre: string;
    prompt_text: string;
    is_active: boolean;
}

interface EditPromptFormProps {
  initialPrompt: Prompt; // Receive the prompt data to edit
}

// Define the genres consistently
const validGenres = ['Creative', 'Persuasive', 'Article', 'Diary Entry', 'News Report'];

const EditPromptForm: React.FC<EditPromptFormProps> = ({ initialPrompt }) => {
    const router = useRouter();
    const supabase = createClient();

    // Form state initialized with existing prompt data
    const [genre, setGenre] = useState<string>(initialPrompt.genre);
    const [promptText, setPromptText] = useState(initialPrompt.prompt_text);
    const [isActive, setIsActive] = useState(initialPrompt.is_active);

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

        const updatedPromptData = {
            genre: genre,
            prompt_text: promptText.trim(),
            is_active: isActive,
            // Do NOT include id or created_at in the update payload
        };

        // Use Supabase client to update (Admin RLS policy must allow this)
        const { error } = await supabase
            .from('prompts')
            .update(updatedPromptData)
            .eq('id', initialPrompt.id); // Specify which row to update

        setIsLoading(false);

        if (error) {
            console.error("Error updating prompt:", error);
            if (error.message.includes('permission denied')) {
                setErrorMessage('Permission denied. Ensure you have admin rights and RLS policies are correct.');
            } else {
                 setErrorMessage(`Failed to update prompt: ${error.message}`);
            }
        } else {
            setSuccessMessage('Prompt updated successfully!');
            // Redirect back to the prompts list after a short delay
            setTimeout(() => {
                router.push('/admin/prompts');
                router.refresh(); // Force refresh the list page to show updated data
            }, 1500); // 1.5 second delay
        }
    };

    return (
        // Form structure is very similar to the Add New Prompt form
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Genre Selection */}
            <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <select id="genre" name="genre" value={genre} onChange={(e) => setGenre(e.target.value)} disabled={isLoading}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm border"
                >
                    {validGenres.map((g) => (<option key={g} value={g}>{g}</option>))}
                </select>
            </div>

            {/* Prompt Text */}
            <div>
                <label htmlFor="promptText" className="block text-sm font-medium text-gray-700 mb-1">Prompt Text</label>
                <textarea id="promptText" name="promptText" rows={6} value={promptText} onChange={(e) => setPromptText(e.target.value)} disabled={isLoading} required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            {/* Is Active Checkbox */}
            <div className="flex items-center">
                 <input id="isActive" name="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={isLoading}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
            </div>

             {/* Messages */}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-2">
                 <Link href="/admin/prompts" className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                     Cancel
                 </Link>
                 <button type="submit" disabled={isLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                 >
                    {isLoading ? 'Updating...' : 'Update Prompt'}
                </button>
            </div>
        </form>
    );
};

export default EditPromptForm;