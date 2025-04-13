// src/app/pricing/page.tsx (Simplified Client Component)
"use client"; // Keep as client component to use SubscribeButton which likely needs client hooks

import SubscribeButton from '@/components/SubscribeButton'; // Import the button
import Link from 'next/link';
// No Supabase client or auth hooks needed here anymore

export default function PricingPage() {

  // No need for loading state or useEffect auth check here anymore
  // We assume user is logged in if they reach this page via redirect logic

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
       {/* Content container */}
       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Ensure this heading has dark text */}
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Subscription Required</h1>
          <div className="text-center">
               {/* Ensure this heading has dark text */}
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Unlock Full Access</h2>
               {/* Ensure this paragraph has dark text */}
              <p className="text-lg text-gray-600 mb-6">
                  To access unlimited writing practice sessions and all features, please subscribe to our simple plan.
              </p>
              <div className="mb-8">
                  <span className="text-4xl font-extrabold text-indigo-600">$15</span>
                  <span className="text-xl font-medium text-gray-500"> AUD / month</span>
              </div>
              {/* Render the Subscribe Button */}
              <SubscribeButton />
              <p className="text-xs text-gray-400 mt-4">
                  You can manage your subscription anytime.
              </p>
              <div className="mt-6">
                  <Link href="/dashboard" className="text-sm text-indigo-500 hover:underline">
                      Maybe later, back to Dashboard
                  </Link>
              </div>
          </div>
       </div>
    </div>
  );
}