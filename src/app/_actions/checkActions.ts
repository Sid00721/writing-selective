// src/app/_actions/checkoutActions.ts
"use server"; // <-- Mark this file as containing Server Actions

import { createClient } from "@/lib/supabase/server"; // Use the modified server client
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers"; // To get current URL origin
import Stripe from 'stripe'; // Import Stripe Node library

// Initialize Stripe (ensure STRIPE_SECRET_KEY is in your .env / Vercel env vars)
// Use the API version string required by your installed Stripe library version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil", // Use the version TS expects, or update library
  typescript: true,
});

// Define return type for better error handling on client
export interface ActionResult {
    error?: string;
    checkoutUrl?: string | null; // URL for Stripe Checkout
}

export async function createCheckoutSession(bypassPayment: boolean = false, trialDays: number = 30): Promise<ActionResult> {
  console.log("[Server Action Runtime] Attempting to create Supabase client...");
  console.log("[Server Action Runtime] bypassPayment:", bypassPayment, "trialDays:", trialDays);
  // Use the standard createClient function
  const supabase = createClient();
  console.log("[Server Action Runtime] Supabase client supposedly created.");

  // 1. Get User
  console.log("[Server Action Runtime] Attempting to get user...");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("Checkout Action Error: No user session found or auth error:", authError);
    return { error: "You must be logged in to subscribe." };
  }
  console.log(`[Server Action Runtime] User found: ${user.id}`);

  // 2. Get or Create Stripe Customer ID
  let customerId: string | undefined;
  let profileError: string | undefined;

  // Check if user profile exists and has a customer ID
  console.log(`[Server Action Runtime] Fetching profile for user ${user.id}`);
  const { data: profileData, error: profileFetchError } = await supabase
    .from('profiles')
    .select('stripe_customer_id, subscription_status, current_period_end')
    .eq('id', user.id)
    .single();

  if (profileFetchError && profileFetchError.code !== 'PGRST116') { // PGRST116 = 'Row not found'
    console.error("Checkout Action Error: Error fetching profile:", profileFetchError);
    return { error: "Could not retrieve user profile." };
  }

  // Check if user had ANY previous subscription status (no free trial for ANY returning users)
  // Only completely new users (null subscription_status) get free trials
  const hadPreviousSubscription = profileData?.subscription_status !== null;
  
  if (hadPreviousSubscription && profileData) {
    console.log(`[Server Action Runtime] User ${user.id} had previous subscription status: ${profileData.subscription_status}. No free trial allowed.`);
  } else {
    console.log(`[Server Action Runtime] User ${user.id} is completely new (no previous subscription). Free trial allowed.`);
  }

  customerId = profileData?.stripe_customer_id ?? undefined;

  // If no customer ID, create one in Stripe and save it to Supabase profile
  if (!customerId) {
    try {
      console.log(`[Server Action Runtime] Creating Stripe customer for user ${user.id}`);
      const customer = await stripe.customers.create({
        email: user.email, // Make sure user email is available
        metadata: {
          user_id: user.id, // Link Stripe customer to Supabase user ID
        },
      });
      customerId = customer.id;
      console.log(`[Server Action Runtime] Stripe customer ${customerId} created.`);

      // Save the new customer ID back to the user's profile
      console.log(`[Server Action Runtime] Saving Stripe customer ID ${customerId} to profile for user ${user.id}`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (updateError) {
        console.error("Checkout Action Error: Failed to save Stripe Customer ID to profile:", updateError);
        // Set profileError, but continue to try creating checkout session if possible
        profileError = "Could not save customer details. Please contact support if payment succeeds.";
      } else {
          console.log(`[Server Action Runtime] Saved Stripe customer ID ${customerId} for user ${user.id}`);
      }
    } catch (e: unknown) {
      console.error("Checkout Action Error: Error creating Stripe customer:", e);
      if (e instanceof Error) {
        return { error: `Could not create customer record: ${e.message}` };
      }
      return { error: "Could not create customer record due to an unexpected error." };
    }
  } else {
      console.log(`[Server Action Runtime] Found existing Stripe customer ID ${customerId} for user ${user.id}`);
  }

  // If we failed fatally earlier, return error now
  if (!customerId) {
      // This case happens if customer creation failed critically above
      return { error: "Could not establish customer record." };
  }
  // If profile save failed, but we have a customerId, maybe proceed but warn?
  // Or decide to return the profileError here. Let's return it for safety.
  if (profileError) {
      return { error: profileError };
  }


  // 3. Determine Success/Cancel URLs
  const origin = headers().get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const successUrl = `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/pricing`; // Send back to pricing page on cancel

  // 4. Create Stripe Checkout Session
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  if (!priceId) {
      console.error("Checkout Action Error: NEXT_PUBLIC_STRIPE_PRICE_ID environment variable is missing!");
      return { error: "Server configuration error regarding pricing." };
  }

  try {
    console.log(`[Server Action Runtime] Creating Checkout session for customer ${customerId} with price ${priceId}`);
    
    // Configure subscription data based on parameters and user history
    let subscriptionData = {};
    let paymentMethodCollection: 'always' | 'if_required' = 'if_required';
    
    if (bypassPayment) {
      // For trialing users who want to continue trial without payment
      subscriptionData = { trial_period_days: trialDays };
      paymentMethodCollection = 'if_required'; // Don't require payment during trial
      console.log(`[Server Action Runtime] Trial configuration: ${trialDays} days, bypassing payment`);
    } else if (hadPreviousSubscription) {
      // No trial for returning users, payment required
      subscriptionData = {};
      paymentMethodCollection = 'always';
      console.log(`[Server Action Runtime] Returning user: No trial, payment required`);
    } else {
      // New users get trial
      subscriptionData = { trial_period_days: trialDays };
      paymentMethodCollection = 'if_required';
      console.log(`[Server Action Runtime] New user: ${trialDays}-day trial`);
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Specify subscription mode
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
          // Include user_id again in session metadata; useful for webhooks
          user_id: user.id,
      },
      allow_promotion_codes: true, // Optional: allow discount codes
      payment_method_collection: paymentMethodCollection,
      subscription_data: subscriptionData,
    });

    console.log(`[Server Action Runtime] Checkout session ${session.id} created.`);

    if (!session.url) {
        console.error("Checkout Action Error: Stripe session created but URL is missing.");
        return { error: "Could not create checkout session URL." };
    }
    // On success, return the URL for redirection by the client
    return { checkoutUrl: session.url };

  } catch (e: unknown) {
    console.error("Checkout Action Error: Error creating Stripe Checkout session:", e);
    if (e instanceof Error) {
      return { error: `Could not create checkout session: ${e.message}` };
    }
    return { error: 'An unexpected error occurred while creating the checkout session.' };
  }
} // End of createCheckoutSession function