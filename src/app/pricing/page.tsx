// src/app/pricing/page.tsx (Refactored to Client Component)
"use client"; // <-- Make it a Client Component

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use client-side router
import SubscribeButton from '@/components/SubscribeButton'; // Import the button
import { createClient } from '@/lib/supabase/client'; // <-- Use CLIENT helper
import Link from 'next/link';

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient(); // Use client-side client
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  useEffect(() => {
    // Check user session on component mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // If no user session on client, redirect to login
        router.replace('/login?message=Please log in to view pricing');
        // Keep loading true as we are redirecting
      } else {
         // User is logged in
         setIsLoggedIn(true);
         setIsLoading(false); // Stop loading
      }
    };

    checkSession();
  }, [supabase, router]); // Dependencies for useEffect

  // Display loading state while checking session
  if (isLoading) {
     return (
          <div className="flex justify-center items-center min-h-screen bg-slate-50">
              {/* You can add a nicer spinner component here */}
              <p className="text-gray-500 animate-pulse">Loading...</p>
          </div>
      );
  }

  // If loading is false BUT user somehow isn't logged in (should have redirected, but belts & braces)
  if (!isLoggedIn) {
       // This state should ideally not be reached due to the redirect in useEffect
       // but it prevents rendering the page content if the redirect fails/is slow.
       return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
              <p className="text-gray-500">Redirecting to login...</p>
            </div>
       );
  }

  // Render pricing page content only if loading is complete AND user is logged in
  return (
    // Removed container from here, assuming layout provides it or apply styling as needed
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
       {/* Added container class to center content better */}
       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Subscription Required</h1>
          <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Unlock Full Access</h2>
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
              {/* Optional: Link back to dashboard */}
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