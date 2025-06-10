// src/components/dashboard/TrialStatusBanner.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Crown } from 'lucide-react';
import { TrialCountdown } from '@/components/TrialCountdown';
import type { SubscriptionInfo } from '@/lib/subscriptionStatus';

interface TrialStatusBannerProps {
  subscriptionInfo: SubscriptionInfo;
}

export function TrialStatusBanner({ subscriptionInfo }: TrialStatusBannerProps) {
  // Don't show banner for admins or users with free access
  if (subscriptionInfo.isAdmin || subscriptionInfo.hasFreeAccess) {
    return null;
  }

  // Show trial countdown for active trials
  if (subscriptionInfo.isTrialing && !subscriptionInfo.isExpired) {
    return <TrialCountdown subscriptionInfo={subscriptionInfo} variant="banner" className="mb-6" />;
  }

  // Show trial expired banner
  if (subscriptionInfo.isTrialing && subscriptionInfo.isExpired) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">
                Your trial has expired
              </h3>
              <p className="text-sm text-red-700">
                Subscribe now to continue accessing premium features and writing practice.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  // Show non-trialing expired subscription
  if (subscriptionInfo.isExpired && !subscriptionInfo.isTrialing) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">
                Subscription expired
              </h3>
              <p className="text-sm text-red-700">
                Your subscription has expired. Renew to continue accessing premium features.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <Crown className="h-4 w-4 mr-2" />
            Renew Now
          </Link>
        </div>
      </div>
    );
  }

  // No banner for active subscriptions
  return null;
}
