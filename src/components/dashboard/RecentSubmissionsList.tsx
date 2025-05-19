// src/components/dashboard/RecentSubmissionsList.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SubmissionListItem, SubmissionItemData } from './SubmissionListItem';
import { Search, ListFilter, NotebookPen, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface ClientFetchedApiSubmission {
  id: number;
  created_at: string;
  // With !inner join in API, prompts should always be an object if the submission is returned
  prompts: { genre: string; prompt_text: string; } | null; // Keep as potentially null if RLS could nullify it despite inner join
  overall_score?: number | null;
}

interface RecentSubmissionsListProps {
  initialSubmissions: SubmissionItemData[];
  initialTotalCount: number;
  userId: string;
  hasAccess?: boolean;
  practiceLinkTarget?: string;
  itemsPerPage: number;
}

type SortOption = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

export function RecentSubmissionsList({
  initialSubmissions,
  initialTotalCount,
  userId,
  hasAccess = true,
  practiceLinkTarget = "/practice",
  itemsPerPage,
}: RecentSubmissionsListProps) {
  const [displayedSubmissions, setDisplayedSubmissions] = useState<SubmissionItemData[]>(initialSubmissions);
  const [searchTermInput, setSearchTermInput] = useState('');
  const debouncedSearchTerm = useDebounce(searchTermInput, 500);

  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');

  const [currentPage, setCurrentPage] = useState(1); // Tracks the page number for fetching
  const [totalCountFromServer, setTotalCountFromServer] = useState(initialTotalCount); // Total items matching current filters
  const [isLoading, setIsLoading] = useState(false);

  // Effect to reset list when initial props change (e.g., parent page reloads/navigates)
  useEffect(() => {
    setDisplayedSubmissions(initialSubmissions);
    setTotalCountFromServer(initialTotalCount);
    setCurrentPage(1);
  }, [initialSubmissions, initialTotalCount]);

  const fetchSubmissionsData = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    const isNewQuery = pageToFetch === 1; // If fetching page 1, it's a new filter/sort query
    const offset = isNewQuery ? 0 : (pageToFetch - 1) * itemsPerPage;
    
    const queryParams = new URLSearchParams({
      userId,
      searchTerm: debouncedSearchTerm,
      sortOption,
      selectedGenre,
      limit: itemsPerPage.toString(),
      offset: offset.toString(),
    });

    try {
      const response = await fetch(`/api/submissions?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data: { submissions: ClientFetchedApiSubmission[], totalCount: number } = await response.json();
      
      const newTransformedSubmissions: SubmissionItemData[] = data.submissions.map((sub: ClientFetchedApiSubmission) => {
        // With !inner join, sub.prompts should ideally not be null, but optional chaining is safe.
        const currentPromptData = Array.isArray(sub.prompts) ? sub.prompts[0] : sub.prompts;
        const maxPossibleScore = 25;
        const overallScoreNum = typeof sub.overall_score === 'number' ? sub.overall_score : 0;
        const overallScorePercentage = maxPossibleScore > 0 ? Math.round((overallScoreNum / maxPossibleScore) * 100) : 0;
        return {
          id: sub.id,
          genre: currentPromptData?.genre || 'N/A', // Fallback if prompt or genre is still missing
          promptTitle: currentPromptData?.prompt_text || 'Untitled Prompt',
          date: new Date(sub.created_at).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
          overallScorePercentage: overallScorePercentage,
          viewLink: `/submission/${sub.id}`,
        };
      });

      if (isNewQuery) {
        setDisplayedSubmissions(newTransformedSubmissions);
      } else {
        setDisplayedSubmissions(prev => [...prev, ...newTransformedSubmissions]);
      }
      setTotalCountFromServer(data.totalCount || 0);
      setCurrentPage(pageToFetch);

    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      if (isNewQuery) setDisplayedSubmissions([]); // Clear list on error for new query
      setTotalCountFromServer(0); // Reset total count on error
    } finally {
      setIsLoading(false);
    }
  }, [userId, debouncedSearchTerm, sortOption, selectedGenre, itemsPerPage]);

  // Effect to re-fetch when filters/sort change
  useEffect(() => {
    fetchSubmissionsData(1); // Fetch page 1 with new criteria
  }, [debouncedSearchTerm, sortOption, selectedGenre, fetchSubmissionsData]);


  const handleLoadMore = () => {
    // We check displayedSubmissions.length against totalCountFromServer
    if (!isLoading && displayedSubmissions.length < totalCountFromServer) {
      fetchSubmissionsData(currentPage + 1);
    }
  };

  const uniqueGenres = useMemo(() => {
    const genres = new Set(initialSubmissions.map(sub => sub.genre).filter(g => g && g !== 'N/A'));
    return ['All Genres', ...Array.from(genres).sort()];
  }, [initialSubmissions]);
  
  const canLoadMore = !isLoading && displayedSubmissions.length < totalCountFromServer;

  // The list to render is now always displayedSubmissions as it's updated by fetchSubmissionsData
  const submissionsToRender = displayedSubmissions;

  // ... (JSX for rendering remains largely the same, but uses submissionsToRender)
  // Ensure empty states consider if it's an initial load or filter result.

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      {/* ... (Header with search/filter controls as before) ... */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Submissions</h2>
          <p className="text-sm text-gray-500 mt-1">View and analyze your writing submissions.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Search title/genre..."
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
          {/* Genre Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedGenre}
              onChange={(e) => { setSelectedGenre(e.target.value); setCurrentPage(1); /* Reset page on filter change */ }}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 h-full"
            >
              {uniqueGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {/* Sort By Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortOption}
              onChange={(e) => { setSortOption(e.target.value as SortOption); setCurrentPage(1); /* Reset page on sort change */}}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 h-full pl-8"
            >
              <option value="date_desc">Date (Newest)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="score_desc">Score (Highest)</option>
              <option value="score_asc">Score (Lowest)</option>
            </select>
            <ListFilter className="h-4 w-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Conditional Rendering Logic */}
      {isLoading && submissionsToRender.length === 0 && <p className="text-center text-gray-500 py-10">Loading submissions...</p>}

      {!isLoading && submissionsToRender.length === 0 ? (
        // Determine if empty state is due to no results from filter or truly no submissions
        (debouncedSearchTerm !== '' || selectedGenre !== 'All Genres') ? (
          <div className="text-center py-10 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <NotebookPen className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1}/>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No submissions match your criteria</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <NotebookPen className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1}/>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Submissions Yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start a new writing practice session to see your submissions here.</p>
            {(
               <div className="mt-6">
                  <Link
                      href={practiceLinkTarget}
                      className={`inline-flex items-center px-4 py-2 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out text-sm ${
                          hasAccess
                          ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                          : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400'
                      }`}
                  >
                      {hasAccess ? 'Start Practice' : 'Subscribe Now'}
                  </Link>
              </div>
            )}
          </div>
        )
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {submissionsToRender.map((submission) => (
              <SubmissionListItem key={submission.id} {...submission} />
            ))}
          </div>
          {canLoadMore && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}