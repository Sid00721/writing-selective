// supabase/functions/stripe-webhook/index.ts (WITH checkout.session.completed UPDATE LOGIC)

// @deno-types="npm:@types/node"
import { serve } from "https://deno.land/std/http/server.ts";
// @deno-types="npm:@types/stripe"
import Stripe from "https://esm.sh/stripe@16.2.0?target=denonext";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.44.4";

console.log("Stripe Webhook Edge Function Initializing....");

// --- Get Environment Variables ---
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("CUSTOM_SUPABASE_SERVICE_ROLE_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

let envVarError = false;
if (!stripeSecretKey) {
  console.error("Missing STRIPE_SECRET_KEY secret.");
  envVarError = true;
}
if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL secret.");
  envVarError = true;
}
if (!supabaseServiceRoleKey) {
  console.error("Missing CUSTOM_SUPABASE_SERVICE_ROLE_KEY secret.");
  envVarError = true;
}
if (!webhookSecret) {
  console.error("Missing STRIPE_WEBHOOK_SECRET secret.");
  envVarError = true;
}

// --- Initialize Stripe Client ---
const stripe = new Stripe(stripeSecretKey ?? "dummy", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
  typescript: true,
});

// --- Initialize Supabase Admin Client ---
const supabaseAdmin = createClient(
  supabaseUrl ?? "dummy",
  supabaseServiceRoleKey ?? "dummy",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

console.log(
  "Supabase Admin Client instance configured (will use secrets at runtime if set)."
);

// --- Main Request Handler ---
serve(async (req: Request) => {
  // Added Request type
  if (envVarError) {
    console.error(
      "Function invoked but missing critical environment variables during init."
    );
    return new Response(
      "Server configuration error: Missing environment variables",
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  console.log(`Edge Function: Received ${req.method} request.`);

  let event: Stripe.Event;

  // 1. Verify Signature
  try {
    if (!signature) {
      throw new Error("Missing Stripe-Signature header");
    }
    console.log("Attempting to verify Stripe signature...");
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret!,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
    console.log(
      `Edge Function: Stripe event constructed: ${event.id}, Type: ${event.type}`
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Unknown signature verification error";
    console.error(
      `❌ Edge Function: Error verifying webhook signature: ${errorMessage}`
    );
    return new Response(`Webhook Error: Signature verification failed.`, {
      status: 400,
    });
  }

  // 2. Handle Specific Events
  try {
    switch (event.type) {
      // --- UPDATED CHECKOUT SESSION COMPLETED HANDLER ---
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id ?? null;
        const stripeCustomerId = session.customer as string | null;
        const stripeSubscriptionId = session.subscription as string | null; // Subscription ID from session

        console.log(
          `Edge Function: Handling ${event.type} for session ${session.id}, User: ${userId}, Cust: ${stripeCustomerId}, Sub: ${stripeSubscriptionId}`
        );

        // Update Customer ID first (only if relevant IDs are present)
        if (userId && stripeCustomerId) {
          await updateProfileCustomerId(
            supabaseAdmin,
            userId,
            stripeCustomerId
          ); // Assumes this now works reliably
        } else {
          console.warn(
            `Checkout session ${session.id} completed but missing userId or customerId in metadata/session.`
          );
        }

        // If it was a subscription and we have the necessary IDs, fetch subscription and update status/period end
        if (
          session.mode === "subscription" &&
          stripeCustomerId &&
          stripeSubscriptionId &&
          userId
        ) {
          console.log(
            `Workspaceing details for subscription ${stripeSubscriptionId} to update profile...`
          );
          try {
            const subscription = await stripe.subscriptions.retrieve(
              stripeSubscriptionId
            );
            console.log(
              `Retrieved subscription ${subscription.id}: Status=${subscription.status}, PeriodEnd=${subscription.current_period_end}`
            );

            // Update profile with retrieved subscription details
            await updateProfileSubscriptionStatus(
              supabaseAdmin,
              stripeCustomerId, // Customer ID from session
              subscription.id, // Subscription ID from retrieved object
              subscription.status, // Status from retrieved object
              subscription.current_period_end // Period end from retrieved object
            );
          } catch (retrieveError) {
            console.error(
              `Error retrieving subscription ${stripeSubscriptionId} from Stripe:`,
              retrieveError
            );
            // Decide if you want to return an error here or just log
          }
        } else {
          console.warn(
            `Checkout session ${session.id} was not subscription mode or missing IDs needed for subscription status update.`
          );
        }
        break;
      } // --- END OF UPDATED CHECKOUT SESSION HANDLER ---

      // --- Keep other handlers as they are, they might handle renewals/cancellations ---
      case "customer.subscription.updated":
      case "customer.subscription.deleted": { // Handles cancellations initiated outside immediate checkout
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const status =
          event.type === "customer.subscription.deleted"
            ? "canceled"
            : subscription.status; // Use 'canceled' for deleted event

        console.log(
          `Edge Function: Handling ${event.type} for sub ${subscriptionId}, status ${status}`
        );
        const periodEndUnix = subscription.current_period_end ?? null;
        await updateProfileSubscriptionStatus(
          supabaseAdmin,
          customerId,
          subscriptionId,
          status,
          periodEndUnix
        );
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        // DEBUG LOGGING ADDED HERE:
        console.log(
          `DEBUG invoice.paid: invoice.id=${invoice.id}, invoice.subscription=${invoice.subscription}, invoice.billing_reason=${invoice.billing_reason}, invoice.period_end=${invoice.period_end}`
        );
        // --- END LOGGING ---
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : null;

        // If linked to a subscription (might catch renewals here if checkout handler missed something)
        if (subscriptionId) {
          const customerId = invoice.customer as string;
          console.log(
            `Edge Function: Handling ${event.type} (potentially renewal) for sub ${subscriptionId}, status ${invoice.status}`
          );
          await updateProfileSubscriptionStatus(
            supabaseAdmin,
            customerId,
            subscriptionId,
            "active", // Assume paid invoice means active
            invoice.period_end // Use invoice period end
          );
        } else {
          console.log(
            `Edge Function: Invoice ${invoice.id} paid, but not linked to a subscription ID.`
          );
        }
        break;
      }
      // --- We no longer need customer.subscription.created as checkout.session.completed handles the initial update ---
      // case 'customer.subscription.created':
      //    // This logic is now handled more reliably by checkout.session.completed + fetching
      //    console.log("Ignoring customer.subscription.created event, handled by checkout completion.");
      //    break;

      default:
        console.log(`Edge Function: Unhandled event type ${event.type}`);
    }

    // Acknowledge event
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error in event handling";
    console.error(
      `Edge Function: Webhook handler error processing event ${event.id} (Type: ${event.type}):`,
      error
    );
    return new Response(`Webhook handler error: Internal Server Error`, {
      status: 500,
    });
  }
});

console.log("Stripe Webhook Edge Function handler set up.");

// --- Helper Functions (Keep as they are, but ensure they log errors well) ---

async function updateProfileSubscriptionStatus(
  supabase: SupabaseClient,
  stripeCustomerId: string | null,
  stripeSubscriptionId: string | null,
  newStatus: string,
  periodEndUnix: number | null
) {
  if (!stripeCustomerId || !stripeSubscriptionId) {
    console.error(
      "updateProfileSubscriptionStatus: Missing customer or subscription ID."
    );
    return;
  }

  let periodEndISO: string | null = null;
  if (typeof periodEndUnix === "number") {
    periodEndISO = new Date(periodEndUnix * 1000).toISOString();
  }

  console.log(
    `Edge Function DB Update: Profile for Stripe Cust ${stripeCustomerId}: SubID=${stripeSubscriptionId}, Status=${newStatus}, PeriodEnd=${periodEndISO}`
  );
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        stripe_subscription_id: stripeSubscriptionId,
        subscription_status: newStatus,
        current_period_end: periodEndISO,
      })
      .eq("stripe_customer_id", stripeCustomerId); // Match profile using customer ID

    if (error) {
      console.error(
        `Edge Function DB Update Error (Status) for customer ${stripeCustomerId}:`,
        JSON.stringify(error, null, 2)
      );
    } else {
      console.log(
        `Edge Function DB Update Success (Status) for customer ${stripeCustomerId}`
      );
    }
  } catch (e) {
    console.error(
      `CAUGHT UNEXPECTED ERROR during status update for customer ${stripeCustomerId}:`,
      e
    );
  }
}

async function updateProfileCustomerId(
  supabase: SupabaseClient,
  userId: string | null,
  stripeCustomerId: string | null
) {
  if (!userId || !stripeCustomerId) {
    console.error(
      "updateProfileCustomerId: Missing userId or stripeCustomerId."
    );
    return;
  }

  console.log(
    `Attempting to SELECT profile for User ${userId} before updating Customer ID ${stripeCustomerId}`
  );
  try {
    const { data: existingData, error: selectError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 = row not found
      console.error(
        `Edge Function DB SELECT Error for user ${userId}:`,
        JSON.stringify(selectError, null, 2)
      );
      return;
    }

    if (!existingData) {
      console.log(
        `No existing profile found via SELECT for user ${userId}. Proceeding to update.`
      );
    } else {
      console.log(
        `Existing profile data found via SELECT for user ${userId}:`,
        JSON.stringify(existingData)
      );
      if (existingData.stripe_customer_id === stripeCustomerId) {
        console.log(
          `Customer ID ${stripeCustomerId} already set correctly for user ${userId}. Skipping update.`
        );
        return;
      } else if (existingData.stripe_customer_id) {
        console.warn(
          `User ${userId} already has Stripe Customer ID ${existingData.stripe_customer_id}, received update for ${stripeCustomerId}. Overwriting.`
        );
      }
    }

    console.log(
      `Attempting to UPDATE profile for User ${userId} with Stripe Cust ID ${stripeCustomerId}`
    );
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", userId);

    if (updateError) {
      console.error(
        `Edge Function DB UPDATE Error (Customer ID) for user ${userId}:`,
        JSON.stringify(updateError, null, 2)
      );
    } else {
      console.log(
        `Edge Function DB Update Success (Customer ID) for user ${userId}`
      );
    }
  } catch (e) {
    console.error(
      `CAUGHT UNEXPECTED ERROR in updateProfileCustomerId for user ${userId}:`,
      e
    );
  }
}
