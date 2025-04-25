// Define the structure for storing criteria
// IMPORTANT: Ensure the top-level keys EXACTLY match the 'genre' values stored in your 'prompts' table.
const markingCriteria = {
  "Creative": { // Example using 'Creative' as the key if that's what's in your DB
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
  // Consider moving this to a separate file (e.g., lib/criteria.ts) and importing it
};