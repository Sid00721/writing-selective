// supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std/http/server.ts"; // <-- Use current path
import Stripe from 'https://esm.sh/stripe@16.2.0?target=denonext' // Use esm.sh for Deno compatibility
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4' // Use esm.sh

console.log('Stripe Webhook Edge Function Initializing...')

// --- Get Environment Variables ---
// These MUST be set using 'supabase secrets set'
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL'); // Use non-public URL if needed, or NEXT_PUBLIC_ version
const supabaseServiceRoleKey = Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey || !webhookSecret) {
  console.error('Missing one or more required environment variables (Stripe/Supabase keys/secrets).');
  // Function might still deploy but will fail on invocation
}

// --- Initialize Stripe Client for Deno ---
// Note: Provide the Fetch API explicitly for Deno environment
const stripe = new Stripe(stripeSecretKey || "dummy", { // Provide dummy if missing to allow init
  apiVersion: '2024-06-20', // Use a stable, known good version
  httpClient: Stripe.createFetchHttpClient(), // Use Fetch API based client
  typescript: true,
});

// --- Initialize Supabase Admin Client ---
// Ensure this client uses the Service Role Key
const supabaseAdmin = createClient(
  supabaseUrl || "dummy",
  supabaseServiceRoleKey || "dummy", // Provide dummy if missing to allow init
  { auth: { autoRefreshToken: false, persistSession: false } }
);
console.log('Supabase Admin Client instance configured (will use secrets at runtime).');


// --- Request Handler ---
serve(async (req: Request) => {
  if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey || !webhookSecret) {
       console.error('Function invoked but missing critical environment variables.');
       return new Response("Server configuration error", { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  const rawBody = await req.text(); // Read body as text in Deno

  console.log(`Edge Function: Received ${req.method} request.`);

  let event: Stripe.Event;

  // 1. Verify Signature
  try {
    if (!signature) {
      throw new Error('Missing Stripe-Signature header');
    }
    event = await stripe.webhooks.constructEventAsync( // Use async version with SubtleCrypto
        rawBody,
        signature,
        webhookSecret,
        undefined, // Optional tolerance
        Stripe.createSubtleCryptoProvider() // Needed for Deno environment
    );
     console.log(`Edge Function: Stripe event constructed: ${event.id}, Type: ${event.type}`);
  } catch (err: unknown) {
    const errorMessage = (err instanceof Error) ? err.message : 'Unknown signature verification error';
    console.error(`❌ Edge Function: Error verifying webhook signature: ${errorMessage}`);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // 2. Handle Events (keep relevant variables scoped if needed)
  let relevantCustomerId: string | null = null;
  let relevantSubscriptionId: string | null = null;

  try {
    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          relevantCustomerId = subscription.customer as string;
          relevantSubscriptionId = subscription.id;
          console.log(`Edge Function: Handling ${event.type} for sub ${subscription.id}, status ${subscription.status}`);
          // Use type assertion for current_period_end if needed, checking if property exists first
          // --- ADD ESLint Disable Comment ---
        // Use type assertion for current_period_end if needed, checking if property exists first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const periodEnd = (subscription as any)?.current_period_end ?? null;
        // --- END CHANGE --
          await updateProfileSubscriptionStatus(supabaseAdmin, relevantCustomerId, relevantSubscriptionId, subscription.status, periodEnd);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          relevantCustomerId = subscription.customer as string;
          relevantSubscriptionId = subscription.id;
          console.log(`Edge Function: Handling ${event.type} for sub ${subscription.id}, setting status 'canceled'`);
          await updateProfileSubscriptionStatus(supabaseAdmin, relevantCustomerId, relevantSubscriptionId, 'canceled', null);
          break;
        }

        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          // Use type assertion for invoice.subscription if needed
           // --- ADD ESLint Disable Comment ---
        // Use type assertion for invoice.subscription if needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscriptionId = (invoice as any)?.subscription as string | null;
        // --- END CHANGE ---
          if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
            relevantCustomerId = invoice.customer as string;
            relevantSubscriptionId = subscriptionId;
            console.log(`Edge Function: Handling ${event.type} for sub ${relevantSubscriptionId}, status ${invoice.status}`);
            await updateProfileSubscriptionStatus(supabaseAdmin, relevantCustomerId, relevantSubscriptionId, 'active', invoice.period_end);
          } else {
            console.log(`Edge Function: Invoice ${invoice.id} paid, but not linked to a subscription cycle.`);
          }
          break;
        }

         case 'checkout.session.completed': {
             const session = event.data.object as Stripe.Checkout.Session;
             relevantCustomerId = session.customer as string;
             // Use type assertion if needed
             // --- ADD ESLint Disable Comment ---
           // Use type assertion if needed for session.subscription
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           relevantSubscriptionId = (session as any)?.subscription as string | null;
           // --- END CHANGE ---

             const relevantUserId = session.metadata?.user_id ?? null; // Get user ID from metadata

             console.log(`Edge Function: Handling ${event.type} for session ${session.id}, User: ${relevantUserId}, Cust: ${relevantCustomerId}, Sub: ${relevantSubscriptionId}`);

             if (session.mode === 'subscription' && relevantCustomerId && relevantUserId) {
                 await updateProfileCustomerId(supabaseAdmin, relevantUserId, relevantCustomerId);
                 // Optionally fetch subscription here to update status immediately,
                 // but relying on subscription events is usually sufficient.
             } else {
                 console.warn(`Edge Function: Checkout session ${session.id} completed but missing relevant IDs needed for DB update.`);
             }
             break;
         }

      default:
        console.log(`Edge Function: Unhandled event type ${event.type}`);
    }

    // Acknowledge event successfully processed
    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error in event handling';
      console.error(`Edge Function: Webhook handler error processing event ${event.id}:`, error);
      return new Response(`Webhook handler error: ${errorMessage}`, { status: 500 });
  }
})

console.log('Stripe Webhook Edge Function handler set up.');


// --- Helper Functions (Adapted slightly if needed, mostly the same) ---

async function updateProfileSubscriptionStatus(
    supabase: SupabaseClient, // Pass client instance
    stripeCustomerId: string,
    stripeSubscriptionId: string | null, // Allow null sub ID just in case
    newStatus: string,
    periodEndUnix: unknown
) {
    let periodEndISO: string | null = null;
    if (typeof periodEndUnix === 'number') {
        periodEndISO = new Date(periodEndUnix * 1000).toISOString();
    } // else remains null

    console.log(`Edge Function DB Update: Profile for Stripe Cust ${stripeCustomerId}: SubID=${stripeSubscriptionId}, Status=${newStatus}, PeriodEnd=${periodEndISO}`);
    const { error } = await supabase
        .from('profiles')
        .update({
            stripe_subscription_id: stripeSubscriptionId,
            subscription_status: newStatus,
            current_period_end: periodEndISO,
         })
        .eq('stripe_customer_id', stripeCustomerId);

    if (error) console.error(`Edge Function DB Update Error (Status) for customer ${stripeCustomerId}:`, error);
    else console.log(`Edge Function DB Update Success (Status) for customer ${stripeCustomerId}`);
}

async function updateProfileCustomerId(
    supabase: SupabaseClient, // Pass client instance
    userId: string,
    stripeCustomerId: string
) {
     console.log(`Edge Function DB Update: Profile for User ${userId} with Stripe Cust ID ${stripeCustomerId}`);
     const { data: existingData, error: selectError } = await supabase
          .from('profiles').select('stripe_customer_id').eq('id', userId).single();

      if (selectError && selectError.code !== 'PGRST116') {
          console.error(`Edge Function DB Update Error (Customer ID Select) for user ${userId}:`, selectError); return;
      }
      if (existingData?.stripe_customer_id) {
           if (existingData.stripe_customer_id !== stripeCustomerId) console.warn(`Edge Function: User ${userId} already has Stripe Customer ID ${existingData.stripe_customer_id}, received update for ${stripeCustomerId}. Overwriting.`);
           else { console.log(`Edge Function: Customer ID ${stripeCustomerId} already set for user ${userId}. Skipping update.`); return; }
      }
     const { error: updateError } = await supabase.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', userId);
      if (updateError) console.error(`Edge Function DB Update Error (Customer ID Update) for user ${userId}:`, updateError);
      else console.log(`Edge Function DB Update Success (Customer ID) for user ${userId}`);
}