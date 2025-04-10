// src/components/WritingSession.tsx (Updated with useRef for stable callbacks)
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react'; // Import useRef
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Timer from './Timer'; // Import the Timer component
// Assuming RichTextEditor uses the minimal PlainTextPlugin version that worked:
import RichTextEditor from './RichTextEditor';

// Define the structure of the prompt data we expect as a prop
interface Prompt {
  id: number; // Or string
  genre: string;
  prompt_text: string;
}

interface WritingSessionProps {
  currentPrompt: Prompt;
}

// Define a basic empty Lexical state as a starting point
const initialEmptyState = '{"root":{"children":[{"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';


const WritingSession: React.FC<WritingSessionProps> = ({ currentPrompt }) => {
  const [editorStateJson, setEditorStateJson] = useState<string>(initialEmptyState);
  // Ref to hold the latest editor state for use in callbacks without dependency issues
  const editorStateRef = useRef(editorStateJson);

  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Effect to ensure component is mounted before rendering editor
  useEffect(() => {
     setIsMounted(true);
  }, []);

  // Effect to keep the ref updated with the latest state
  useEffect(() => {
    editorStateRef.current = editorStateJson;
  }, [editorStateJson]);

  // Callback for RichTextEditor onChange
  const handleEditorChange = useCallback((newStateJson: string) => {
    setEditorStateJson(newStateJson);
  }, []); // Empty dependency array is fine here

  // Unified Submit Function - uses ref for editor state
  // Dependencies are stable now (router, supabase, currentPrompt might change if session changes page)
  const submitWriting = useCallback(async () => {
    // Read isSubmitting directly from state (no dependency needed)
    if (isSubmitting) {
        console.log("Submission already in progress, skipping duplicate call.");
        return;
      }

    setIsSubmitting(true);
    setSubmitError(null);
    // Access the LATEST state via the ref
    const currentContentJson = editorStateRef.current;
    console.log("Attempting to submit content (JSON):", currentContentJson);

    // 1. Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user or no user found:', userError?.message);
      setSubmitError('Could not identify user. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    // 2. Prepare data for insertion
    let parsedContent;
    try {
        // Ensure the content is valid JSON before inserting
        parsedContent = JSON.parse(currentContentJson);
    } catch(e) {
        console.error("Error parsing editor content JSON:", e);
        setSubmitError('Error processing content before saving.');
        setIsSubmitting(false);
        return;
    }

    const submissionData = {
      user_id: user.id,
      prompt_id: currentPrompt.id,
      content_json: parsedContent, // Use parsed JSON for jsonb column
       // time_taken: ... // Calculate if needed
    };

    // 3. Insert data into Supabase
    const { error: insertError } = await supabase
      .from('submissions')
      .insert(submissionData);


    // 4. Handle results
    if (insertError) {
      console.error('Error inserting submission:', insertError.message);
      if (insertError.message.includes('permission denied')) {
           setSubmitError('Error saving submission. (Hint: Check RLS Policies for insert on submissions table).');
      } else {
          setSubmitError(`Error saving submission: ${insertError.message}`);
      }
      setIsSubmitting(false); // Ensure state reset on error
    } else {
      console.log('Submission successful!');
      // Reset submitting state *before* alert/redirect
      setIsSubmitting(false);
      alert('Submission Successful!'); // Simple feedback
      // Redirect to dashboard after successful submission
      router.push('/dashboard');
    }
  }, [currentPrompt, supabase, router, isSubmitting]); // Only include stable refs or state needed to *initiate* the action

  // Timer callback - stable because submitWriting is stable
  const handleTimeUp = useCallback(() => {
    console.log("Time's up! Auto-submitting...");
    submitWriting();
  }, [submitWriting]);

  // Manual submit handler (if button added) - stable because submitWriting is stable
  const handleSubmit = () => {
     console.log("Manual submission triggered.");
     submitWriting();
  }

  // Render only after mount
  if (!isMounted) {
    return <div className="bg-white p-6 rounded-lg shadow-md text-center">Loading Editor...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Display Prompt Info */}
      <h2 className="text-xl font-semibold mb-2">Your Prompt:</h2>
      <p className="text-gray-500 mb-1 text-sm">Genre: {currentPrompt.genre}</p>
      <p className="text-lg text-gray-800 mb-6 whitespace-pre-wrap">
        {currentPrompt.prompt_text}
      </p>

      {/* Display Timer */}
      <div className="mb-6">
        <Timer initialMinutes={30} onTimeUp={handleTimeUp} />
      </div>

      {/* Display Rich Text Editor - pass state and handler */}
      <div>
        <RichTextEditor
          // key={currentPrompt.id} // Optional: Add if prompt change needs full editor reset
          initialState={editorStateJson}
          onChange={handleEditorChange} />
      </div>

      {/* Submission Status */}
      {isSubmitting && <div className="mt-4 text-center text-blue-600">Submitting...</div>}
      {submitError && <div className="mt-4 text-center text-red-600">{submitError}</div>}

       {/* Optional: Manual Submit Button */}
       <div className="mt-6 text-right">
            <button
                onClick={handleSubmit}
                disabled={isSubmitting} // Disable button while submitting
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Now'}
            </button>
        </div>
    </div>
  );
};

export default WritingSession;