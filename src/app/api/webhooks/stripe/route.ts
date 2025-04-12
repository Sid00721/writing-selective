// src/app/api/webhooks/stripe/route.ts (Complete Functional Version)
import { headers } from 'next/headers';
import { buffer } from 'node:stream/consumers';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin'; // Import the admin client creator
import { NextResponse } from 'next/server';
import { type PostgrestError } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js'; // Import for dummy client only

// --- Build Step Workaround (Attempt) ---
// Initialize a dummy client at the top level using ONLY public keys.
// This might satisfy Vercel's build analysis. It is NOT used by the POST handler.
try {
  const buildTimeSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const buildTimeSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (buildTimeSupabaseUrl && buildTimeSupabaseAnonKey) {
    createClient(buildTimeSupabaseUrl, buildTimeSupabaseAnonKey);
    console.log("Build-time dummy Supabase client initialized successfully (for analysis only).");
  } else {
    console.warn("Build-time dummy Supabase client NOT initialized - missing public env vars during build?");
  }
} catch(buildError) {
   console.error("Error initializing build-time dummy Supabase client:", buildError);
}
// --- End Build Step Workaround ---


// Initialize Stripe Client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', // Use the version TS expects based on previous errors
  typescript: true,
});

// Get webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
// Check required secrets (log errors if missing, but proceed)
if (!webhookSecret) console.error('CRITICAL ERROR (Webhook): Missing STRIPE_WEBHOOK_SECRET env var.');
if (!process.env.STRIPE_SECRET_KEY) console.error('CRITICAL ERROR (Webhook): Missing STRIPE_SECRET_KEY env var.');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.error('CRITICAL ERROR (Webhook): Missing SUPABASE_SERVICE_ROLE_KEY env var.');


// --- Main POST Handler ---
export async function POST(req: Request) {
  console.log('Stripe webhook POST request received.');
  let event: Stripe.Event;
  const signature = headers().get('stripe-signature');

  // 1. Read raw body and verify webhook signature
  try {
    if (!signature) throw new Error('Missing stripe-signature header');
    if (!req.body) throw new Error('Request body is missing');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqBuffer = await buffer(req.body as any); // Keep workaround for buffer type

    event = stripe.webhooks.constructEvent(reqBuffer, signature, webhookSecret);
    console.log(`Stripe event constructed: ${event.id}, Type: ${event.type}`);

  } catch (err: unknown) {
      const errorMessage = (err instanceof Error) ? err.message : 'Unknown error during signature verification';
      console.error(`❌ Error verifying webhook signature: ${errorMessage}`);
      return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Initialize REAL Supabase Admin Client INSIDE the handler
  let supabaseAdmin;
  try {
       supabaseAdmin = createAdminClient(); // Uses SERVICE_ROLE_KEY at runtime
  } catch (adminClientError: unknown) {
       const errorMessage = (adminClientError instanceof Error) ? adminClientError.message : 'Failed to init admin client';
       console.error(`Webhook Error: ${errorMessage}`);
       // Stop processing if admin client fails
       return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 500 });
  }

  let relevantCustomerId: string | null = null;
  let relevantSubscriptionId: string | null = null;
  let relevantUserId: string | null = null;

  // 2. Handle the specific event type
  try {
    switch (event.type) {

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        relevantCustomerId = subscription.customer as string;
        relevantSubscriptionId = subscription.id;
        console.log(`Handling ${event.type} for sub ${subscription.id}, status ${subscription.status}`);

        // Use type assertion workaround for current_period_end
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const periodEnd = (subscription as any).current_period_end;

        await updateProfileSubscriptionStatus(
          supabaseAdmin,
          relevantCustomerId,
          relevantSubscriptionId,
          subscription.status,
          periodEnd // Pass the extracted value
        );
        break;
      }

       case 'customer.subscription.deleted': {
         const subscription = event.data.object as Stripe.Subscription;
         relevantCustomerId = subscription.customer as string;
         relevantSubscriptionId = subscription.id;
         console.log(`Handling ${event.type} for sub ${subscription.id}, setting status to 'canceled'`);

         await updateProfileSubscriptionStatus(
           supabaseAdmin,
           relevantCustomerId,
           relevantSubscriptionId,
           'canceled',
           null
         );
         break;
       }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        // Use type assertion workaround for invoice.subscription
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscriptionId = (invoice as any).subscription as string | null;

        if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
          relevantCustomerId = invoice.customer as string;
          relevantSubscriptionId = subscriptionId;
          console.log(`Handling ${event.type} for sub ${relevantSubscriptionId}, status ${invoice.status}`);

          await updateProfileSubscriptionStatus(
            supabaseAdmin,
            relevantCustomerId,
            relevantSubscriptionId,
            'active', // Invoice paid means subscription should be active
            invoice.period_end // Assuming invoice.period_end type is correct
          );
        } else {
            console.log(`Invoice ${invoice.id} paid, but not linked to a subscription cycle.`);
        }
        break;
      }

       case 'checkout.session.completed': {
           const session = event.data.object as Stripe.Checkout.Session;
           console.log(`Handling ${event.type} for session ${session.id}`);
           relevantCustomerId = session.customer as string;
           relevantSubscriptionId = session.subscription as string;
           relevantUserId = session.metadata?.user_id ?? null;

           if (session.mode === 'subscription' && relevantCustomerId && relevantUserId) {
               await updateProfileCustomerId(supabaseAdmin, relevantUserId, relevantCustomerId);
               console.log(`Checkout complete for user ${relevantUserId}. Status will be updated by subscription events.`);
           } else {
                console.warn(`Checkout session ${session.id} completed but missing relevant IDs needed for DB update (cust=${relevantCustomerId}, user=${relevantUserId})`);
           }
           break;
       }

      default:
        console.log(`- Unhandled event type: ${event.type}`);
    }

    // Acknowledge event processed successfully
    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });

  } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error in event handling';
      console.error(`Webhook handler error processing event ${event.id} (Customer: ${relevantCustomerId}, Sub: ${relevantSubscriptionId}):`, error);
      // Return 500 to signal failure to Stripe (it might retry)
      return new NextResponse(`Webhook handler error: ${errorMessage}`, { status: 500 });
  }
}


// --- Helper Functions to Update Database ---

async function updateProfileSubscriptionStatus(
    supabase: ReturnType<typeof createAdminClient>,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    newStatus: string,
    periodEndUnix: unknown // Use unknown to avoid lint error
) {
    let periodEndISO: string | null = null;
    // Safely check and convert timestamp
    if (typeof periodEndUnix === 'number') {
        periodEndISO = new Date(periodEndUnix * 1000).toISOString();
    } else if (periodEndUnix !== null && periodEndUnix !== undefined) {
        console.warn(`Webhook received unexpected non-numeric type for periodEndUnix: ${typeof periodEndUnix}`);
    }

    console.log(`DB Update: Profile for Stripe Customer ${stripeCustomerId}: SubID=${stripeSubscriptionId}, Status=${newStatus}, PeriodEnd=${periodEndISO}`);

    const { error } = await supabase
        .from('profiles')
        .update({
            stripe_subscription_id: stripeSubscriptionId,
            subscription_status: newStatus,
            current_period_end: periodEndISO,
         })
        .eq('stripe_customer_id', stripeCustomerId); // Update profile based on Stripe Customer ID

    if (error) {
        console.error(`DB Update Error (Status) for customer ${stripeCustomerId}:`, error);
        // Consider throwing error if retries are desired from Stripe
        // throw new Error(`Database status update failed for ${stripeCustomerId}: ${error.message}`);
    } else {
         console.log(`DB Update Success (Status) for customer ${stripeCustomerId}`);
    }
}

async function updateProfileCustomerId(
    supabase: ReturnType<typeof createAdminClient>,
    userId: string,
    stripeCustomerId: string
) {
     console.log(`DB Update: Profile for User ${userId} with Stripe Customer ID ${stripeCustomerId}`);
     // Check if customer ID already exists to prevent errors / unnecessary updates
     const { data: existingData, error: selectError } = await supabase
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

      if (selectError && selectError.code !== 'PGRST116') { // Allow row not found
          console.error(`DB Update Error (Customer ID Select) for user ${userId}:`, selectError);
          return; // Exit if we can't read the profile
      }

      if (existingData?.stripe_customer_id) {
           if (existingData.stripe_customer_id !== stripeCustomerId) {
                // This case shouldn't happen often - user somehow got a different Stripe customer ID
                console.warn(`User ${userId} already has Stripe Customer ID ${existingData.stripe_customer_id}, but received update for ${stripeCustomerId}. Overwriting.`);
           } else {
                console.log(`Customer ID ${stripeCustomerId} already set for user ${userId}. Skipping update.`);
                return; // No update needed
           }
      }

     // Perform the update if no existing ID or if overwriting is intended
     const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId); // Find profile by Supabase user ID

      if (updateError) {
        console.error(`DB Update Error (Customer ID Update) for user ${userId}:`, updateError);
        // Consider throwing error
        // throw new Error(`Database customer ID update failed for ${userId}: ${updateError.message}`);
    } else {
         console.log(`DB Update Success (Customer ID) for user ${userId}`);
    }
}