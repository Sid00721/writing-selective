// src/lib/accessControl.ts
import { createClient } from '@/lib/supabase/server';

export async function checkUserAccessStatus(userId: string | undefined): Promise<boolean> {
    if (!userId) {
        console.warn("Access Check Warning: No userId provided.");
        return false;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Access Check Error: Supabase URL or Anon Key missing in environment!");
        return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Access Check: Fetching profile for user ${userId}...`);
    const { data: profile, error } = await supabase
        .from('profiles')
        //MODIFIED: Added trial_ends_at to the select query
        .select('is_admin, has_free_access, subscription_status, current_period_end, trial_ends_at')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error(`Access Check Error: Failed fetching profile for ${userId}:`, error.message);
        return false;
    }

    if (!profile) {
        console.warn(`Access Check Warning: No profile found for user ${userId}. Denying access.`);
        return false;
    }
    console.log(`Access Check: Profile fetched for ${userId}:`, profile);

    // --- Access Logic ---

    // 1. Check Admin or Free Access Flags (Highest Priority)
    if (profile.is_admin || profile.has_free_access) {
        console.log(`Access Check: User ${userId} granted access (Admin=${profile.is_admin}, Free=${profile.has_free_access}).`);
        return true;
    }

    // 2. Check for our custom 30-day trial
    // This uses the 'trial' status we set with the trigger and the 'trial_ends_at' field.
    if (profile.subscription_status === 'trial' && profile.trial_ends_at) {
        const now = new Date();
        const trialEndDate = new Date(profile.trial_ends_at);
        if (now <= trialEndDate) {
            console.log(`Access Check: User ${userId} granted access (Active custom trial until ${profile.trial_ends_at}).`);
            return true; // User is on an active custom trial
        } else {
            console.log(`Access Check: User ${userId} custom trial expired on ${profile.trial_ends_at}.`);
            // Optionally, here you could trigger an update to set subscription_status to 'trial_expired'
            // but for now, just denying access is sufficient for this check.
        }
    }

    // 3. Check Active Stripe-like Subscription Status (if not on custom trial)
    // Stripe subscription statuses: active, past_due, unpaid, canceled, incomplete, incomplete_expired, trialing
    // Your original logic considered 'active' and Stripe's 'trialing' as granting access.
    const isStripeActiveOrTrialing = profile.subscription_status === 'active' || profile.subscription_status === 'trialing'; // 'trialing' here usually means a Stripe-managed trial

    // 4. Check if within current paid/Stripe-trial period
    const isWithinStripePeriod = profile.current_period_end
        ? new Date(profile.current_period_end) >= new Date()
        : false;

    if (isStripeActiveOrTrialing && isWithinStripePeriod) {
        console.log(`Access Check: User ${userId} granted access (Status: ${profile.subscription_status}, Stripe Period End: ${profile.current_period_end})`);
        return true;
    }
    
    console.log(`Access Check: User ${userId} denied access. No valid access criteria met. Status: ${profile.subscription_status}, Custom Trial End: ${profile.trial_ends_at}, Stripe Period End: ${profile.current_period_end}`);
    return false; // Default to no access if none of the above conditions are met
}