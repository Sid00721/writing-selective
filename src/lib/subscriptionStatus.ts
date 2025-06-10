// src/lib/subscriptionStatus.ts
import { createClient } from '@/lib/supabase/server';

export interface SubscriptionInfo {
  hasAccess: boolean;
  isAdmin: boolean;
  hasFreeAccess: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  daysRemaining: number | null;
  isTrialing: boolean;
  isExpired: boolean;
  isActive: boolean;
}

export async function getSubscriptionInfo(userId: string | undefined): Promise<SubscriptionInfo | null> {
  if (!userId) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Subscription Info Error: Supabase environment variables missing!");
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, has_free_access, subscription_status, current_period_end')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(`Subscription Info Error: Failed fetching profile for ${userId}:`, error.message);
    return null;
  }

  if (!profile) {
    return null;
  }

  const isAdmin = profile.is_admin || false;
  const hasFreeAccess = profile.has_free_access || false;
  const subscriptionStatus = profile.subscription_status;
  const currentPeriodEnd = profile.current_period_end;
  
  const isTrialing = subscriptionStatus === 'trialing';
  const isActive = subscriptionStatus === 'active';
  const isActiveOrTrialing = isActive || isTrialing;

  let daysRemaining: number | null = null;
  let isExpired = false;

  if (currentPeriodEnd) {
    const endDate = new Date(currentPeriodEnd);
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    isExpired = timeDiff < 0;
  }

  const hasAccess = isAdmin || hasFreeAccess || (isActiveOrTrialing && !isExpired);

  return {
    hasAccess,
    isAdmin,
    hasFreeAccess,
    subscriptionStatus,
    currentPeriodEnd,
    daysRemaining,
    isTrialing,
    isExpired,
    isActive,
  };
}

export function getSubscriptionDisplayText(subscriptionInfo: SubscriptionInfo): string {
  if (subscriptionInfo.isAdmin) return "Admin Access";
  if (subscriptionInfo.hasFreeAccess) return "Free Access";
  
  if (subscriptionInfo.isTrialing) {
    if (subscriptionInfo.isExpired) {
      return "Trial Expired";
    } else if (subscriptionInfo.daysRemaining !== null) {
      const days = subscriptionInfo.daysRemaining;
      if (days <= 0) return "Trial Expires Today";
      if (days === 1) return "1 Day Left";
      return `${days} Days Left`;
    }
    return "Trial Active";
  }
  
  if (subscriptionInfo.isActive) {
    if (subscriptionInfo.isExpired) {
      return "Subscription Expired";
    }
    return "Active Subscription";
  }
  
  return "No Active Subscription";
}
