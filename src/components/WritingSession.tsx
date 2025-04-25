// src/components/WritingSession.tsx (UPDATED WITH FEEDBACK TRIGGER)
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation'; // Keep if needed, removed for now
import { createClient } from '@/lib/supabase/client'; // Browser client
import Timer from './Timer';                       // Timer component
import RichTextEditor from './RichTextEditor';       // RichTextEditor component
import toast from 'react-hot-toast';               // Toast notifications
// **** NEW: Import the server action ****
import { generateFeedbackForSubmission } from '@/app/_actions/feedbackActions'; // Adjust path if needed


// Interfaces
interface Prompt {
  id: number; // Or string
  genre: string;
  prompt_text: string;
}
interface WritingSessionProps {
  currentPrompt: Prompt;
}

// Define a basic empty Lexical state
const initialEmptyState = '{"root":{"children":[{"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

const WritingSession: React.FC<WritingSessionProps> = ({ currentPrompt }) => {
  const [editorStateJson, setEditorStateJson] = useState<string>(initialEmptyState);
  const editorStateRef = useRef(editorStateJson); // Keep ref for submit function
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // const router = useRouter(); // Not needed if using window.location
  const supabase = createClient();

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    editorStateRef.current = editorStateJson;
  }, [editorStateJson]);

  // Handler for the full JSON state
  const handleEditorChange = useCallback((newStateJson: string) => {
    setEditorStateJson(newStateJson);
  }, []);

  // Handler for Text Content -> Word Count
  const handleTextContentChange = useCallback((text: string) => {
    const count = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  }, []);

  // --- Unified Submit Function (Client-side version) ---
  const submitWriting = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Submitting...');
    console.log("submitWriting: Function called."); // <-- ADDED LOG

    // --- User and Content Checks ---
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("submitWriting: User check failed.", userError); // <-- ADDED LOG
      toast.error('You must be logged in to submit.', { id: loadingToastId });
      setIsSubmitting(false);
      return;
    }
    const currentContentJson = editorStateRef.current;
    if (!currentContentJson || currentContentJson === initialEmptyState) {
      console.warn("submitWriting: Content is empty."); // <-- ADDED LOG
      toast.error('Cannot submit empty writing.', { id: loadingToastId });
      setIsSubmitting(false);
      return;
    }
    let parsedContent;
    try {
      parsedContent = JSON.parse(currentContentJson);
    } catch (e) {
      console.error("submitWriting: Failed to parse editor JSON.", e); // <-- ADDED LOG
      toast.error('Error processing editor content.', { id: loadingToastId });
      setIsSubmitting(false);
      return;
    }
    // --- End Checks ---

    // *** ADDED initial feedback status ***
    const submissionData = {
      user_id: user.id,
      prompt_id: currentPrompt.id,
      content_json: parsedContent,
      feedback_status: 'pending' // Set initial status
    };

    console.log("submitWriting: Attempting to insert submission...", submissionData); // <-- ADDED LOG

    // *** MODIFIED: Insert and SELECT the ID ***
    const { data: insertResult, error: insertError } = await supabase
        .from('submissions')
        .insert(submissionData)
        .select('id') // Select the ID of the inserted row
        .single();    // Expect exactly one row back

    // Log insert result
    console.log("submitWriting: Insert result:", { insertResult, insertError }); // <-- ADDED LOG

    if (insertError || !insertResult) {
      console.error('submitWriting: Error inserting submission:', insertError?.message);
      toast.error(`Submission failed: ${insertError?.message || 'Unknown error'}`, { id: loadingToastId });
      setIsSubmitting(false); // Reset on error
    } else {
      // **** SUCCESSFUL INSERT ****
      const newSubmissionId = insertResult.id; // Get the ID
      console.log(`submitWriting: Submission successful! ID: ${newSubmissionId}`); // <-- ADDED LOG
      // Update toast message
      toast.success('Submission saved! Starting feedback generation...', { id: loadingToastId });

      // **** NEW: Trigger feedback generation asynchronously ****
      console.log(`submitWriting: Calling generateFeedbackForSubmission with ID: ${newSubmissionId}`); // <-- ADDED LOG
      generateFeedbackForSubmission(newSubmissionId).then(feedbackResult => {
          // This runs in the background after the user might have navigated away
          console.log(`submitWriting: Background feedback result for ${newSubmissionId}:`, feedbackResult); // <-- ADDED LOG
          if (feedbackResult.error) {
              console.error(`submitWriting: Background feedback generation failed for ${newSubmissionId}:`, feedbackResult.error);
              // Optional: Update DB status to 'error' via another action?
          } else if (feedbackResult.success) {
              console.log(`submitWriting: Background feedback generation triggered/completed successfully for ${newSubmissionId}.`);
          }
      }).catch(error => {
          // Catch errors *calling* the action itself
          console.error(`submitWriting: Error calling generateFeedbackForSubmission action for ${newSubmissionId}:`, error); // <-- ADDED LOG
      });

      // Reset submitting state BUT delay redirection slightly to allow toast visibility? Optional.
      setIsSubmitting(false);
      console.log("submitWriting: Redirecting to dashboard..."); // <-- ADDED LOG
      // Redirect immediately (feedback runs in background)
      window.location.href = '/dashboard';
    }
   // Ensure currentPrompt and supabase are stable or correctly listed if needed
  }, [currentPrompt, supabase, isSubmitting]); // Removed router dependency


  // Timer callback
  const handleTimeUp = useCallback(() => {
    console.log("Time's up! Auto-submitting...");
    toast("Time is up! Submitting your work automatically.", { duration: 3000, icon: '⏳' });
    submitWriting();
  }, [submitWriting]);

  // Manual submit handler
  const handleSubmit = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    console.log("Manual submission triggered.");
    submitWriting();
  }

  useEffect(() => { setIsMounted(true); }, []);


  if (!isMounted) {
    return <div className="bg-white p-6 rounded-lg shadow-md text-center">Loading Editor...</div>;
  }

  // --- Main Render (JSX remains largely the same) ---
  return (
    <div className="space-y-6">
        {/* Prompt Section Card */}
        <div className="bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-lg shadow-sm">
           <h2 className="text-lg sm:text-xl font-semibold mb-2 text-blue-900">Your Writing Prompt:</h2>
           <p className="text-sm text-blue-700 mb-1"> Genre: <span className="font-medium">{currentPrompt.genre}</span></p>
           <p className="text-base sm:text-lg text-gray-800 whitespace-pre-wrap">{currentPrompt.prompt_text}</p>
        </div>

        {/* Timer Section */}
        <div className="text-center sm:text-right">
           <Timer initialMinutes={30} onTimeUp={handleTimeUp} />
        </div>

        {/* Editor Section */}
        <div>
           <RichTextEditor
             initialState={editorStateJson}
             onChange={handleEditorChange}
             onTextContentChange={handleTextContentChange}
           />
        </div>

        {/* Word Count Display */}
        <div className="text-right text-sm text-gray-600 -mt-4 pr-1">
           Word Count: {wordCount}
        </div>

        {/* Manual Submit Button */}
        <div className="mt-6 text-right">
           <button
             onClick={handleSubmit}
             disabled={isSubmitting}
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