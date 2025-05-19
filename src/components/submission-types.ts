// src/types/submission-types.ts
export interface Highlight {
  quote?: string;
  criterion?: string;
  comment?: string;
}

// This interface can be for the top-level 'suggestions' if you decide to use it later.
// For now, per-criterion improvements are handled by CriterionFeedbackDetails.
export interface Suggestions {
  structure_organisation?: string[];
  language_vocabulary?: string[];
  grammar_spelling_punctuation?: string[];
  genre_conventions?: string[];
  creativity_effectiveness_voice?: string[];
  [key: string]: string[] | undefined;
}

// *** THIS IS THE KEY INTERFACE TO UPDATE ***
// This defines the structure for each criterion's detailed feedback,
// matching what feedbackActions.ts saves and what SubmissionReviewTabs.tsx needs.
export interface CriterionFeedbackDetails { // You can name this ScoreDataItem if you prefer, but ensure fields are present
  score?: number;
  explanation?: string;
  positives?: string[];   // Needs to be here
  improvements?: string[];// Needs to be here
}

export interface ScoresByCriterion {
  structure_organisation?: CriterionFeedbackDetails; // Use the richer type
  language_vocabulary?: CriterionFeedbackDetails;    // Use the richer type
  grammar_spelling_punctuation?: CriterionFeedbackDetails; // Use the richer type
  genre_conventions?: CriterionFeedbackDetails;          // Use the richer type
  creativity_effectiveness_voice?: CriterionFeedbackDetails; // Use the richer type
  // Allow for flexibility but ensure values match CriterionFeedbackDetails
  [key: string]: CriterionFeedbackDetails | undefined;
}

export interface SubmissionData {
  id: number;
  created_at: string;
  content_json: object | null; // Lexical JSON state
  prompts: {
    genre: string;
    prompt_text: string;
  } | null;
  feedback_status: 'pending' | 'completed' | 'error' | null;
  overall_score: number | null;
  scores_by_criterion: ScoresByCriterion | null; // This will now use the richer CriterionFeedbackDetails
  marker_notes: string | null;        // This is the AI's overallComment
  highlights: Highlight[] | null;     // From feedbackActions (currently set to null)
  suggestions: Suggestions | null;    // From feedbackActions (currently set to null) - this is for overall suggestions

  // Overall strengths and areas for improvement (from feedbackActions)
  overall_strengths: string[] | null;
  overall_areas_for_improvement: string[] | null;
}