// src/lib/accessControl.ts (WITH createClient FIX)
import { createClient } from '@/lib/supabase/server'; // Use the modified server client

export async function checkUserAccessStatus(userId: string | undefined): Promise<boolean> {
  // If no user ID is provided, deny access immediately
  if (!userId) {
    console.warn("Access Check Warning: No userId provided.");
    return false;
  }

  // --- Read Environment Variables ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // --- Check if variables exist ---
  if (!supabaseUrl || !supabaseKey) {
    console.error("Access Check Error: Supabase URL or Anon Key missing in environment!");
    // Cannot determine access if client can't be created
    return false;
  }

  // --- Create Client by PASSING variables (without await) ---
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch relevant fields from the user's profile
  console.log(`Access Check: Fetching profile for user ${userId}...`);
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, has_free_access, subscription_status, current_period_end')
    .eq('id', userId)
    .single();

  // Handle profile fetch errors (excluding 'row not found')
  if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
    console.error(`Access Check Error: Failed fetching profile for ${userId}:`, error.message);
    return false; // Fail secure on unexpected database error
  }

  // Handle case where profile doesn't exist
  if (!profile) {
    console.warn(`Access Check Warning: No profile found for user ${userId}. Denying access.`);
    return false; // Deny access if no profile exists for the logged-in user
  }
  console.log(`Access Check: Profile fetched for ${userId}:`, profile);


  // --- Access Logic ---

  // 1. Check Admin or Free Access Flags (Highest Priority)
  if (profile.is_admin || profile.has_free_access) {
    console.log(`Access Check: User ${userId} granted access (Admin=${profile.is_admin}, Free=${profile.has_free_access}).`);
    return true;
  }

  // 2. Check Active Subscription Status
  // Stripe subscription statuses: active, past_due, unpaid, canceled, incomplete, incomplete_expired, trialing
  // Consider 'active' and 'trialing' as granting access.
  const isActive = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';

  // 3. Check if within current paid/trial period
  // Ensure current_period_end is not null and is a date in the future
  const isWithinPeriod = profile.current_period_end
    ? new Date(profile.current_period_end) >= new Date() // Use >= to include the exact end date/time
    : false;

  // User has paid access if their subscription is active/trialing AND they are within the valid period
  const hasPaidAccess = isActive && isWithinPeriod;
  console.log(`Access Check: User ${userId} hasPaidAccess: ${hasPaidAccess} (Status: ${profile.subscription_status}, Period End: ${profile.current_period_end})`);

  return hasPaidAccess;
}