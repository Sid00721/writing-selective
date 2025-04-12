// src/components/WritingSession.tsx (Added Word Count Feature)
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // Browser client
import Timer from './Timer';                       // Timer component
import RichTextEditor from './RichTextEditor';       // RichTextEditor component
import toast from 'react-hot-toast';               // Toast notifications

// Interfaces (keep as they are)
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

  // --- NEW: Word Count State ---
  const [wordCount, setWordCount] = useState(0);
  // --- END NEW ---

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    editorStateRef.current = editorStateJson;
  }, [editorStateJson]);

  // Handler for the full JSON state (for submission)
  const handleEditorChange = useCallback((newStateJson: string) => {
    setEditorStateJson(newStateJson);
  }, []);

  // --- NEW: Handler for Text Content -> Word Count ---
  const handleTextContentChange = useCallback((text: string) => {
    // Simple word count: trim whitespace, split by one or more spaces/newlines, filter empty results
    const count = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  }, []); // No dependencies needed
  // --- END NEW ---

  // Unified Submit Function (Client-side version)
  const submitWriting = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // ... (keep user check, content check, parse logic as before) ...
     const { data: { user }, error: userError } = await supabase.auth.getUser();
     if (userError || !user) { /* ... handle error ... */ setIsSubmitting(false); return; }
     const currentContentJson = editorStateRef.current;
     if (!currentContentJson || currentContentJson === initialEmptyState) { /* ... handle error ... */ setIsSubmitting(false); return; }
     let parsedContent;
     try { parsedContent = JSON.parse(currentContentJson); }
     catch(e) { /* ... handle error ... */ setIsSubmitting(false); return; }


    const submissionData = {
      user_id: user.id,
      prompt_id: currentPrompt.id,
      content_json: parsedContent,
    };

    console.log("Submitting data:", JSON.stringify(submissionData, null, 2));
    const { error: insertError } = await supabase
        .from('submissions')
        .insert(submissionData);

    if (insertError) {
      console.error('Error inserting submission:', insertError.message);
      toast.error(`Submission failed: ${insertError.message}`);
      setIsSubmitting(false); // Reset on error
    } else {
      console.log('Submission successful!');
      toast.success('Submission successful!');
      setIsSubmitting(false); // Reset state first
      // Use window.location.href for reliable refresh after submission
      window.location.href = '/dashboard';
      // router.refresh(); // These client-side methods were unreliable
      // router.push('/dashboard');
    }
  }, [currentPrompt, supabase, isSubmitting, router]); // Added router to dependencies if still used for push/refresh

  // Timer callback
  const handleTimeUp = useCallback(() => {
    console.log("Time's up! Auto-submitting...");
    toast("Time is up! Submitting your work automatically.", { duration: 3000, icon: '⏳' });
    submitWriting();
  }, [submitWriting]);

  // Manual submit handler
  const handleSubmit = (event?: React.MouseEvent<HTMLButtonElement>) => { // Added optional event arg
    event?.preventDefault(); // Prevent default if called from a form/button event
    console.log("Manual submission triggered.");
    submitWriting();
  }

  if (!isMounted) {
    return <div className="bg-white p-6 rounded-lg shadow-md text-center">Loading Editor...</div>;
  }

  // --- Main Render ---
  return (
    <div className="space-y-6">
        {/* Prompt Section Card (Keep as is) */}
        <div className="bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-lg shadow-sm">
            {/* ... prompt details ... */}
             <h2 className="text-lg sm:text-xl font-semibold mb-2 text-blue-900">Your Writing Prompt:</h2>
             <p className="text-sm text-blue-700 mb-1"> Genre: <span className="font-medium">{currentPrompt.genre}</span></p>
             <p className="text-base sm:text-lg text-gray-800 whitespace-pre-wrap">{currentPrompt.prompt_text}</p>
        </div>

        {/* Timer Section (Keep as is) */}
        <div className="text-center sm:text-right">
            <Timer initialMinutes={30} onTimeUp={handleTimeUp} />
        </div>

        {/* Editor Section */}
        <div>
            <RichTextEditor
                initialState={editorStateJson}
                onChange={handleEditorChange}
                onTextContentChange={handleTextContentChange} // <-- Pass the new handler
            />
        </div>

        {/* --- NEW: Word Count Display --- */}
        <div className="text-right text-sm text-gray-600 -mt-4 pr-1"> {/* Adjust margin/padding as needed */}
           Word Count: {wordCount}
        </div>
        {/* --- END NEW --- */}


        {/* Manual Submit Button */}
        {/* Note: This button doesn't need type="submit" if not inside a <form> */}
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