// src/components/TrialCountdown.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Crown, AlertTriangle } from 'lucide-react';
import type { SubscriptionInfo } from '@/lib/subscriptionStatusClient';

interface TrialCountdownProps {
  subscriptionInfo: SubscriptionInfo;
  variant?: 'navbar' | 'banner' | 'compact';
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
}

export function TrialCountdown({ subscriptionInfo, variant = 'banner', className = '' }: TrialCountdownProps) {
  // --- MANUAL OVERRIDE FOR TESTING: Force expired state ---
  // subscriptionInfo = {
  //   ...subscriptionInfo,
  //   isTrialing: true,
  //   isExpired: true,
  //   currentPeriodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // yesterday
  // };

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!subscriptionInfo.isTrialing || !subscriptionInfo.currentPeriodEnd || subscriptionInfo.isExpired) {
      return;
    }

    const calculateTimeRemaining = () => {
      const endDate = new Date(subscriptionInfo.currentPeriodEnd!);
      const now = new Date();
      const timeDiff = endDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));

      setTimeRemaining({ days, hours, minutes, totalHours });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every minute
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [subscriptionInfo.currentPeriodEnd, subscriptionInfo.isTrialing, subscriptionInfo.isExpired]);

  // Don't render if not mounted (SSR compatibility)
  if (!mounted) {
    return null;
  }

  // Don't show for non-trial users or admins
  if (!subscriptionInfo.isTrialing || subscriptionInfo.isAdmin || subscriptionInfo.hasFreeAccess) {
    return null;
  }

  // Trial expired
  if (subscriptionInfo.isExpired) {
    if (variant === 'navbar') {
      return (
        <Link
          href="/pricing"
          className={`px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 flex items-center gap-x-1.5 ${className}`}
        >
          <AlertTriangle size={16} />
          Trial Expired
        </Link>
      );
    }
    return null; // Banner handles expired state
  }

  if (!timeRemaining) {
    return null;
  }

  // Navbar variant - compact display
  if (variant === 'navbar') {
    const isUrgent = timeRemaining.totalHours <= 72; // Last 3 days

    return (
      <Link
        href="/pricing"
        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-x-1.5 ${isUrgent
            ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
            : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
          } ${className}`}
      >
        <Clock size={16} />
        {timeRemaining.days > 0
          ? `${timeRemaining.days}d left`
          : `${timeRemaining.hours}h left`
        }
      </Link>
    );
  }

  // Compact variant - minimal display
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Clock size={16} className="text-blue-600" />
        <span className="font-medium">
          {timeRemaining.days > 0
            ? `${timeRemaining.days} day${timeRemaining.days === 1 ? '' : 's'} left`
            : timeRemaining.totalHours > 0
              ? `${timeRemaining.hours} hour${timeRemaining.hours === 1 ? '' : 's'} left`
              : `${timeRemaining.minutes} minute${timeRemaining.minutes === 1 ? '' : 's'} left`
          }
        </span>
      </div>
    );
  }

  // Banner variant - detailed display
  const isUrgent = timeRemaining.totalHours <= 72; // Last 3 days
  const isCritical = timeRemaining.totalHours <= 24; // Last 24 hours

  return (
    <div className={`w-full rounded-lg p-4 border ${isCritical
        ? 'bg-red-50 border-red-200'
        : isUrgent
          ? 'bg-amber-50 border-amber-200'
          : 'bg-blue-50 border-blue-200'
      } ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Clock className={`h-6 w-6 ${isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-blue-600'
              }`} />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isCritical ? 'text-red-800' : isUrgent ? 'text-amber-800' : 'text-blue-800'
              }`}>
              {isCritical ? 'Trial ends very soon!' : isUrgent ? 'Trial ending soon' : 'Free trial active'}
            </h3>
            <div className={`text-sm ${isCritical ? 'text-red-700' : isUrgent ? 'text-amber-700' : 'text-blue-700'
              }`}>
              <div className="flex items-center gap-4 mt-1">
                {timeRemaining.days > 0 && (
                  <span className="font-mono text-lg font-bold">
                    {timeRemaining.days}d {timeRemaining.hours}h
                  </span>
                )}
                {timeRemaining.days === 0 && timeRemaining.totalHours > 0 && (
                  <span className="font-mono text-lg font-bold">
                    {timeRemaining.hours}h {timeRemaining.minutes}m
                  </span>
                )}
                {timeRemaining.totalHours === 0 && (
                  <span className="font-mono text-lg font-bold text-red-600">
                    {timeRemaining.minutes}m remaining
                  </span>
                )}
                <span className="text-xs">
                  {isCritical ? 'Subscribe now to avoid interruption' : 'Subscribe to continue access'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Link
          href="/pricing"
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isCritical
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : isUrgent
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
        >
          <Crown className="h-4 w-4 mr-2" />
          Subscribe Now
        </Link>
      </div>
    </div>
  );
}
