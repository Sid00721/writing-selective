// src/app/pricing/page.tsx (Simplified Client Component with new card style)
"use client";

import SubscribeButton from '@/components/SubscribeButton'; // Ensure this path is correct
import Link from 'next/link';

export default function PricingPage() {
  // This page is now primarily for users who are likely logged in but need to subscribe.
  // The access check and redirect TO this page would happen in server components like /practice or /dashboard.

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
      {/* Optional: You could add your "Selective Writing" brand text here if desired, like on auth pages */}
      {/* <div className="text-center mb-8">
        <Link href="/" className="text-3xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
          Selective Writing
        </Link>
      </div> */}

      {/* Content container - Applying the prominent card style */}
      <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border-2 border-gray-800">
        <div className="text-center space-y-6"> {/* Added space-y-6 for better spacing inside */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900"> {/* Darker text */}
            Subscription Required
          </h1>
          
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800"> {/* Darker text */}
              Unlock Full Access
            </h2>
            <p className="text-md sm:text-lg text-gray-600 mb-6">
              To access unlimited writing practice sessions and all features, please subscribe to our simple plan.
            </p>
          </div>

          <div className="my-6"> {/* Adjusted margin */}
            <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">$15</span> {/* Darker price */}
            <span className="text-lg sm:text-xl font-medium text-gray-500"> AUD / month</span>
          </div>

          {/* Render the Subscribe Button */}
          <div className="mt-2"> {/* Ensure button has some space */}
            <SubscribeButton />
          </div>

          <p className="text-xs text-gray-500 mt-3"> {/* Slightly less muted text */}
            You can manage or cancel your subscription anytime.
          </p>
          
          <div className="mt-6 pt-4 border-t border-gray-200"> {/* Added separator */}
            <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              Maybe later, back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}