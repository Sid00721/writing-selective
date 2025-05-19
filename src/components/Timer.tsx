// src/components/Timer.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react'; // Using lucide-react for the clock icon

interface TimerProps {
  initialMinutes?: number;
  onTimeUp: () => void;
  // Optional prop to hide "Time Remaining:" text if just icon + time is needed
  showTextLabel?: boolean;
}

const Timer: React.FC<TimerProps> = ({
  initialMinutes = 30,
  onTimeUp,
  showTextLabel = true, // Default to showing "Time Remaining:"
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // If time is already up when effect runs, do nothing more
    if (secondsRemaining <= 0) {
      // Ensure onTimeUp is called if timer starts at or below zero
      // but only if it hasn't been called before to avoid loops.
      // This might require additional state if initialMinutes can be 0.
      // For simplicity, assuming initialMinutes > 0.
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsRemaining(prevSeconds => {
        const nextSeconds = prevSeconds - 1;
        if (nextSeconds <= 0) {
          clearInterval(intervalId);
          onTimeUp();
          return 0;
        }
        return nextSeconds;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  // Re-run effect if onTimeUp or initialMinutes change
  // However, typically for a countdown, initialMinutes changing mid-session is unusual.
  // If onTimeUp is stable (e.g., memoized via useCallback in parent), this is fine.
  }, [onTimeUp, initialMinutes]); // Added initialMinutes for re-initialization if it changes

  // Update timer if initialMinutes prop changes dynamically after mount
  useEffect(() => {
    if(isMounted) { // Only run after initial mount and if prop actually changes
        setSecondsRemaining(initialMinutes * 60);
    }
  }, [initialMinutes, isMounted]);


  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timeLow = secondsRemaining > 0 && secondsRemaining < 60 * 5; // Only low if not yet 0

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md border shadow-sm transition-colors
                  ${timeLow ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-white border-gray-300 text-gray-800'
                  }`}
      title={showTextLabel ? `Time Remaining: ${displayTime}` : displayTime}
    >
      <Clock size={18} className={`flex-shrink-0 ${timeLow ? 'text-red-600' : 'text-gray-500'}`} />
      <span className={`font-mono text-lg font-semibold ${timeLow ? 'text-red-700' : 'text-gray-900'}`}>
        {showTextLabel && <span className="hidden sm:inline mr-1">Time:</span> /* Show "Time:" on larger screens */}
        {displayTime}
      </span>
    </div>
  );
};

export default Timer;