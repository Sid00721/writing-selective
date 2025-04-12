// src/app/pricing/page.tsx
import SubscribeButton from '@/components/SubscribeButton'; // Import the button component
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PricingPage() {
     // --- ADD RUNTIME ENV VAR LOGS ---
  console.log('[Pricing Page Runtime] Checking Env Vars:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:',
    process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Exists' : 'MISSING!'
  );
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Exists' : 'MISSING!'
  );
  // Optional: Log the actual URL prefix to double-check value
  // console.log('URL Prefix:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20));
  // --- END LOGS ---
  const supabase = await createClient();

  // Check if user is logged in, redirect if not
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?message=Please log in to view pricing');
  }

  // Optional: Check if user ALREADY has access (subscribed/admin/free)
  // If so, maybe redirect them directly to dashboard or practice?
  // For simplicity now, we'll just show the page. You can add this check later.
  // const hasAccess = await checkUserAccessStatus(user.id); // Need to import this check
  // if (hasAccess) {
  //    redirect('/dashboard?message=You already have access!');
  // }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Subscription Required</h1>
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
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
        {/* Optional: Link back to dashboard if they somehow landed here */}
         <div className="mt-6">
             <Link href="/dashboard" className="text-sm text-indigo-500 hover:underline">
                 Maybe later, back to Dashboard
             </Link>
         </div>
      </div>
    </div>
  );
}