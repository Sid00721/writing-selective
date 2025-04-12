// src/components/DeletePromptButton.tsx
"use client"; // This component handles user interaction and state

import React, { useState } from 'react'; // Import React and useState
import { useRouter } from 'next/navigation'; // Import useRouter for page refresh
import { createClient } from '@/lib/supabase/client'; // Import Supabase browser client

// Define the props the component expects
interface DeletePromptButtonProps {
    promptId: number | string; // The ID of the prompt to delete
}

export default function DeletePromptButton({ promptId }: DeletePromptButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false); // State to track delete operation
    const router = useRouter(); // Hook to control navigation/refresh
    const supabase = createClient(); // Get Supabase browser client instance

    const handleDelete = async () => {
        // 1. Confirm with the user
        if (!window.confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
            return; // Stop if user cancels
        }

        setIsDeleting(true); // Set loading state

        // 2. Perform the delete operation using Supabase client
        const { error } = await supabase
            .from('prompts')    // Target the 'prompts' table
            .delete()          // Perform delete
            .eq('id', promptId); // Specify which row to delete based on ID

        setIsDeleting(false); // Reset loading state

        // 3. Handle results
        if (error) {
            console.error("Error deleting prompt:", error);
            // Provide feedback to the user (replace alert with better UI later)
            alert(`Failed to delete prompt: ${error.message}`);
        } else {
            console.log(`Prompt ${promptId} deleted`);
            // Provide feedback
            alert("Prompt deleted successfully!");
            // Refresh the data on the current page (the prompts list)
            // This tells Next.js to re-run the Server Component data fetch
            router.refresh();
        }
    };

    return (
         <button
            type="button" // Explicitly type as button
            onClick={handleDelete}
            disabled={isDeleting} // Disable button while deleting
            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
    );
}