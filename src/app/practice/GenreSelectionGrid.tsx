// src/app/practice/GenreSelectionGrid.tsx

"use client"; // <-- MUST be the very first line

import { useRouter } from 'next/navigation';
import React from 'react'; // Import React if using JSX

// Define type for genres array passed as prop
type Genre = {
    name: string;
    dbValue: string;
    description: string;
    color: string;
};

interface GenreSelectionGridProps {
    genres: Genre[];
}

// Use React.FC or just function component syntax
const GenreSelectionGrid: React.FC<GenreSelectionGridProps> = ({ genres }) => {
    const router = useRouter();

    const handleSelectGenre = (genreDbValue: string) => {
        // Navigate to instructions page, passing the database value
        router.push(`/instructions?genre=${encodeURIComponent(genreDbValue)}`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genres.map((genre) => (
                <div key={genre.name} className={`border rounded-lg p-6 shadow flex flex-col justify-between ${genre.color}`}>
                    <div>
                        {/* Added dark text color */}
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">{genre.name}</h2>
                        {/* Added text color */}
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
    );
}

export default GenreSelectionGrid; // Export the component