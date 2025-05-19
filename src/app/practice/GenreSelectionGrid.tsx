// src/app/practice/GenreSelectionGrid.tsx
"use client";

import { useRouter } from 'next/navigation';
import React from 'react';

// Updated Genre type to reflect new structure from page.tsx
type Genre = {
    name: string;
    dbValue: string;
    description: string;
    bgColor: string;    // e.g., 'bg-pink-100'
    textColor: string;  // e.g., 'text-pink-700'
    borderColor?: string; // Kept for potential future use, but not for main card border now
    buttonHoverBg?: string; // Example, not used in this iteration
};

interface GenreSelectionGridProps {
    genres: Genre[];
}

const GenreSelectionGrid: React.FC<GenreSelectionGridProps> = ({ genres }) => {
    const router = useRouter();

    const handleSelectGenre = (genreDbValue: string) => {
        router.push(`/instructions?genre=${encodeURIComponent(genreDbValue)}`);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {genres.map((genre) => (
                <div
                    key={genre.name}
                    // Prominent border card with dynamic background color from genre
                    className={`p-6 rounded-xl shadow-xl border-2 border-gray-800 flex flex-col justify-between h-full group hover:shadow-2xl transition-shadow duration-300 ease-in-out ${genre.bgColor}`}
                >
                    <div>
                        <h2 className={`text-xl font-semibold mb-2 ${genre.textColor} group-hover:opacity-80 transition-opacity`}>
                            {genre.name}
                        </h2>
                        <p className={`${genre.textColor} opacity-90 mb-4 text-sm leading-relaxed flex-grow`}>
                            {genre.description}
                        </p>
                    </div>
                    <button
                        onClick={() => handleSelectGenre(genre.dbValue)}
                        // Primary dark button, consistent across cards
                        className="w-full mt-4 bg-gray-800 hover:bg-gray-700 focus:bg-gray-900 text-white font-medium py-2.5 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Select
                    </button>
                </div>
            ))}
        </div>
    );
}

export default GenreSelectionGrid;