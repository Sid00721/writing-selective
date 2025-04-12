// src/app/_actions/checkoutActions.ts
"use server"; // <-- Mark this file as containing Server Actions

import { createClient } from "@/lib/supabase/server"; // Use server client
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

export async function createCheckoutSession(): Promise<ActionResult> {
  const supabase = await createClient();

  // 1. Get User
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("Checkout Action Error: No user session found.");
    return { error: "You must be logged in to subscribe." };
  }

  // 2. Get or Create Stripe Customer ID
  let customerId: string | undefined;
  let profileError: string | undefined;

  // Check if user profile exists and has a customer ID
  const { data: profileData, error: profileFetchError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (profileFetchError && profileFetchError.code !== 'PGRST116') { // PGRST116 = 'Row not found'
    console.error("Checkout Action Error: Error fetching profile:", profileFetchError);
    return { error: "Could not retrieve user profile." };
  }

  customerId = profileData?.stripe_customer_id ?? undefined;

  // If no customer ID, create one in Stripe and save it to Supabase profile
  if (!customerId) {
    try {
      console.log(`Creating Stripe customer for user ${user.id}`);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id, // Link Stripe customer to Supabase user ID
        },
      });
      customerId = customer.id;

      // Save the new customer ID back to the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (updateError) {
        console.error("Checkout Action Error: Failed to save Stripe Customer ID to profile:", updateError);
        profileError = "Could not save customer details.";
      } else {
         console.log(`Saved Stripe customer ID ${customerId} for user ${user.id}`);
      }
    // --- Updated Catch Block 1 ---
    } catch (e: unknown) { // Type as unknown
      console.error("Checkout Action Error: Error creating Stripe customer:", e);
      // Check if it's an Error instance before accessing message
      if (e instanceof Error) {
        return { error: `Could not create customer record: ${e.message}` };
      }
      return { error: "Could not create customer record due to an unexpected error." };
    }
    // --- End Catch Block 1 ---
  } else {
     console.log(`Found existing Stripe customer ID ${customerId} for user ${user.id}`);
  }

  // If we failed to save the profile earlier, return that error now
  if (profileError) {
       return { error: profileError };
  }
  if (!customerId) {
       return { error: "Could not determine customer ID." };
  }

  // 3. Determine Success/Cancel URLs
  const origin = headers().get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const successUrl = `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/`; // Send back to landing page on cancel

  // 4. Create Stripe Checkout Session
  try {
    console.log(`Creating Checkout session for customer ${customerId} with price ${process.env.NEXT_PUBLIC_STRIPE_PRICE_ID}`);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!, // Use env var for price ID
          quantity: 1,
        },
      ],
      mode: 'subscription', // Specify subscription mode
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
          user_id: user.id,
      },
      allow_promotion_codes: true,
    });

    console.log(`Checkout session ${session.id} created.`);

    if (!session.url) {
        return { error: "Could not create checkout session URL." };
    }
    // On success, return the URL for redirection
    return { checkoutUrl: session.url };

  // --- Updated Catch Block 2 ---
  } catch (e: unknown) { // Type as unknown
    console.error("Checkout Action Error: Error creating Stripe Checkout session:", e);
    // Check if it's an Error instance before accessing message
    if (e instanceof Error) {
      return { error: `Could not create checkout session: ${e.message}` };
    }
    // Handle cases where the caught value isn't a standard Error object
    return { error: 'An unexpected error occurred while creating the checkout session.' };
  }
  // --- End Catch Block 2 ---
}

// Note: We are not explicitly returning from the final successful path here
// because the redirect('/dashboard') call inside the Webhook handler (which you'll build next)
// or a client-side redirect using the checkoutUrl is expected to handle the navigation.
// If you were *not* redirecting, you would need a success return path here too.
// UPDATE: Actually, the Server Action *should* handle the redirect IF it's called directly
// via a form action. If called from a client-side handler, returning the URL is correct.
// Let's stick to returning the URL for now, as the client needs to handle the redirect.