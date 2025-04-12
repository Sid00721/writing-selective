// src/components/WritingSession.tsx (With router.refresh() on successful submission)
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // Browser client
import Timer from './Timer';                       // Timer component
import RichTextEditor from './RichTextEditor';       // RichTextEditor component
import toast from 'react-hot-toast';               // Toast notifications

// Define the structure of the prompt data received as a prop
interface Prompt {
  id: number; // Or string
  genre: string;
  prompt_text: string;
}

interface WritingSessionProps {
  currentPrompt: Prompt;
}

// Define a basic empty Lexical state (JSON string) as a starting point
const initialEmptyState = '{"root":{"children":[{"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';


const WritingSession: React.FC<WritingSessionProps> = ({ currentPrompt }) => {
  // State for editor content (serialized JSON string)
  const [editorStateJson, setEditorStateJson] = useState<string>(initialEmptyState);
  // Ref to hold the latest editor state for use in callbacks without causing dependency changes
  const editorStateRef = useRef(editorStateJson);

  const [isMounted, setIsMounted] = useState(false); // State to track client-side mount
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission loading

  const router = useRouter();
  const supabase = createClient();

  // Effect to ensure component only renders editor after mounting on client
  useEffect(() => {
      setIsMounted(true);
  }, []);

  // Effect to keep the ref updated whenever the actual state changes
  useEffect(() => {
    editorStateRef.current = editorStateJson;
  }, [editorStateJson]);

  // Callback passed to RichTextEditor to update state here
  const handleEditorChange = useCallback((newStateJson: string) => {
    setEditorStateJson(newStateJson);
  }, []); // This callback doesn't need dependencies

  // Unified Submit Function - Called by timer or button
  const submitWriting = useCallback(async () => {
    if (isSubmitting) {
        console.log("Submission already in progress, skipping.");
        return;
    }

    setIsSubmitting(true); // Set loading state
    console.log("Attempting to submit content (JSON):", editorStateRef.current);

    // 1. Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user or no user found:', userError?.message);
      toast.error('Submission failed: Could not verify user. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    // Use the latest content from the ref
    const currentContentJson = editorStateRef.current;

    // Basic content check
     if (!currentContentJson || currentContentJson === initialEmptyState) {
        console.warn("Attempting to submit empty or initial content.");
        toast.error("Submission failed: Cannot submit empty content.");
        setIsSubmitting(false);
        return;
    }

    // 2. Prepare data for insertion
    let parsedContent;
    try {
        parsedContent = JSON.parse(currentContentJson); // Parse string to JSON for DB
    } catch(e) {
        console.error("Error parsing editor content JSON:", e);
        toast.error('Submission failed: Error processing content.');
        setIsSubmitting(false);
        return;
    }

    const submissionData = {
      user_id: user.id,
      prompt_id: currentPrompt.id,
      content_json: parsedContent, // Save the parsed JSON object
    };

    console.log("Submitting data:", JSON.stringify(submissionData, null, 2));
    // 3. Insert data into Supabase
    const { error: insertError } = await supabase
        .from('submissions')
        .insert(submissionData);

    // 4. Handle results
    if (insertError) {
      console.error('Error inserting submission:', insertError.message);
      if (insertError.message.includes('permission denied')) {
          toast.error('Submission failed. (Permission Error - Check RLS)');
      } else {
          toast.error(`Submission failed: ${insertError.message}`);
      }
      setIsSubmitting(false); // Reset submitting state on error
    } else {
      // --- SUCCESS PATH ---
      console.log('Submission successful!');
      toast.success('Submission successful!');

      // --- ADDED REFRESH LOGIC ---
      // --- Try Resetting State BEFORE Refresh/Push ---
      // 1. Reset submitting state first
      setIsSubmitting(false);

      // 2. Refresh the router's cache
      router.refresh();

      // 3. Navigate to the dashboard
      router.push('/dashboard');
      // --- End Modified Order ---
    }
  // Review dependencies if needed, though accessing state via ref minimizes changes
  }, [currentPrompt, supabase, router, isSubmitting]);

  // Timer callback
  const handleTimeUp = useCallback(() => {
    console.log("Time's up! Auto-submitting...");
    toast("Time is up! Submitting your work automatically.", { duration: 3000, icon: '⏳' });
    submitWriting();
  }, [submitWriting]);

  // Manual submit handler
  const handleSubmit = () => {
     console.log("Manual submission triggered.");
     submitWriting();
  }

  // Render placeholder or nothing until mounted on client
  if (!isMounted) {
    return <div className="bg-white p-6 rounded-lg shadow-md text-center">Loading Editor...</div>;
  }

  // --- Main Render ---
  return (
    <div className="space-y-6">

        {/* Optional Loading Overlay - Uncomment if desired */}
        {/* {isSubmitting && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-indigo-700 text-lg font-medium">Saving your work...</p>
          </div>
        )} */}

      {/* Prompt Section Card */}
      <div className="bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-lg shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 text-blue-900">Your Writing Prompt:</h2>
        <p className="text-sm text-blue-700 mb-1">
            Genre: <span className="font-medium">{currentPrompt.genre}</span>
        </p>
        <p className="text-base sm:text-lg text-gray-800 whitespace-pre-wrap">
            {currentPrompt.prompt_text}
        </p>
      </div>

      {/* Timer Section */}
      <div className="text-center sm:text-right">
        <Timer initialMinutes={30} onTimeUp={handleTimeUp} />
      </div>

      {/* Editor Section */}
      <div>
        <RichTextEditor
          // key={currentPrompt.id} // Optional: Add if prompt change needs full editor reset
          initialState={editorStateJson}
          onChange={handleEditorChange} />
      </div>

       {/* Manual Submit Button */}
       <div className="mt-6 text-right">
            <button
                onClick={handleSubmit}
                disabled={isSubmitting} // Disable button while submitting
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Now'}
            </button>
        </div>

    </div>
  );
};

export default WritingSession;

// Type Definitions (Keep as is)
declare module 'react' {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        directory?: string;
        webkitdirectory?: string;
    }
}