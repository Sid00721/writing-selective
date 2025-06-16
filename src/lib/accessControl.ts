// src/lib/accessControl.ts (WITH createClient FIX)
import { createClient } from '@/lib/supabase/server'; // Use the modified server client

export async function checkUserAccessStatus(userId: string | undefined): Promise<boolean> {
  // If no user ID is provided, deny access immediately
  if (!userId) {
    console.warn("Access Check Warning: No userId provided.");
    return false;
  }

  // --- Create Supabase Client ---
  const supabase = createClient();

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
  // Stripe subscription statuses: active, past_due, unpaid, canceled, incomplete, incomplete_expired, trialing, trial
  // Consider 'active', 'trialing', and 'trial' as granting access.
  const isActive = profile.subscription_status === 'active' || profile.subscription_status === 'trialing' || profile.subscription_status === 'trial';

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

export async function getSubscriptionRedirectUrl(userId: string | undefined): Promise<string> {
  // Default redirect to pricing page
  if (!userId) {
    return '/pricing';
  }

  try {
    const supabase = createClient();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return '/pricing';
    }

    // All users without access go to the unified pricing page
    // The pricing page will handle the different flows based on subscription status
    return '/pricing';
  } catch (error) {
    console.error('Error determining subscription redirect:', error);
    return '/pricing';
  }
}

// Debug function to check user access status and subscription details
export async function debugUserAccess(userId: string | undefined): Promise<void> {
  if (!userId) {
    console.log('DEBUG: No userId provided');
    return;
  }

  const supabase = createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, has_free_access, subscription_status, current_period_end')
    .eq('id', userId)
    .single();

  console.log('DEBUG: User Access Check');
  console.log('- UserId:', userId);
  console.log('- Profile:', profile);
  console.log('- Error:', error);

  if (profile) {
    const isAdmin = profile.is_admin || false;
    const hasFreeAccess = profile.has_free_access || false;
    const isActive = profile.subscription_status === 'active' || profile.subscription_status === 'trialing' || profile.subscription_status === 'trial';
    
    const isWithinPeriod = profile.current_period_end
      ? new Date(profile.current_period_end) >= new Date()
      : false;

    const hasPaidAccess = isActive && isWithinPeriod;
    const hasAccess = isAdmin || hasFreeAccess || hasPaidAccess;

    console.log('- isAdmin:', isAdmin);
    console.log('- hasFreeAccess:', hasFreeAccess);
    console.log('- subscription_status:', profile.subscription_status);
    console.log('- current_period_end:', profile.current_period_end);
    console.log('- isActive (active/trialing):', isActive);
    console.log('- isWithinPeriod:', isWithinPeriod);
    console.log('- hasPaidAccess:', hasPaidAccess);
    console.log('- Final hasAccess:', hasAccess);
  }
}