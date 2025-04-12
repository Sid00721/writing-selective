// src/app/api/webhooks/stripe/route.ts (With 'as any' assertion for current_period_end)
import { headers } from 'next/headers';
import { buffer } from 'node:stream/consumers';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin'; // Import Admin Client
import { NextResponse } from 'next/server'; // Use NextResponse for responses

// Initialize Stripe Client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', // Use the version TS expects
  typescript: true,
});

// Get webhook secret (ensure this is set in Vercel Production Env Vars)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET environment variable is not set');
}
if (!process.env.STRIPE_SECRET_KEY) {
   console.error('STRIPE_SECRET_KEY environment variable is not set');
}
 if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Webhook may fail to update DB.');
}

// --- Main POST Handler ---
export async function POST(req: Request) {
  console.log('Stripe webhook POST request received.');
  let event: Stripe.Event;
  const signature = headers().get('stripe-signature');

  // 1. Read raw body and verify webhook signature
  try {
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }
    if (!req.body) { // Keep the null check
        throw new Error('Request body is missing');
    }
  
    // --- REVERT TO 'as any' WITH ESLint DISABLE ---
    // Disable the ESLint rule specifically for this line
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqBuffer = await buffer(req.body as any); // Cast to any to bypass TS check
    // --- END REVERT ---
    event = stripe.webhooks.constructEvent(reqBuffer, signature, webhookSecret);
    console.log(`Stripe event constructed: ${event.id}, Type: ${event.type}`);
  } catch (err: unknown) {
      const errorMessage = (err instanceof Error) ? err.message : 'Unknown error';
      console.error(`❌ Error verifying webhook signature: ${errorMessage}`);
      return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Initialize Supabase Admin Client
  const supabaseAdmin = createAdminClient();
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
        
        // --- ADD ESLint Disable and Extract Variable ---
        // Tell ESLint to ignore the 'no-explicit-any' rule for the next line only
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const periodEnd = (subscription as any).current_period_end;
        // --- END CHANGES ---
        
        await updateProfileSubscriptionStatus(
          supabaseAdmin,
          relevantCustomerId,
          relevantSubscriptionId,
          subscription.status,
          // Use type assertion to bypass TS error for this specific property
          periodEnd
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
           'canceled', // Set status explicitly
           null // Clear period end
         );
         break;
       }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;

        // --- Use type assertion and disable ESLint for 'subscription' property ---
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscriptionId = (invoice as any).subscription as string | null;
        // --- End modification ---

        // Check if it's for a subscription payment and we got the ID
        if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
          relevantCustomerId = invoice.customer as string;
          relevantSubscriptionId = subscriptionId; // Use the ID we extracted safely
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
           relevantSubscriptionId = session.subscription as string; // Available if mode=subscription

           relevantUserId = session.metadata?.user_id ?? null;

           if (session.mode === 'subscription' && relevantSubscriptionId && relevantCustomerId && relevantUserId) {
               await updateProfileCustomerId(supabaseAdmin, relevantUserId, relevantCustomerId);
               console.log(`Checkout complete for user ${relevantUserId}. Status will be updated by subscription events.`);
           } else {
                console.warn(`Checkout session ${session.id} completed but missing relevant IDs (sub=${relevantSubscriptionId}, cust=${relevantCustomerId}, user=${relevantUserId})`);
           }
           break;
       }

      default:
        console.log(`- Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });

  } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      console.error(`Webhook handler error for event ${event.id} (Customer: ${relevantCustomerId}, Sub: ${relevantSubscriptionId}):`, error);
      return new NextResponse(`Webhook handler error: ${errorMessage}`, { status: 500 });
  }
}


// --- Helper Functions to Update Database ---

async function updateProfileSubscriptionStatus(
    supabase: ReturnType<typeof createAdminClient>,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    newStatus: string,
    // --- CHANGE PARAMETER TYPE ---
    periodEndUnix: unknown // Change type from '... | any' to 'unknown'
    // --- END CHANGE ---
) {
    // --- ADD TYPE CHECKING/CONVERSION ---
    let periodEndISO: string | null = null;
    // Check if the received value is actually a number
    if (typeof periodEndUnix === 'number') {
        // If yes, convert Unix timestamp (seconds) to ISO string
        periodEndISO = new Date(periodEndUnix * 1000).toISOString();
    } else if (periodEndUnix !== null && periodEndUnix !== undefined) {
        // Log if we get something weird that isn't null/undefined or a number
        console.warn(`Webhook received unexpected non-numeric type for periodEndUnix: ${typeof periodEndUnix}`);
    }
    // If it wasn't a number, periodEndISO remains null
    // --- END TYPE CHECKING ---

    console.log(`DB Update: Profile for Stripe Customer ${stripeCustomerId}: SubID=${stripeSubscriptionId}, Status=${newStatus}, PeriodEnd=${periodEndISO}`);

    const { error } = await supabase
        .from('profiles')
        .update({
            stripe_subscription_id: stripeSubscriptionId,
            subscription_status: newStatus,
            current_period_end: periodEndISO, // Use the safely determined value
         })
        .eq('stripe_customer_id', stripeCustomerId);

    if (error) {
        console.error(`DB Update Error (Status) for customer ${stripeCustomerId}:`, error);
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
     const { data: existingData, error: selectError } = await supabase
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

      if (selectError && selectError.code !== 'PGRST116') {
          console.error(`DB Update Error (Customer ID Select) for user ${userId}:`, selectError);
          return;
      }

      if (existingData?.stripe_customer_id === stripeCustomerId) {
           console.log(`Customer ID ${stripeCustomerId} already set for user ${userId}. Skipping update.`);
           return;
      }

     const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);

      if (updateError) {
        console.error(`DB Update Error (Customer ID Update) for user ${userId}:`, updateError);
    } else {
         console.log(`DB Update Success (Customer ID) for user ${userId}`);
    }
}