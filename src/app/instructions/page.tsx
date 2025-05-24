// src/app/instructions/page.tsx (Fixed "use client" placement)

"use client"; // <-- MOVED TO THE VERY TOP OF THE FILE

import { Suspense, useEffect } from "react"; // Import React hooks here now
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // Import hooks needed by child

// --- Child Component Definition ---
// No longer needs "use client" here as the whole file is marked above

// Example Instructions List
const instructionsList = [
  "You will have 30 minutes to complete your writing task.",
  "Read the prompt carefully before you start writing.",
  "Plan your response structure (introduction, body paragraphs, conclusion).",
  "Write clearly and try to use varied vocabulary and sentence structures.",
  "Check your spelling, grammar, and punctuation before finishing.",
  "The timer will start as soon as you click 'Start Test'.",
];

function InstructionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const genre = searchParams.get("genre");

  // Redirect if genre is missing (client-side effect)
  useEffect(() => {
    if (
      searchParams &&
      (!searchParams.has("genre") || !searchParams.get("genre"))
    ) {
      console.log("No genre found in InstructionsContent, redirecting...");
      router.replace("/practice");
    }
  }, [searchParams, router]); // Depend on searchParams object

  const handleStartTest = () => {
    const currentGenre = searchParams.get("genre");
    if (currentGenre) {
      router.push(`/writing?genre=${encodeURIComponent(currentGenre)}`);
    } else {
      alert("Could not determine the genre. Please select one again.");
      router.push("/practice");
    }
  };

  if (!genre) {
    return (
      <div className="text-center p-4 text-gray-500">Verifying genre...</div>
    );
  }

  // Render the actual content
  return (
    <>
      <div className="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-md">
        <p className="font-semibold text-indigo-800">Selected Genre: {genre}</p>
      </div>

      <div className="space-y-3 text-gray-700">
        <h2 className="text-lg font-semibold text-gray-800">
          Please read carefully:
        </h2>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          {instructionsList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="pt-4">
        <button
          onClick={handleStartTest}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
        >
          Start Test
        </button>
      </div>
    </>
  );
}
// --- End Child Component Definition ---

// --- Loading Fallback Component ---
function LoadingFallback() {
  return (
    <div className="text-center p-4">
      <p className="text-gray-500 animate-pulse">Loading instructions...</p>
    </div>
  );
}
// --- End Loading Fallback Component ---

// --- Main Page Component ---
// This component is now also part of the Client Module because of "use client" at the top
export default function InstructionsPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-900">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Writing Test Instructions
        </h1>

        <Suspense fallback={<LoadingFallback />}>
          <InstructionsContent />
        </Suspense>

        <div className="text-sm text-center text-gray-600 pt-2">
          <Link
            href="/practice"
            className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Choose a different genre
          </Link>
        </div>
      </div>
    </div>
  );
}
// --- End Main Page Component ---
