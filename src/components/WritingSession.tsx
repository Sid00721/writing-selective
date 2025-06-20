// src/components/WritingSession.tsx
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Timer from './Timer';
import RichTextEditor from './RichTextEditor';
import toast from 'react-hot-toast';
import { generateFeedbackForSubmission } from '@/app/_actions/feedbackActions';
import { CheckCircle, AlertCircle, Edit2 } from 'lucide-react'; // Using Edit2 for Word Count icon

interface Prompt {
  id: number;
  genre: string;
  prompt_text: string;
}
interface WritingSessionProps {
  currentPrompt: Prompt;
}

const initialEmptyState = '{"root":{"children":[{"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

const getGenreBadgeClass = (genre: string): string => {
  // Using lighter backgrounds for these small badges for better text contrast with darker text
  switch (genre.toLowerCase()) {
    case 'persuasive': return 'bg-sky-100 text-sky-700';
    case 'creative': return 'bg-purple-100 text-purple-700';
    case 'informative': return 'bg-amber-100 text-amber-700';
    case 'article': return 'bg-teal-100 text-teal-700';
    case 'diary entry': return 'bg-pink-100 text-pink-700';
    case 'news report': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const WritingSession: React.FC<WritingSessionProps> = ({ currentPrompt }) => {
  const [editorStateJson, setEditorStateJson] = useState<string>(initialEmptyState);
  const editorStateRef = useRef(editorStateJson);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'saving' | 'generating' | 'redirecting'>('idle');
  const [wordCount, setWordCount] = useState(0);

  const supabase = createClient();

  useEffect(() => { setIsMounted(true); }, []);

  // Prevent navigation during submission
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting) {
        e.preventDefault();
        e.returnValue = 'Your submission is being processed. Are you sure you want to leave?';
        return 'Your submission is being processed. Are you sure you want to leave?';
      }
    };

    if (isSubmitting) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      // Also disable the back button during submission
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        if (isSubmitting) {
          window.history.pushState(null, '', window.location.href);
        }
      };
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isSubmitting]);

  useEffect(() => { editorStateRef.current = editorStateJson; }, [editorStateJson]);
  const handleEditorChange = useCallback((newStateJson: string) => setEditorStateJson(newStateJson), []);
  const handleTextContentChange = useCallback((text: string) => {
    const count = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  }, []);

  const submitWriting = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionStatus('saving');
    
    const loadingToastId = toast.loading('Saving your submission...', {
      duration: Infinity, // Keep toast until we manually dismiss it
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to submit.', { id: loadingToastId, icon: <AlertCircle /> });
      setIsSubmitting(false);
      setSubmissionStatus('idle');
      return;
    }
    const currentContentJson = editorStateRef.current;
    if (!currentContentJson || currentContentJson === initialEmptyState || wordCount === 0) {
      toast.error('Cannot submit empty writing.', { id: loadingToastId, icon: <AlertCircle /> });
      setIsSubmitting(false);
      setSubmissionStatus('idle');
      return;
    }
    let parsedContent;
    try { parsedContent = JSON.parse(currentContentJson); }
    catch (e) {
      toast.error('Error processing editor content.', { id: loadingToastId, icon: <AlertCircle /> });
      setIsSubmitting(false);
      setSubmissionStatus('idle');
      return;
    }

    const submissionData = {
      user_id: user.id, prompt_id: currentPrompt.id, content_json: parsedContent,
      feedback_status: 'pending', word_count: wordCount
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('submissions').insert(submissionData).select('id').single();

    if (insertError || !insertResult) {
      toast.error(`Submission failed: ${insertError?.message || 'Unknown error'}`, { id: loadingToastId, icon: <AlertCircle /> });
      setIsSubmitting(false);
      setSubmissionStatus('idle');
    } else {
      const newSubmissionId = insertResult.id;
      setSubmissionStatus('generating');
      
      // Update toast to show feedback generation
      toast.loading('Submission saved! Generating AI feedback...', { 
        id: loadingToastId,
        duration: Infinity,
      });
      
      try {
        const feedbackResult = await generateFeedbackForSubmission(newSubmissionId);
        
        if (feedbackResult.success) {
          setSubmissionStatus('redirecting');
          toast.success('Feedback generated successfully! Redirecting to dashboard...', { 
            id: loadingToastId, 
            icon: <CheckCircle />, 
            duration: 2000 
          });
        } else {
          // Feedback generation failed, but submission was saved
          toast.error(`Submission saved, but feedback generation failed: ${feedbackResult.error || 'Unknown error'}`, { 
            id: loadingToastId, 
            icon: <AlertCircle />,
            duration: 5000
          });
        }
      } catch (err) {
        console.error("Error calling feedback action:", err);
        toast.error('Submission saved, but feedback generation encountered an error. You can check your submission status on the dashboard.', { 
          id: loadingToastId, 
          icon: <AlertCircle />,
          duration: 5000
        });
      }
      
      // Always redirect to dashboard after a delay, regardless of feedback success
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionStatus('idle');
        window.location.href = '/dashboard';
      }, 2000);
    }
  }, [currentPrompt, supabase, isSubmitting, wordCount]);

  const handleTimeUp = useCallback(() => {
    toast("Time's up! Submitting your work automatically.", { duration: 4000, icon: '⏳' });
    submitWriting();
  }, [submitWriting]);

  const handleSubmitClick = () => { submitWriting(); };

  const getSubmitButtonText = () => {
    switch (submissionStatus) {
      case 'saving': return 'Saving...';
      case 'generating': return 'Generating Feedback...';
      case 'redirecting': return 'Redirecting...';
      default: return isSubmitting ? 'Processing...' : 'Submit Now';
    }
  };

  const getStatusText = () => {
    switch (submissionStatus) {
      case 'saving': return 'Saving your submission to the database...';
      case 'generating': return 'AI is analyzing your writing and generating feedback...';
      case 'redirecting': return 'Taking you to the dashboard...';
      default: return 'Processing your submission...';
    }
  };

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted || !currentPrompt) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] p-6">
        <p className="text-gray-500 text-lg">Loading Writing Session...</p>
      </div>
    );
  }

  const genreBadgeStyle = `${getGenreBadgeClass(currentPrompt.genre)} px-2.5 py-0.5 rounded-full text-xs font-semibold`;
  const statusBadgeBaseStyle = "flex items-center space-x-2 px-3 py-1.5 rounded-md border shadow-sm transition-colors bg-white border-gray-300 text-gray-800";


  return (
    <div className="space-y-6 md:space-y-8 relative">
      {/* Submission Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl border">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{getSubmitButtonText()}</h3>
                <p className="text-sm text-gray-600 mt-1">{getStatusText()}</p>
                {submissionStatus === 'generating' && (
                  <p className="text-xs text-gray-500 mt-2">This may take up to a minute.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Info Bar: Prompt/Genre on Left, Timer/Word Count on Right */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 py-3 border-b border-gray-200">
        {/* Left: Prompt Info */}
        <div className="flex-grow space-y-1.5">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 leading-tight">
            {currentPrompt.prompt_text}
          </h1>
          <div className="flex"> {/* Container for genre badge to keep it inline-block like */}
            <span className={genreBadgeStyle}>
              {currentPrompt.genre}
            </span>
          </div>
        </div>

        {/* Right: Status (Timer & Word Count) - Styled like Timer */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-3 md:mt-0">
          <div
            className={`${statusBadgeBaseStyle} w-full sm:w-auto justify-center sm:justify-start`}
            title={`Word Count: ${wordCount}`}
          >
            <Edit2 size={18} className="flex-shrink-0 text-gray-500" />
            <span className="font-mono text-lg font-semibold text-gray-900">
              {wordCount} <span className="hidden sm:inline text-xs text-gray-500 normal-case font-medium">words</span>
            </span>
          </div>
          <Timer initialMinutes={30} onTimeUp={handleTimeUp} showTextLabel={false} /> {/* showTextLabel={false} for icon+time */}
        </div>
      </div>

      {/* Editor Section */}
      <div className="bg-white rounded-md shadow">
         <RichTextEditor
            key={currentPrompt.id}
            initialState={initialEmptyState}
            onChange={handleEditorChange}
            onTextContentChange={handleTextContentChange}
          />
      </div>

      {/* Bottom Action Bar */}
      <div className="flex justify-end items-center mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleSubmitClick}
          disabled={isSubmitting || wordCount === 0}
          className="px-8 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
          aria-describedby={isSubmitting ? "submission-status" : undefined}
        >
          {getSubmitButtonText()}
        </button>
        {isSubmitting && (
          <div id="submission-status" className="ml-4 flex items-center text-sm text-gray-600" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
            {getStatusText()}
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingSession;