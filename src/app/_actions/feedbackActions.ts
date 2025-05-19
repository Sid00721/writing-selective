// src/app/_actions/feedbackActions.ts
"use server";

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// --- TYPE DEFINITIONS ---

interface LexicalNode {
    type: string;
    text?: string;
    children?: LexicalNode[];
}

interface LexicalRootObject {
    root: {
      children: LexicalNode[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface SubmissionWithPromptData {
  content_json: LexicalRootObject | null;
  prompt_id: number | null;
  prompts: {
    genre: string;
    prompt_text: string;
  } | null;
}

interface CriterionFeedback {
  score: number;
  explanation: string;
  positives: string[];
  improvements: string[];
}

// AIFeedbackResponse matches your refined prompt's requested JSON structure
interface AIFeedbackResponse {
  genre: string;
  scores: {
    structure_organisation: CriterionFeedback;
    language_vocabulary: CriterionFeedback;
    grammar_spelling_punctuation: CriterionFeedback;
    genre_conventions: CriterionFeedback;
    creativity_effectiveness_voice: CriterionFeedback;
  };
  totalScore: number;
  overallComment: string;
  strengths: string[];           // Overall strengths from AI
  areasForImprovement: string[]; // Overall areas for improvement from AI
}

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
};

function extractPlainTextFromLexical(lexicalJson: LexicalRootObject | null | undefined): string {
    let textContent = '';
    if (!lexicalJson) { return ''; }
    if (typeof lexicalJson !== 'object' || !lexicalJson.root || !Array.isArray(lexicalJson.root.children)) {
        console.warn("Invalid Lexical JSON for text extraction:", lexicalJson);
        return '';
    }
    function traverse(nodes: LexicalNode[]) {
        for (const node of nodes) {
            if (node.type === 'text' && typeof node.text === 'string') { textContent += node.text; }
            else if (node.type === 'linebreak') { textContent += (textContent.length > 0 && !/\s$/.test(textContent)) ? '\n' : (textContent.length === 0 ? '\n' : '');}
            if (Array.isArray(node.children) && node.children.length > 0) { traverse(node.children); }
            if (['paragraph', 'heading', 'list', 'listitem', 'quote'].includes(node.type)) {
                 if (textContent.length > 0 && !/\s\s$/.test(textContent)) { textContent += '\n\n'; }
            }
        }
    }
    traverse(lexicalJson.root.children);
    return textContent.replace(/\n{3,}/g, '\n\n').trim();
}

export async function generateFeedbackForSubmission(submissionId: number): Promise<{ success?: boolean; error?: string; feedback?: AIFeedbackResponse }> {
  console.log(`Starting feedback generation for submission ID: ${submissionId}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openAIApiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !openAIApiKey) {
    console.error("Feedback Action Error: Missing Supabase URL/Service Key or OpenAI Key environment variables!");
    return { error: "Server configuration error." };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  console.log("Initialized Supabase client with Service Role Key.");
  const openai = new OpenAI({ apiKey: openAIApiKey });

  try {
    console.log(`Workspaceing data for submission ${submissionId}...`); // Corrected typo

    const { data, error: fetchError } = await supabase
        .from('submissions')
        .select(`content_json, prompt_id, prompts ( genre, prompt_text )`)
        .eq('id', submissionId)
        .single<SubmissionWithPromptData>();

    if (fetchError || !data) {
        console.error(`Error fetching submission ${submissionId}:`, fetchError?.message ?? 'Data was null');
        return { error: `Database error or submission not found: ${fetchError?.message ?? 'Data null'}` };
    }

    const promptsData = data.prompts;
    const content_json = data.content_json;
    const plainTextContent = extractPlainTextFromLexical(content_json);
    const genre = promptsData?.genre;
    const promptText = promptsData?.prompt_text;

    if (!plainTextContent || !promptsData || !genre || !promptText) {
        console.error(`Submission ${submissionId} validation failed: Missing extracted text, prompts object, genre, or prompt_text.`);
        if (!plainTextContent && content_json) {
             console.warn("Text extraction resulted in empty string from non-null JSON input for submission " + submissionId);
        }
        return { error: `Submission ${submissionId} data incomplete or text extraction failed.` };
    }
    console.log(`Data fetched & validated for submission ${submissionId}. Genre: ${genre}.`);

    const criteriaForGenreObject = markingCriteria[genre as keyof typeof markingCriteria];
    if (!criteriaForGenreObject) {
        console.error(`No detailed marking criteria found for genre: "${genre}".`);
        return { error: `Invalid or unsupported genre for feedback: ${genre}` };
    }
    let detailedRubricText = "";
    for (const [criterionName, description] of Object.entries(criteriaForGenreObject)) {
        detailedRubricText += `Criterion: ${criterionName}\n${description}\n\n`;
    }
    detailedRubricText = detailedRubricText.trim();
    console.log(`Detailed rubric text formatted for prompt for genre: ${genre}`);

    const systemPrompt = `You are an **extremely critical, strict, and uncompromising** NSW Selective School Writing Examiner for Year 5 and 6 students. Your task is to **rigorously and meticulously assess** student writing against **the highest selective school entry standards**. Your feedback must be **honest, stern, and precise**, thoroughly identifying all flaws, weaknesses, and areas for improvement, no matter how minor.

You will be provided with a writing sample, the specified genre, and the detailed marking rubric. Your primary focus must be on critiquing the writing with a sharp, discerning eye. You must scrutinize every aspect of the writing, including structure, language, grammar, genre conventions, and creativity.

You MUST structure your entire response as a single, valid JSON object adhering strictly to the format provided. Do NOT include any text outside this JSON object. **Under no circumstances should you be lenient or overly generous in your assessment. Even minor issues should be noted and critiqued.**`;

    const userPrompt = `
**Writing Assessment Task**

**Student's Writing Submission:**
\`\`\`text
${plainTextContent}
\`\`\`

**Original Writing Prompt Given to Student:**
${promptText}

**Specified Genre:**
${genre}

**Detailed Marking Rubric for "${genre}":**
(Use these "High" and "Low" descriptors when providing explanations, positives, and improvements for each criterion. "High" indicates strong performance expected at selective entry level; "Low" indicates significant developmental areas.)
${detailedRubricText}

**Required JSON Output Structure:**
Provide your entire evaluation as a single, valid JSON object. Do NOT include any text outside this JSON object.
The JSON object must have the following top-level keys: "genre", "scores", "totalScore", "overallComment", "strengths", "areasForImprovement".
The "scores" object must contain exactly these five keys: "structure_organisation", "language_vocabulary", "grammar_spelling_punctuation", "genre_conventions", "creativity_effectiveness_voice".
For each of these five score keys, the value must be an object with the following keys: "score" (number 1-5), "explanation" (string, 2-3 sentences), "positives" (array of exactly 3 distinct strings), "improvements" (array of 0-5 strings; this array MUST be empty [] if score is 5/5).

Example JSON structure:
\`\`\`json
{
  "genre": "${genre}",
  "scores": {
    "structure_organisation": {
      "score": "number (integer from 1 to 5, strictly assessed)",
      "explanation": "string (critical 2-3 sentences justifying the score based on the rubric, citing specific examples or lack thereof from student's writing)",
      "positives": ["string (specific positive example 1 related to criterion that meets a 'High' descriptor)", "string (specific positive example 2)", "string (specific positive example 3)"],
      "improvements": ["string (actionable improvement 1 to reach 'High' standard, if score < 5)", "string (actionable improvement 2, if score < 5, up to 5 total or empty array if score is 5/5)"]
    },
    "language_vocabulary": { "score": "number", "explanation": "string", "positives": ["string","string","string"], "improvements": ["string (if score < 5, or empty array)"] },
    "grammar_spelling_punctuation": { "score": "number", "explanation": "string", "positives": ["string","string","string"], "improvements": ["string (if score < 5, or empty array)"] },
    "genre_conventions": { "score": "number", "explanation": "string", "positives": ["string","string","string"], "improvements": ["string (if score < 5, or empty array)"] },
    "creativity_effectiveness_voice": { "score": "number", "explanation": "string", "positives": ["string","string","string"], "improvements": ["string (if score < 5, or empty array)"] }
  },
  "totalScore": "number (sum of the 5 criteria scores, integer, max 25)",
  "overallComment": "string (critical yet constructive 4-5 sentence summary, highlighting genuine key achievements and primary areas for focused improvement to meet selective standards)",
  "strengths": ["string (overall positive point 1, distinct and significant)", "string (overall positive point 2, if applicable)"],
  "areasForImprovement": ["string (overall actionable suggestion 1 for major improvement)", "string (overall actionable suggestion 2, if applicable)"]
}
\`\`\`

**Detailed Instructions for AI Response Generation (What to Include in Your Response):**
1.  For each of the 5 criteria (structure_organisation, language_vocabulary, grammar_spelling_punctuation, genre_conventions, creativity_effectiveness_voice):
    a.  Assign a 'score' as an integer from 1 to 5, based strictly on the provided detailed marking rubric.
    b.  Write a concise 'explanation' (2–3 sentences) justifying the score, referencing specific aspects of the student's writing and the rubric.
    c.  List exactly 3 distinct 'positives' as an array of strings. These should be brief, concrete examples or observations of what the student did well for that criterion.
    d.  If the score for a criterion is less than 5, provide 1 to 5 specific, actionable 'improvements' as an array of strings. These suggestions must directly guide the student on HOW to improve. If the score is 5/5 for a criterion, the 'improvements' array MUST be an empty array \`[]\`.
2.  Calculate the 'totalScore' (sum of the 5 criteria scores, integer, max 25).
3.  Write an 'overallComment' (4–5 sentences) providing specific praise and suggestions for improvement, reflecting the standard of a Year 5/6 Selective School Test.
4.  Provide an array called 'strengths' containing 2-3 specific, significant overall positive points about the writing, distinct from the per-criterion positives. If there are fewer than 2-3 genuine overall strengths, provide what is accurate.
5.  Provide an array called 'areasForImprovement' containing 2-3 specific, overall actionable suggestions for the student to focus on next, distinct from the per-criterion improvements. If fewer than 2-3 major areas, provide what is most critical.
6.  The entire response must be a single valid JSON object. Do not include any introductory or concluding text outside the JSON structure.
    `; // End of userPrompt template literal

    console.log(`Calling OpenAI API for submission ${submissionId} with model gpt-4o...`);
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.15,
    });
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`OpenAI API call for ${submissionId} (gpt-4o) succeeded in ${duration} ms`);

    const aiResponseContent = completion.choices[0]?.message?.content;
    if (!aiResponseContent) {
        await supabase.from('submissions').update({ feedback_status: 'error', marker_notes: 'OpenAI response was empty.' }).eq('id', submissionId);
        throw new Error('OpenAI response content was empty or null.');
    }
    console.log(`OpenAI response received. Length: ${aiResponseContent.length}. Snippet: ${aiResponseContent.substring(0,200)}...`);

    let feedbackData: AIFeedbackResponse;
    try {
        feedbackData = JSON.parse(aiResponseContent);
        const requiredScoreKeys: (keyof AIFeedbackResponse['scores'])[] = [
            'structure_organisation', 'language_vocabulary', 'grammar_spelling_punctuation',
            'genre_conventions', 'creativity_effectiveness_voice'
        ];
        let isValid = true;
        if (!feedbackData.genre || !feedbackData.scores || typeof feedbackData.totalScore !== 'number' || !feedbackData.overallComment ||
            !Array.isArray(feedbackData.strengths) || !Array.isArray(feedbackData.areasForImprovement) ) { // Added checks for new arrays
            isValid = false;
            console.error("Missing top-level fields in AI response (incl. strengths/areasForImprovement):", feedbackData);
        }
        if (isValid) {
            for (const key of requiredScoreKeys) {
                const scoreDetail = feedbackData.scores[key];
                if (!scoreDetail || typeof scoreDetail.score !== 'number' || !scoreDetail.explanation ||
                    !Array.isArray(scoreDetail.positives) ||
                    !Array.isArray(scoreDetail.improvements)) {
                    isValid = false;
                    console.error(`Missing or invalid structure for criterion: ${key}`, scoreDetail);
                    break;
                }
                if (scoreDetail.score === 5 && scoreDetail.improvements.length > 0) {
                    console.warn(`AI provided improvements for a 5/5 score on ${key}. Clearing improvements array.`);
                    scoreDetail.improvements = [];
                }
                if (scoreDetail.positives.length > 3) { // Check if more than 3 positives were given
                    console.warn(`Criterion ${key} has ${scoreDetail.positives.length} positives, expected 3. Truncating.`);
                    scoreDetail.positives = scoreDetail.positives.slice(0, 3); // Keep only the first 3
                } else if (scoreDetail.positives.length < 3 && scoreDetail.positives.length > 0) {
                     console.warn(`Criterion ${key} has ${scoreDetail.positives.length} positives, expected 3. AI may not have found 3 distinct points.`);
                } else if (scoreDetail.positives.length === 0 && scoreDetail.score > 0) {
                     console.warn(`Criterion ${key} has 0 positives despite a score of ${scoreDetail.score}. AI may need prompt adjustment for positives.`);
                }
            }
        }

        if (!isValid) {
            console.error("Parsed JSON from OpenAI is missing required fields or has incorrect types:", feedbackData);
            throw new Error('Parsed JSON is missing required fields or has incorrect types.');
        }
        console.log(`Successfully parsed OpenAI JSON response for submission ${submissionId}.`);
    } catch (parseError) {
        console.error(`Error parsing OpenAI JSON:`, parseError, "Raw content snippet:", aiResponseContent.substring(0, 500));
        await supabase.from('submissions').update({ feedback_status: 'error', marker_notes: 'Failed to parse AI response.' }).eq('id', submissionId);
        return { error: 'Failed to process AI feedback response.' };
    }

    console.log(`Updating database for submission ${submissionId} with feedback...`);
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        feedback_status: 'completed',
        overall_score: feedbackData.totalScore,
        scores_by_criterion: feedbackData.scores,
        marker_notes: feedbackData.overallComment,
        highlights: null,
        suggestions: null,
        // *** Ensure these match your database column names ***
        overall_strengths: feedbackData.strengths,
        overall_areas_for_improvement: feedbackData.areasForImprovement,
      })
      .eq('id', submissionId);

    if (updateError) {
        console.error(`Error updating submission ${submissionId} in database:`, updateError);
        return { error: 'Feedback generated but failed to save to database.' };
    }

    console.log(`Successfully generated and saved feedback for submission ${submissionId}.`);
    return { success: true, feedback: feedbackData };

  } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during feedback generation.';
      console.error(`Unhandled error for submission ${submissionId}:`, error);
      try {
         await supabase.from('submissions').update({ feedback_status: 'error', marker_notes: `Unhandled error: ${errorMessage.substring(0, 200)}` }).eq('id', submissionId);
      } catch (statusUpdateError) { console.error(`Additionally failed to update status:`, statusUpdateError); }
      return { error: `An unexpected error occurred: ${errorMessage}` };
  }
}