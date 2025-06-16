// src/components/dashboard/TrialStatusBanner.tsx
"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
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
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-800">
              Your trial has expired
            </h3>
            <p className="text-sm text-red-700">
              Subscribe using the button in the top navigation to continue accessing premium features and writing practice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show non-trialing expired subscription
  if (subscriptionInfo.isExpired && !subscriptionInfo.isTrialing) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-800">
              Subscription expired
            </h3>
            <p className="text-sm text-red-700">
              Your subscription has expired. Use the &quot;Renew&quot; button in the top navigation to continue accessing premium features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show banner for canceled/inactive subscriptions
  if (!subscriptionInfo.isActive && !subscriptionInfo.isTrialing && !subscriptionInfo.isExpired) {
    return (
      <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-orange-800">
              Subscription Required
            </h3>
            <p className="text-sm text-orange-700">
              {subscriptionInfo.subscriptionStatus === 'canceled' 
                ? 'Your subscription was canceled. Use the &quot;Resubscribe&quot; button in the top navigation to regain access to premium features.'
                : 'You need an active subscription to access premium features. Use the &quot;Subscribe&quot; button in the top navigation to get started.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No banner for active subscriptions
  return null;
}
