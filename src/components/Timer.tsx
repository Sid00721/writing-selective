// src/components/Timer.tsx
"use client";

import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialMinutes?: number;
  onTimeUp: () => void; // Function to call when timer reaches zero
}

const Timer: React.FC<TimerProps> = ({ initialMinutes = 30, onTimeUp }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);

  useEffect(() => {
    // If time is already up when effect runs, do nothing more
    if (secondsRemaining <= 0) {
      return;
    }

    // Set up the interval timer
    const intervalId = setInterval(() => {
      setSecondsRemaining(prevSeconds => {
        const nextSeconds = prevSeconds - 1;
        if (nextSeconds <= 0) {
          clearInterval(intervalId); // Stop the timer
          onTimeUp(); // Call the callback when time hits zero or below
          return 0; // Ensure state is exactly 0
        }
        return nextSeconds; // Decrement seconds
      });
    }, 1000); // Run every 1 second

    // Cleanup function: Clear interval when component unmounts or onTimeUp changes
    return () => {
      clearInterval(intervalId);
    };
    // Dependencies: Only re-run effect if onTimeUp callback reference changes.
    // We stabilized this in WritingSession, so this should run only once on mount.
  }, [onTimeUp]);

  // Calculate display values
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  // Format time for display (MM:SS)
  const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Optional: Add visual cue when time is low
  const timeLow = secondsRemaining < 60 * 5; // Example: less than 5 minutes

  return (
    <div className={`font-mono text-2xl font-semibold ${timeLow ? 'text-red-600' : 'text-gray-800'}`}>
      Time Remaining: {displayTime}
    </div>
  );
};

export default Timer;