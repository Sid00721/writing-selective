// src/app/_actions/feedbackActions.ts
"use server";

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// --- TYPE DEFINITIONS ---

// Basic interface for Lexical nodes used in text extraction
interface LexicalNode {
    type: string;
    text?: string;
    children?: LexicalNode[];
    // Other properties like format, tag, etc. might exist
}

// Basic interface for the expected root structure of Lexical JSON
interface LexicalRootObject {
    root: {
      children: LexicalNode[];
      // Other root properties might exist but aren't needed for extraction
      // *** MODIFIED: Use unknown instead of any for index signature ***
      [key: string]: unknown;
    };
    // *** MODIFIED: Use unknown instead of any for index signature ***
    [key: string]: unknown;
  }

// Define the structure expected from the Supabase query fetching submission data
interface SubmissionWithPromptData {
  content_json: LexicalRootObject | null; // Use the specific Lexical type here
  prompt_id: number | null;
  prompts: {
    genre: string;
    prompt_text: string;
  } | null;
}

// Define the structure we expect back from OpenAI after feedback generation
interface AIFeedbackResponse {
  genre: string;
  scores: {
    structure_organisation?: { score?: number; explanation?: string };
    language_vocabulary?: { score?: number; explanation?: string };
    grammar_spelling_punctuation?: { score?: number; explanation?: string };
    genre_conventions?: { score?: number; explanation?: string };
    creativity_effectiveness_voice?: { score?: number; explanation?: string };
  };
  totalScore?: number;
  overallComment?: string;
  highlights?: { quote?: string; criterion?: string; comment?: string }[];
  suggestions?: {
    structure_organisation?: string[];
    language_vocabulary?: string[];
    grammar_spelling_punctuation?: string[];
    genre_conventions?: string[];
    creativity_effectiveness_voice?: string[];
  };
}

// Define the structure for storing marking criteria
// IMPORTANT: Ensure keys match genre values from DB EXACTLY (case-sensitive).
const markingCriteria = {
  "Creative": {
     "Structure & Organisation": "High: Clear orientation, complication, and resolution; logical sequence; effective paragraphs. Low: No clear beginning/middle/end; disjointed flow; poor or no paragraphing.",
     "Language & Vocabulary": "High: Descriptive and rich language; varied vocabulary; tone matches story. Low: Repetitive or basic vocabulary; tone inconsistent or inappropriate.",
     "Grammar, Spelling & Punctuation": "High: Accurate grammar, punctuation and spelling throughout. Low: Many errors that hinder readability or clarity.",
     "Genre Conventions": "High: Includes character development, setting, plot; follows narrative format. Low: Lacks character, setting, or story structure; genre not followed.",
     "Creativity / Effectiveness / Voice": "High: Original story; emotional or imaginative voice; holds reader interest. Low: Generic or clichéd ideas; weak or inconsistent voice."
  },
  "Persuasive": {
     "Structure & Organisation": "High: Strong intro, body, and conclusion; ideas flow logically; clear paragraphs. Low: Unclear argument or order; lacks structure; poorly paragraphed.",
     "Language & Vocabulary": "High: Uses rhetorical techniques (e.g., emotive language, repetition); precise vocabulary. Low: Little persuasive technique; limited or basic language.",
     "Grammar, Spelling & Punctuation": "High: Consistent, correct grammar and punctuation. Low: Frequent errors; distract from message.",
     "Genre Conventions": "High: Clear opinion; supporting arguments; addresses counterpoints. Low: Opinion unclear; no evidence or rebuttals.",
     "Creativity / Effectiveness / Voice": "High: Passionate and convincing tone; reader feels engaged. Low: Weak or flat tone; argument not compelling."
  },
  "News Report": {
     "Structure & Organisation": "High: Headline, lead, body, and conclusion; descending order of importance. Low: Random info order; missing report structure.",
     "Language & Vocabulary": "High: Formal, objective; no bias; clear vocabulary. Low: Biased, casual or vague language.",
     "Grammar, Spelling & Punctuation": "High: Accurate and consistent throughout. Low: Errors interfere with readability.",
     "Genre Conventions": "High: Answers 5Ws + How; includes quotes and factual detail. Low: Missing key facts; lacks quotes or journalistic tone.",
     "Creativity / Effectiveness / Voice": "High: Captivating lead; authoritative voice. Low: Boring or unclear intro; weak tone."
   },
   "Article": {
      "Structure & Organisation": "High: Intro, body, conclusion; ideas logically ordered; paragraphed well. Low: Disorganised or confusing layout.",
      "Language & Vocabulary": "High: Audience-appropriate tone; clear and precise language. Low: Confusing explanations; too informal or too vague.",
      "Grammar, Spelling & Punctuation": "High: Few to no errors; writing is smooth. Low: Frequent mistakes interrupt clarity.",
      "Genre Conventions": "High: Clear topic; examples, facts, or ideas support content. Low: Lacks evidence or structure expected in articles.",
      "Creativity / Effectiveness / Voice": "High: Distinct voice or original perspective; clear message. Low: Bland or recycled ideas; unclear purpose."
   },
   "Diary Entry": {
      "Structure & Organisation": "High: Includes date and “Dear Diary”; flows chronologically. Low: Missing date or structure; events feel jumbled.",
      "Language & Vocabulary": "High: Expressive, reflective, personal language. Low: Formal, impersonal, or basic vocabulary.",
      "Grammar, Spelling & Punctuation": "High: Mostly correct; tone stays informal yet clear. Low: Lots of errors; hard to read or unnatural.",
      "Genre Conventions": "High: First-person voice; includes thoughts and feelings. Low: Not reflective or emotional; lacks perspective.",
      "Creativity / Effectiveness / Voice": "High: Honest and believable voice; emotional impact. Low: Flat or fake-sounding; no real engagement."
   }
   // Consider moving this to a separate file (e.g., lib/criteria.ts)
};


// --- UTILITY FUNCTION: Extract Plain Text from Lexical JSON ---
/**
 * Traverses a Lexical JSON structure and extracts the plain text content.
 * Adds basic paragraph and line break handling.
 * @param lexicalJson The JSON object from the editor state, matching LexicalRootObject structure or null/undefined.
 * @returns The extracted plain text as a string.
 */
// *** Uses the specific LexicalRootObject type instead of 'any' to satisfy ESLint ***
function extractPlainTextFromLexical(lexicalJson: LexicalRootObject | null | undefined): string {
    let textContent = '';

    // Handle null or undefined input gracefully
    if (!lexicalJson) {
        // console.warn("Lexical JSON input is null or undefined."); // Optional warning
        return '';
    }

    // Basic check for the expected root structure
    if (typeof lexicalJson !== 'object' || !lexicalJson.root || !Array.isArray(lexicalJson.root.children)) {
        console.warn("Invalid or unexpected Lexical JSON structure received during text extraction:", lexicalJson);
        return ''; // Return empty string if structure is not as expected
    }

    // Internal recursive function for traversal
    function traverse(nodes: LexicalNode[]) {
        for (const node of nodes) {
            // Extract text from 'text' nodes
            if (node.type === 'text' && typeof node.text === 'string') {
                textContent += node.text;
            }
            // Handle explicit line breaks
            else if (node.type === 'linebreak') {
                 // Add a newline, ensuring not to add multiple if already ending with whitespace
                 if (textContent.length > 0 && !/\s$/.test(textContent)) {
                     textContent += '\n';
                 } else if (textContent.length === 0) {
                     textContent += '\n';
                 }
            }

            // Recurse into children if they exist
            if (Array.isArray(node.children) && node.children.length > 0) {
                traverse(node.children);
            }

            // Add paragraph breaks (double newline) after processing block-level elements
            // This ensures separation between paragraphs, list items, etc.
            if (['paragraph', 'heading', 'list', 'listitem', 'quote'].includes(node.type)) {
                 // Add double newline if text exists and doesn't already end with significant whitespace
                 if (textContent.length > 0 && !/\s\s$/.test(textContent)) {
                     textContent += '\n\n';
                 }
            }
        }
    }
    // --- End internal traverse function ---

    traverse(lexicalJson.root.children); // Start traversal

    // Clean up extra whitespace/newlines at the end and normalize paragraph breaks
    return textContent.replace(/\n{3,}/g, '\n\n').trim();
}
// --- END UTILITY FUNCTION ---


// --- SERVER ACTION ---
/**
 * Generates AI feedback for a given submission ID using OpenAI.
 * Fetches content_json, extracts text, calls AI, and updates the submission record.
 */
export async function generateFeedbackForSubmission(submissionId: number): Promise<{ success?: boolean; error?: string; feedback?: AIFeedbackResponse }> {
  console.log(`Starting feedback generation for submission ID: ${submissionId}`);

  // 1. Initialize Clients & Get Secrets
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openAIApiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !openAIApiKey) {
    console.error("Feedback Action Error: Missing Supabase URL/Service Key or OpenAI Key environment variables!");
    return { error: "Server configuration error." };
  }

  // Initialize Supabase client with Service Role Key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  console.log("Initialized Supabase client with Service Role Key.");

  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey: openAIApiKey });

  try {
    // 2. Fetch Submission & Prompt Data
    console.log(`Workspaceing data for submission ${submissionId}...`); // Corrected typo

    // Select the content_json column along with prompt details
    const { data, error: fetchError } = await supabase
        .from('submissions')
        .select(`
            content_json,
            prompt_id,
            prompts ( genre, prompt_text )
        `)
        .eq('id', submissionId)
        .single<SubmissionWithPromptData>(); // Specify expected return type

    // Optional: Log structure confirmation
    // console.log("Raw submissionData from Supabase (root check):", data?.content_json?.root ? 'Root exists' : 'Root missing/Null JSON');

    // Handle database fetch errors
    if (fetchError) {
        console.error(`Error fetching submission ${submissionId}:`, JSON.stringify(fetchError, null, 2));
        if (fetchError.code === 'PGRST116') { // Specific code for 'row not found'
             return { error: `Submission with ID ${submissionId} not found.` };
        }
        return { error: `Database error fetching submission: ${fetchError.message}` };
    }
    // Handle case where data is unexpectedly null
    if (!data) {
        console.error(`No submission data returned for ID ${submissionId}, but no fetch error reported.`);
         return { error: `Could not find submission data for ID ${submissionId}.` };
    }

    const promptsData = data.prompts;
    const content_json = data.content_json; // Typed as LexicalRootObject | null

    // Extract plain text using the utility function
    const plainTextContent = extractPlainTextFromLexical(content_json);

    // Validate essential data including the extracted text and prompt info
    const genre = promptsData?.genre;
    const promptText = promptsData?.prompt_text;

    if (!plainTextContent || !promptsData || !genre || !promptText) {
        console.error(`Submission ${submissionId} validation failed: Missing extracted text, prompts object, genre, or prompt_text.`);
        console.error("Validation Details:", {
            hasPlainText: !!plainTextContent,
            hasPrompts: !!promptsData,
            hasGenre: !!genre,
            hasPromptText: !!promptText
        });
        // Log if extraction yielded empty string from non-null JSON
        if (!plainTextContent && content_json) {
             console.warn("Text extraction resulted in empty string from non-null JSON input.");
        }
        return { error: `Submission ${submissionId} data incomplete or text extraction failed.` };
    }
    console.log(`Data fetched & validated for submission ${submissionId}. Genre: ${genre}. Text extracted successfully.`);
    // Optional: Log extracted text for debugging
    // console.log("Extracted Text (first 500 chars):", plainTextContent.substring(0, 500));

    // 3. Get Correct Marking Criteria
    // Ensure genre from DB matches keys in markingCriteria (case-sensitive)
    const criteriaForGenre = markingCriteria[genre as keyof typeof markingCriteria];
    if (!criteriaForGenre) {
        console.error(`No marking criteria found for genre: "${genre}". Check if genre exists in markingCriteria object.`);
        // Optionally update submission status to 'error'
        // await supabase.from('submissions').update({ feedback_status: 'error', marker_notes: 'Invalid genre for marking.' }).eq('id', submissionId);
        return { error: `Invalid or unsupported genre for feedback: ${genre}` };
    }
    const criteriaString = JSON.stringify(criteriaForGenre, null, 2);
    console.log(`Criteria loaded for genre: ${genre}`);

    // 4. Construct the Full Prompt for OpenAI
    const systemPrompt = `You are an expert, objective, and encouraging NSW Selective Schools Writing Test Examiner for Year 5 and Year 6 students. Your specific task is to assess writing samples based ONLY on the provided official criteria and prompt. Provide feedback that is clear, specific, constructive, and phrased appropriately for this age group and their parents. Adhere strictly to the requested JSON output format.`;
    const userPrompt = `
Please evaluate the following student writing submission based ONLY on the provided prompt and the official NSW Selective Writing criteria for the specified genre.

1. Writing Prompt Given to Student:
${promptText}

2. Genre Specified:
${genre}

3. Student's Writing Submission:
\`\`\`text
${plainTextContent}
\`\`\`

4. Marking Criteria for Genre "${genre}":
\`\`\`json
${criteriaString}
\`\`\`

5. Required Output Format (Strictly adhere to this JSON structure):
Provide your entire evaluation as a single valid JSON object with NO text outside of it:
\`\`\`json
{
  "genre": "${genre}",
  "scores": {
    "structure_organisation": { "score": number, "explanation": string },
    "language_vocabulary": { "score": number, "explanation": string },
    "grammar_spelling_punctuation": { "score": number, "explanation": string },
    "genre_conventions": { "score": number, "explanation": string },
    "creativity_effectiveness_voice": { "score": number, "explanation": string }
  },
  "totalScore": number,
  "overallComment": string,
  "highlights": [ { "quote": string, "criterion": string, "comment": string } ],
  "suggestions": {
    "structure_organisation": [ string?, string? ],
    "language_vocabulary": [ string?, string? ],
    "grammar_spelling_punctuation": [ string?, string? ],
    "genre_conventions": [ string?, string? ],
    "creativity_effectiveness_voice": [ string?, string? ]
  }
}
\`\`\`

Detailed Instructions:
- Score each criterion 1-5 based ONLY on the provided rubric definitions (High/Low descriptions). Calculate totalScore (max 25).
- Justify each score with 2-3 clear sentences referencing the rubric/submission content examples.
- Write a 4-5 sentence Overall Comment summarizing strengths and key areas for improvement based on the criteria scores.
- Identify 3-6 specific EXACT quotes from the 'Student's Writing Submission' text for the 'highlights' array. Link each quote to ONE relevant criterion and add a brief comment explaining why it's a positive or negative example related to that criterion. Ensure the 'quote' is verbatim from the submission.
- Provide 1-2 actionable, specific suggestions for criteria scoring below 5 in the 'suggestions' object. Suggestions should guide the student on HOW to improve (e.g., "Try using stronger verbs like..." instead of just "Improve vocabulary"). Use empty arrays [] if score is 5/5 for a criterion.
- Ensure the entire output is ONLY the valid JSON object requested, starting with { and ending with }.
    `;

    // 5. Call OpenAI API
    console.log(`Calling OpenAI API for submission ${submissionId}...`);
    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo", // Or "gpt-4o" or your preferred model
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }, // Request JSON output
        temperature: 0.3, // Lower temperature for more consistent marking
        // max_tokens: 2500, // Optional: Set a token limit if needed
    });

    const aiResponseContent = completion.choices[0]?.message?.content;

    if (!aiResponseContent) {
        // Attempt to update status to 'error' before throwing
        await supabase.from('submissions').update({ feedback_status: 'error', marker_notes: 'OpenAI response was empty.' }).eq('id', submissionId);
        throw new Error('OpenAI response content was empty or null.');
    }
    console.log(`OpenAI response received for submission ${submissionId}.`);


    // 6. Parse the Response
    let feedbackData: AIFeedbackResponse;
    try {
        feedbackData = JSON.parse(aiResponseContent);
        // Add slightly more robust validation
        if (!feedbackData.scores || typeof feedbackData.totalScore !== 'number' ||
            !feedbackData.overallComment || !Array.isArray(feedbackData.highlights) || !feedbackData.suggestions) {
            console.error("Parsed JSON from OpenAI is missing required fields:", feedbackData);
            throw new Error('Parsed JSON is missing required fields.');
        }
        // Optional: Validate score ranges, highlight content etc.
        console.log(`Successfully parsed OpenAI JSON response for submission ${submissionId}.`);
    } catch (parseError) {
        console.error(`Error parsing OpenAI JSON response for submission ${submissionId}:`, parseError);
        console.error("Raw AI Response content (may be large):", aiResponseContent); // Log raw response on parse failure
        // Attempt to update status to 'error'
        await supabase.from('submissions').update({ feedback_status: 'error', marker_notes: 'Failed to parse AI response.' }).eq('id', submissionId);
        return { error: 'Failed to process AI feedback response.' };
    }

    // 7. Update Database with Feedback
    // IMPORTANT: Double-check these column names EXACTLY match your Supabase 'submissions' table schema!
    console.log(`Updating database for submission ${submissionId} with feedback...`);
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        feedback_status: 'completed', // Mark as completed
        overall_score: feedbackData.totalScore,
        scores_by_criterion: feedbackData.scores, // Stored as JSONB
        marker_notes: feedbackData.overallComment, // Stored as TEXT
        highlights: feedbackData.highlights,      // Stored as JSONB
        suggestions: feedbackData.suggestions     // Stored as JSONB
      })
      .eq('id', submissionId);

    if (updateError) {
        console.error(`Error updating submission ${submissionId} in database:`, JSON.stringify(updateError, null, 2));
        // Feedback was generated but failed to save - status remains 'pending' or previous state.
        // Consider setting status to 'error' here too? Or leave as 'pending' for retry?
        return { error: 'Feedback generated but failed to save to database.' };
    }

    console.log(`Successfully generated and saved feedback for submission ${submissionId}.`);
    return { success: true, feedback: feedbackData }; // Return success

  } catch (error: unknown) { // Catch unexpected errors during the process
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during feedback generation.';
      console.error(`Unhandled error generating feedback for submission ${submissionId}:`, error);
      // Attempt to update status to 'error' in the database
      try {
         await supabase.from('submissions')
             .update({ feedback_status: 'error', marker_notes: `Unhandled error: ${errorMessage.substring(0, 200)}` }) // Limit error message length
             .eq('id', submissionId);
      } catch (statusUpdateError) {
         console.error(`Additionally failed to update status to 'error' for submission ${submissionId}:`, statusUpdateError);
      }
      return { error: `An unexpected error occurred: ${errorMessage}` };
  }
}