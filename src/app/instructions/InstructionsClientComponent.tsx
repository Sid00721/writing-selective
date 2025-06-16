"use client";

import { useRouter } from 'next/navigation';

interface InstructionsClientProps {
  genre: string;
}

export default function InstructionsClientComponent({ genre }: InstructionsClientProps) {
  const router = useRouter();

  const handleStartTest = () => {
    router.push(`/writing?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className='pt-4'>
      <button
        onClick={handleStartTest}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
      >
        Start Test
      </button>
    </div>
  );
}
