// src/components/WritingSession.tsx
"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Timer from "./Timer";
import RichTextEditor from "./RichTextEditor";
import toast from "react-hot-toast";
import { generateFeedbackForSubmission } from "@/app/_actions/feedbackActions";
import { CheckCircle, AlertCircle, Edit2 } from "lucide-react"; // Using Edit2 for Word Count icon

interface Prompt {
  id: number;
  genre: string;
  prompt_text: string;
}
interface WritingSessionProps {
  currentPrompt: Prompt;
}

const initialEmptyState =
  '{"root":{"children":[{"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

const getGenreBadgeClass = (genre: string): string => {
  // Using lighter backgrounds for these small badges for better text contrast with darker text
  switch (genre.toLowerCase()) {
    case "persuasive":
      return "bg-sky-100 text-sky-700";
    case "creative":
      return "bg-purple-100 text-purple-700";
    case "informative":
      return "bg-amber-100 text-amber-700";
    case "article":
      return "bg-teal-100 text-teal-700";
    case "diary entry":
      return "bg-pink-100 text-pink-700";
    case "news report":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const WritingSession: React.FC<WritingSessionProps> = ({ currentPrompt }) => {
  const [editorStateJson, setEditorStateJson] =
    useState<string>(initialEmptyState);
  const editorStateRef = useRef(editorStateJson);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    editorStateRef.current = editorStateJson;
  }, [editorStateJson]);

  const handleEditorChange = useCallback((newStateJson: string) => {
    setEditorStateJson(newStateJson);
  }, []);

  const handleTextContentChange = useCallback((text: string) => {
    const count =
      text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  }, []);

  const submitWriting = useCallback(async () => {
    console.log("SUBMIT WRITING: Called."); // Log 1: Function start

    if (isSubmitting) {
      console.log("SUBMIT WRITING: Already submitting, exiting."); // Log 2
      return;
    }
    setIsSubmitting(true);
    console.log("SUBMIT WRITING: isSubmitting set to true."); // Log 3

    const loadingToastId = toast.loading("Submitting your work...");
    console.log("SUBMIT WRITING: Loading toast shown."); // Log 4

    const {
      data: { user },
      error: authUserError,
    } = await supabase.auth.getUser();

    if (authUserError) {
      // Log 5: Check auth user error
      console.error(
        "SUBMIT WRITING: Error getting user:",
        authUserError.message
      );
      toast.error("Authentication error. Please try again.", {
        id: loadingToastId,
        icon: <AlertCircle />,
      });
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      console.log("SUBMIT WRITING: No user found, redirecting/showing error."); // Log 6
      toast.error("You must be logged in to submit.", {
        id: loadingToastId,
        icon: <AlertCircle />,
      });
      setIsSubmitting(false);
      return;
    }
    console.log("SUBMIT WRITING: User found:", user.id); // Log 7

    const currentContentJson = editorStateRef.current;
    console.log(
      "SUBMIT WRITING: Current editor content (JSON string):",
      currentContentJson
    ); // Log 8
    console.log("SUBMIT WRITING: Current word count:", wordCount); // Log 9

    if (
      !currentContentJson ||
      currentContentJson === initialEmptyState ||
      wordCount === 0
    ) {
      console.log("SUBMIT WRITING: Empty writing, showing error."); // Log 10
      toast.error("Cannot submit empty writing.", {
        id: loadingToastId,
        icon: <AlertCircle />,
      });
      setIsSubmitting(false);
      return;
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(currentContentJson);
      console.log("SUBMIT WRITING: Content parsed successfully."); // Log 11
    } catch (e) {
      console.error("SUBMIT WRITING: Error parsing editor content JSON:", e); // Log 12
      toast.error("Error processing editor content.", {
        id: loadingToastId,
        icon: <AlertCircle />,
      });
      setIsSubmitting(false);
      return;
    }

    const submissionData = {
      user_id: user.id,
      prompt_id: currentPrompt.id,
      content_json: parsedContent,
      feedback_status: "pending", // This is where 'pending' is set
      word_count: wordCount,
    };
    console.log("SUBMIT WRITING: Submission data prepared:", submissionData); // Log 13

    try {
      console.log("SUBMIT WRITING: Attempting Supabase insert..."); // Log 14
      const { data: insertResult, error: insertError } = await supabase
        .from("submissions")
        .insert(submissionData)
        .select("id")
        .single();

      console.log("SUBMIT WRITING: Supabase insert attempt completed."); // Log 15

      if (insertError || !insertResult) {
        console.error(
          "SUBMIT WRITING: Supabase insert error:",
          insertError?.message || "No insert result returned."
        ); // Log 16
        toast.error(
          `Submission failed: ${
            insertError?.message || "Unknown error during insert."
          }`,
          { id: loadingToastId, icon: <AlertCircle /> }
        );
        setIsSubmitting(false);
      } else {
        const newSubmissionId = insertResult.id;
        console.log(
          "SUBMIT WRITING: Submission successful. New ID:",
          newSubmissionId
        ); // Log 17
        toast.success("Submission saved! Generating feedback...", {
          id: loadingToastId,
          icon: <CheckCircle />,
          duration: 3000,
        });

        generateFeedbackForSubmission(newSubmissionId)
          .then((res) =>
            console.log(
              "SUBMIT WRITING: Feedback generation action result:",
              res
            )
          )
          .catch((err) =>
            console.error("SUBMIT WRITING: Error calling feedback action:", err)
          );

        setTimeout(() => {
          console.log("SUBMIT WRITING: Redirecting to dashboard."); // Log 18
          setIsSubmitting(false);
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (unexpectedError) {
      console.error(
        "SUBMIT WRITING: Unexpected error during submission process:",
        unexpectedError
      );
      toast.error("An unexpected error occurred. Please try again.", {
        id: loadingToastId,
        icon: <AlertCircle />,
      });
      setIsSubmitting(false);
    }
  }, [currentPrompt, supabase, isSubmitting, wordCount]); // editorStateRef is stable, not needed in deps

  const handleTimeUp = useCallback(() => {
    toast("Time's up! Submitting your work automatically.", {
      duration: 4000,
      icon: "⏳",
    });
    submitWriting();
  }, [submitWriting]);

  const handleSubmitClick = () => {
    submitWriting();
  };

  // Removed redundant setIsMounted(true) from here as it's already at the top
  // useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted || !currentPrompt) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] p-6">
        <p className="text-gray-500 text-lg">Loading Writing Session...</p>
      </div>
    );
  }

  const genreBadgeStyle = `${getGenreBadgeClass(
    currentPrompt.genre
  )} px-2.5 py-0.5 rounded-full text-xs font-semibold`;
  const statusBadgeBaseStyle =
    "flex items-center space-x-2 px-3 py-1.5 rounded-md border shadow-sm transition-colors bg-white border-gray-300 text-gray-800";

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Info Bar: Prompt/Genre on Left, Timer/Word Count on Right */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 py-3 border-b border-gray-200">
        {/* Left: Prompt Info */}
        <div className="flex-grow space-y-1.5">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-50 leading-tight">
            {currentPrompt.prompt_text}
          </h1>
          <div className="flex">
            <span className={genreBadgeStyle}>{currentPrompt.genre}</span>
          </div>
        </div>

        {/* Right: Status (Timer & Word Count) */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-3 md:mt-0">
          <div
            className={`${statusBadgeBaseStyle} w-full sm:w-auto justify-center sm:justify-start`}
            title={`Word Count: ${wordCount}`}
          >
            <Edit2 size={18} className="flex-shrink-0 text-gray-500" />
            <span className="font-mono text-lg font-semibold text-gray-900">
              {wordCount}{" "}
              <span className="hidden sm:inline text-xs text-gray-500 normal-case font-medium">
                words
              </span>
            </span>
          </div>
          <Timer
            initialMinutes={30}
            onTimeUp={handleTimeUp}
            showTextLabel={false}
          />
        </div>
      </div>

      {/* Editor Section */}
      <div className="bg-white rounded-md shadow">
        <RichTextEditor
          key={currentPrompt.id} // Ensures editor remounts if prompt changes
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
        >
          {isSubmitting ? "Submitting..." : "Submit Now"}
        </button>
      </div>
    </div>
  );
};

export default WritingSession;
