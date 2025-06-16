// src/app/api/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Your server-side Supabase client
// import { cookies } from 'next/headers'; // cookies() is called within your createClient

export async function GET(request: NextRequest) {
  // Initialize the Supabase client
  const supabase = createClient();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const searchTerm = searchParams.get('searchTerm')?.trim() || '';
  const sortOption = searchParams.get('sortOption') || 'date_desc'; // Default sort
  const selectedGenre = searchParams.get('selectedGenre') || 'All Genres';
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  const limit = limitParam ? parseInt(limitParam, 10) : 5; // Default limit for "load more"
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required for fetching submissions.' }, { status: 400 });
  }

  try {
    // Base query for submissions
    let query = supabase
      .from('submissions')
      .select(`
        id,
        created_at,
        prompts!inner ( genre, prompt_text ), 
        overall_score
      `, { count: 'exact' }) // Fetch count for pagination, !inner join ensures prompt exists
      .eq('user_id', userId)
      .not('overall_score', 'is', null); // Only consider submissions that have been scored

    // Apply search term (if provided)
    // This searches across prompt_text and genre in the related 'prompts' table
    if (searchTerm) {
      // Note: Searching on joined table fields like this with OR can be complex
      // and might require database functions/views for optimal performance and accuracy,
      // especially if you want to search across fields from both `submissions` and `prompts` tables simultaneously.
      // This example attempts to search fields in the 'prompts' table.
      query = query.or(`prompt_text.ilike.%${searchTerm}%,genre.ilike.%${searchTerm}%`, { foreignTable: 'prompts' });
    }

    // Apply genre filter (if a specific genre is selected)
    if (selectedGenre && selectedGenre !== 'All Genres') {
      query = query.eq('prompts.genre', selectedGenre); // Assumes 'genre' is a column in your 'prompts' table
    }

    // Apply sorting
    let orderByColumn = 'created_at'; // Default sort column (on submissions table)
    let orderAscending = false;       // Default sort direction (descending for newest first)

    switch (sortOption) {
      case 'date_asc':
        orderByColumn = 'created_at';
        orderAscending = true;
        break;
      case 'date_desc':
        orderByColumn = 'created_at';
        orderAscending = false;
        break;
      case 'score_desc':
        orderByColumn = 'overall_score'; // Ensure this column is on the 'submissions' table
        orderAscending = false;
        break;
      case 'score_asc':
        orderByColumn = 'overall_score';
        orderAscending = true;
        break;
    }
    
    query = query.order(orderByColumn, { ascending: orderAscending });

    // Apply pagination (limit and offset)
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data: submissions, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching submissions in API route:', error.message);
      // Supabase errors often have a `message` and `details`
      throw new Error(error.message || 'Database query failed.');
    }

    return NextResponse.json({ submissions: submissions || [], totalCount: count || 0 });

  } catch (e: unknown) {
    let errorMessage = 'An unexpected error occurred while fetching submissions.';
    if (typeof e === 'string') {
      errorMessage = e;
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }
    // Log the full error for server-side debugging
    console.error('API Route submissions generic catch error:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}