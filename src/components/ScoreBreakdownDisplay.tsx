// src/components/ScoreBreakdownDisplay.tsx
"use client";

import React from 'react';
import { type ScoresByCriterion, type CriterionFeedbackDetails } from '@/components/submission-types'; // Adjust path as needed

interface ScoreBreakdownDisplayProps {
  scores: ScoresByCriterion | null;
}

// Define the order and display names for criteria
const CRITERIA_ORDER: Array<{ key: keyof ScoresByCriterion; displayName: string }> = [
  { key: 'genre_conventions', displayName: 'Genre Conventions' },
  { key: 'language_vocabulary', displayName: 'Language & Vocabulary' },
  { key: 'structure_organisation', displayName: 'Structure & Organisation' },
  { key: 'grammar_spelling_punctuation', displayName: 'Grammar, Spelling & Punctuation' },
  { key: 'creativity_effectiveness_voice', displayName: 'Creativity, Effectiveness & Voice' },
];

const ScoreBar: React.FC<{ score: number; maxScore?: number }> = ({ score, maxScore = 5 }) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  let bgColor = 'bg-red-500'; // Default for low scores
  if (percentage >= 80) bgColor = 'bg-green-500'; // 4-5/5
  else if (percentage >= 60) bgColor = 'bg-yellow-500'; // 3/5
  else if (percentage >= 40) bgColor = 'bg-orange-500'; // 2/5

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 my-1">
      <div
        className={`${bgColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const ScoreBreakdownDisplay: React.FC<ScoreBreakdownDisplayProps> = ({ scores }) => {
  if (!scores) {
    return <p className="text-sm text-gray-500 italic">Score breakdown not available.</p>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Score Breakdown</h3>
      <div className="space-y-3">
        {CRITERIA_ORDER.map(({ key, displayName }) => {
          const scoreItem = scores[key] as CriterionFeedbackDetails | undefined; // Type assertion
          const scoreValue = scoreItem?.score ?? 0; // Default to 0 if undefined
          const maxScore = 5; // Assuming max score is 5 for each

          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-sm font-medium text-gray-600">{displayName}</span>
                <span className="text-sm font-semibold text-gray-700">
                  {scoreValue}/{maxScore}
                </span>
              </div>
              <ScoreBar score={scoreValue} maxScore={maxScore} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdownDisplay;