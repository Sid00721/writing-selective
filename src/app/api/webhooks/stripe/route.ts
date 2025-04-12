// src/app/api/webhooks/stripe/route.ts (TEMPORARY - NO SUPABASE BUILD TEST)
import { headers } from 'next/headers';
import { buffer } from 'node:stream/consumers';
import Stripe from 'stripe';
// import { createAdminClient } from '@/lib/supabase/admin'; // <-- COMMENTED OUT
import { NextResponse } from 'next/server';
// import { type PostgrestError } from '@supabase/supabase-js'; // <-- COMMENTED OUT (if not used elsewhere)
// import { createClient } from '@supabase/supabase-js'; // <-- COMMENTED OUT


// --- REMOVED Build Step Workaround ---
// try { ... createClient ... } catch { ... }
// --- END REMOVED ---


// Initialize Stripe Client (keep as is)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
});

// Webhook secret checks (keep as is)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
// ... other env var checks ...

// --- Main POST Handler ---
export async function POST(req: Request) {
  console.log('Stripe webhook POST request received.');
  let event: Stripe.Event;
  const signature = headers().get('stripe-signature');

  // 1. Read raw body and verify webhook signature (Keep as is)
  try {
    if (!signature) throw new Error('Missing stripe-signature header');
    if (!req.body) throw new Error('Request body is missing');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqBuffer = await buffer(req.body as any);
    event = stripe.webhooks.constructEvent(reqBuffer, signature, webhookSecret);
    console.log(`Stripe event constructed: ${event.id}, Type: ${event.type}`);
  } catch (err: unknown) {
      const errorMessage = (err instanceof Error) ? err.message : 'Unknown error during signature verification';
      console.error(`❌ Error verifying webhook signature: ${errorMessage}`);
      return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // --- Supabase Admin Client REMOVED FOR TEST ---
  // let supabaseAdmin;
  // try {
  //      supabaseAdmin = createAdminClient();
  // } catch (adminClientError: unknown) { ... }
  // --- END REMOVED ---

  let relevantCustomerId: string | null = null;
  let relevantSubscriptionId: string | null = null;
  // let relevantUserId: string | null = null; // Not needed without DB updates

  // 2. Handle the specific event type (LOGGING ONLY FOR TEST)
  try {
    console.log(`[BUILD TEST] Received verified event: ${event.type}`);
    // Comment out or remove database update logic within the switch cases
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.paid':
      case 'checkout.session.completed':
         // Just log, don't call helper functions
         console.log(`[BUILD TEST] Processing event type: ${event.type}`);
         break;
      default:
        console.log(`- Unhandled event type: ${event.type}`);
    }

    // Always return success for build test
    return new NextResponse(JSON.stringify({ received: true, test_mode: true }), { status: 200 });

  } catch (error: unknown) { // Keep outer catch just in case
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error in event handling';
      console.error(`Webhook handler error processing event ${event.id}:`, error);
      return new NextResponse(`Webhook handler error: ${errorMessage}`, { status: 500 });
  }
}

// --- Helper Functions REMOVED FOR TEST ---
// async function updateProfileSubscriptionStatus(...) { ... }
// async function updateProfileCustomerId(...) { ... }