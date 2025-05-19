// src/components/SubmissionReviewTabs.tsx
"use client";

import React, { useState } from 'react';
// Corrected import path as per your project structure
import {
    type SubmissionData,
    type ScoresByCriterion, // This should use CriterionFeedbackDetails internally
    type CriterionFeedbackDetails // Explicitly import for casting/type hints
} from '@/components/submission-types'; // User confirmed path
import ReadOnlyLexical from './ReadOnlyLexical';
import ScoreBreakdownDisplay from './ScoreBreakdownDisplay';

interface SubmissionReviewTabsProps {
  submission: SubmissionData;
}

type TabName = "Summary" | "Detailed Feedback" | "Original Submission";

const SubmissionReviewTabs: React.FC<SubmissionReviewTabsProps> = ({ submission }) => {
  const [activeTab, setActiveTab] = useState<TabName>("Summary");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Summary":
        return (
          <div className="space-y-6">
            {/* Overall Score Display */}
            <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall Score</p>
              <p className="text-6xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                {submission.overall_score ?? '--'} / 25
              </p>
            </div>

            {/* Score Breakdown */}
            {submission.scores_by_criterion && (
                <ScoreBreakdownDisplay scores={submission.scores_by_criterion} />
            )}

            {/* Overall Strengths */}
            {submission.overall_strengths && submission.overall_strengths.length > 0 ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">Strengths</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {submission.overall_strengths.map((strength, index) => (
                            <li key={`overall-strength-${index}`}>{strength}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Strengths</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No overall strengths provided.</p>
                </div>
            )}

            {/* Overall Areas for Improvement */}
            {submission.overall_areas_for_improvement && submission.overall_areas_for_improvement.length > 0 ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Areas for Improvement</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {submission.overall_areas_for_improvement.map((area, index) => (
                            <li key={`overall-area-${index}`}>{area}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                 <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Areas for Improvement</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No specific areas for overall improvement provided (or all criteria scored perfectly!).</p>
                </div>
            )}

            {/* General Comments / Marker Notes */}
            {submission.marker_notes && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">General Comments</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {submission.marker_notes}
                    </p>
                </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
                <button
                    onClick={() => setActiveTab("Original Submission")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                    View Full Submission
                </button>
                {/* You can add other buttons here, e.g., "Apply Feedback to Practice" */}
            </div>
          </div>
        );

      case "Detailed Feedback":
        return (
          <div className="p-1 sm:p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg space-y-4">
            
             {submission.scores_by_criterion ? (
                <div className="space-y-4">
                    {Object.entries(submission.scores_by_criterion).map(([key, criterionData]) => {
                        // Type assertion to ensure TypeScript knows the full structure
                        const criterionFeedback = criterionData as CriterionFeedbackDetails | undefined;

                        if (criterionFeedback && typeof criterionFeedback === 'object' && typeof criterionFeedback.score === 'number') {
                            return (
                                <div key={key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200">
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({criterionFeedback.score ?? 'N/A'}/5)
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3 italic">
                                        {criterionFeedback.explanation || 'No detailed explanation.'}
                                    </p>
                                    
                                    {criterionFeedback.positives && criterionFeedback.positives.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <strong className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Positives:</strong>
                                            <ul className="list-disc list-inside pl-4 text-xs text-gray-600 dark:text-gray-300 space-y-0.5 mt-1">
                                                {criterionFeedback.positives.map((positive: string, idx: number) => 
                                                    <li key={`pos-${key}-${idx}`}>{positive}</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {criterionFeedback.improvements && criterionFeedback.improvements.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <strong className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Areas to Improve:</strong>
                                            <ul className="list-disc list-inside pl-4 text-xs text-gray-600 dark:text-gray-300 space-y-0.5 mt-1">
                                                {criterionFeedback.improvements.map((improvement: string, idx: number) => 
                                                    <li key={`imp-${key}-${idx}`}>{improvement}</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return null; // If criterionFeedback is not valid for some reason
                    })}
                </div>
             ) : <p className="italic text-gray-500 dark:text-gray-400">No detailed criterion scores available.</p>}
          </div>
        );
        
      case "Original Submission":
        return (
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Original Submission</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">(Text highlighting feature is currently under development)</p>
                <div className="prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[200px]">
                    {submission.content_json ? (
                        <ReadOnlyLexical
                            initialJsonState={submission.content_json}
                            highlights={[]} // Pass empty highlights for now
                        />
                    ) : (
                        <p className='text-gray-500 dark:text-gray-400 italic'>No content saved for this submission.</p>
                    )}
                </div>
            </div>
        );
      default:
        // Should not happen if TabName is correctly typed
        return null;
    }
  };

  // Only render tabs if feedback is completed
  if (submission.feedback_status !== 'completed') {
    if (submission.feedback_status === 'pending') {
        return <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg"><p className="text-blue-700 dark:text-blue-300 animate-pulse text-lg">Feedback generation is in progress...</p><p className="text-sm text-blue-600 dark:text-blue-400 mt-2">This can take up to a minute. Please check back shortly.</p></div>;
    }
    if (submission.feedback_status === 'error') {
        return <div className="text-center p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg"><p className="text-red-700 dark:text-red-300 font-semibold text-lg">Feedback Generation Failed</p>{submission.marker_notes && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{submission.marker_notes}</p>}<p className="text-xs text-red-500 dark:text-red-500 mt-3">Please try submitting again or contact support.</p></div>;
    }
    // Fallback for null or other unexpected statuses (e.g., if it was never 'pending')
    return <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg"><p className="text-yellow-700 dark:text-yellow-300 text-lg">Feedback is not yet available for this submission.</p></div>;
  }

  const tabButtonClasses = (tabName: TabName) =>
    `px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
      activeTab === tabName
        ? 'bg-gray-800 text-white shadow-sm dark:bg-blue-600'
        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
    }`;

  return (
    <div>
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs">
          <button onClick={() => setActiveTab("Summary")} className={tabButtonClasses("Summary")}>
            Summary
          </button>
          <button onClick={() => setActiveTab("Detailed Feedback")} className={tabButtonClasses("Detailed Feedback")}>
            Detailed Feedback
          </button>
          <button onClick={() => setActiveTab("Original Submission")} className={tabButtonClasses("Original Submission")}>
            Original Submission
          </button>
        </nav>
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default SubmissionReviewTabs;