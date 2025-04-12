// src/lib/accessControl.ts
import { createClient } from '@/lib/supabase/server'; // Use server client

export async function checkUserAccessStatus(userId: string | undefined): Promise<boolean> {
  // If no user ID is provided, deny access
  if (!userId) {
    return false;
  }

  const supabase = await createClient();

  // Fetch relevant fields from the user's profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, has_free_access, subscription_status, current_period_end')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
    console.error(`Access Check Error: Failed fetching profile for ${userId}:`, error.message);
    return false; // Fail secure on error
  }

  if (!profile) {
    console.warn(`Access Check Warning: No profile found for user ${userId}. Denying access.`);
    return false; // Deny access if no profile exists
  }

  // 1. Check Admin or Free Access Flags
  if (profile.is_admin || profile.has_free_access) {
    console.log(`Access Check: User ${userId} granted access (Admin or Free Flag).`);
    return true;
  }

  // 2. Check Active Subscription Status
  const isActive = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';

  // 3. Check if within current paid period
  const isWithinPeriod = profile.current_period_end
    ? new Date(profile.current_period_end) > new Date() // Compare end date with now
    : false;

  const hasPaidAccess = isActive && isWithinPeriod;
  console.log(`Access Check: User ${userId} hasPaidAccess: ${hasPaidAccess} (Status: ${profile.subscription_status}, Period End: ${profile.current_period_end})`);

  return hasPaidAccess;
}