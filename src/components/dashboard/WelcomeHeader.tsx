"use client";

interface WelcomeHeaderProps {
  userName?: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        Welcome back{userName ? `, ${userName}` : ""}!
      </h1>
      <p className="text-md text-gray-600 mt-1">
        Continue your writing practice and prepare for the Selective Schools
        Test.
      </p>
    </div>
  );
}
