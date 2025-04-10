// src/app/practice/page.tsx (Updated with dbValue)
"use client";

import { useRouter } from 'next/navigation';

// Update genres array to include both display name and database value
const genres = [
  { name: 'Creative Writing', dbValue: 'Creative', description: 'Develop imaginative stories with engaging characters and plots.', color: 'bg-pink-100 border-pink-300' },
  { name: 'Persuasive Writing', dbValue: 'Persuasive', description: 'Craft compelling arguments to convince your audience.', color: 'bg-blue-100 border-blue-300' },
  { name: 'Article Writing', dbValue: 'Article', description: 'Create informative and engaging articles on various topics.', color: 'bg-green-100 border-green-300' }, // Assuming 'Article' in DB
  { name: 'Diary Entry', dbValue: 'Diary Entry', description: 'Write personal reflections from a specific perspective.', color: 'bg-yellow-100 border-yellow-300' }, // Assuming 'Diary Entry' in DB
  { name: 'News Report', dbValue: 'News Report', description: 'Develop factual news stories with the key information.', color: 'bg-purple-100 border-purple-300' }, // Assuming 'News Report' in DB
];
// *** IMPORTANT: Adjust the `dbValue` for each genre above to exactly match what's stored in your Supabase `prompts` table's `genre` column! ***

export default function SelectGenrePage() {
  const router = useRouter();

  // Updated handler to use dbValue for navigation
  const handleSelectGenre = (genreDbValue: string) => {
    // Navigate to the writing page, passing the database value as the query parameter
    router.push(`/writing?genre=${encodeURIComponent(genreDbValue)}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Choose a Writing Genre</h1>
      <p className="text-lg text-gray-600 text-center mb-10">
        Select a genre to practice your writing skills. Each genre offers unique prompts to help you prepare for the NSW selective test.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {genres.map((genre) => (
          <div key={genre.name} className={`border rounded-lg p-6 shadow flex flex-col justify-between ${genre.color}`}>
            <div>
              <h2 className="text-xl font-semibold mb-2">{genre.name}</h2>
              <p className="text-gray-700 mb-4 text-sm">{genre.description}</p>
            </div>
            <button
              // Pass the dbValue to the handler
              onClick={() => handleSelectGenre(genre.dbValue)}
              className="w-full mt-auto bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}