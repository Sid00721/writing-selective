"use client";

import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

export interface SubmissionItemData {
  id: string | number;
  genre: string;
  promptTitle: string;
  date: string;
  overallScorePercentage: number;
  feedbackStatus?: 'pending' | 'completed' | 'error' | null;
  viewLink: string;
}

const getScoreButtonClass = (percentage: number): string => {
  if (percentage >= 75) return 'bg-green-600 hover:bg-green-700';
  if (percentage >= 50) return 'bg-yellow-500 hover:bg-yellow-600';
  return 'bg-red-600 hover:bg-red-700';
};

const getGenreButtonClass = (genre: string): string => {
  switch (genre.toLowerCase()) {
    case 'persuasive': return 'bg-sky-600 hover:bg-sky-700 text-white';
    case 'creative': return 'bg-purple-600 hover:bg-purple-700 text-white';
    case 'informative': return 'bg-amber-600 hover:bg-amber-700 text-white';
    case 'article': return 'bg-teal-600 hover:bg-teal-700 text-white';
    case 'diary entry': return 'bg-pink-600 hover:bg-pink-700 text-white';
    case 'news report': return 'bg-blue-600 hover:bg-blue-700 text-white';
    default: return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
};

export function SubmissionListItem({
  id,
  genre,
  promptTitle,
  date,
  overallScorePercentage,
  feedbackStatus,
  viewLink,
}: SubmissionItemData) {
  const scoreButtonClass = getScoreButtonClass(overallScorePercentage);
  const genreButtonClass = getGenreButtonClass(genre);
  const commonButtonStyle = "px-3 py-1.5 rounded-md text-sm shadow-sm transition-colors";

  const getStatusDisplay = () => {
    switch (feedbackStatus) {
      case 'pending':
        return (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="text-sm font-medium text-orange-600">Generating Feedback...</span>
          </div>
        );
      case 'error':
        return (
          <span className="text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-md">
            Error - Click to View
          </span>
        );
      case 'completed':
        return (
          <span className={`${commonButtonStyle} ${scoreButtonClass} font-bold text-white min-w-[70px] text-center`}>
            {overallScorePercentage}%
          </span>
        );
      default:
        return (
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
            Processing...
          </span>
        );
    }
  };

  return (
    <div className="py-4 flex flex-col md:flex-row items-center gap-x-4 md:gap-x-6">
      
      {/* 1. Genre Block (Fixed Width on Desktop, Text Centered within) */}
      <div className="flex-shrink-0 w-full md:w-32 lg:w-36 mb-2 md:mb-0">
        {/* The span is the "button". It takes full width of its parent div.
            Text inside the span is centered. */}
        <span className={`${commonButtonStyle} ${genreButtonClass} font-semibold w-full inline-block text-center`}>
          {genre}
        </span>
      </div>

      {/* 2. Prompt Title & Date (Takes up remaining space, title centered relative to its own block) */}
      <div className="flex-1 min-w-0 text-center md:text-left flex flex-col justify-center items-center md:items-start">
        <Link href={viewLink} className="text-md font-semibold text-gray-800 hover:text-sky-600 transition-colors block">
          {promptTitle}
        </Link>
        <p className="text-xs text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-1">
          <Calendar size={12} className="text-gray-400" />
          {date}
        </p>
      </div>

      {/* 3. Score & Action (Right Aligned) */}
      <div className="flex-shrink-0 flex items-center gap-3 mt-2 md:mt-0 ml-0 md:ml-auto w-full md:w-auto justify-center md:justify-end">
        {getStatusDisplay()}
        <Link
          href={viewLink}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center whitespace-nowrap transition-colors"
        >
          View <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
}