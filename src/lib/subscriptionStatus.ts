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

  const supabase = createClient();

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
  
  // trial = no active subscription, needs to start trial (should NOT show countdown)
  // trialing = has active trial subscription, can upgrade to paid (should show countdown)
  const isTrialing = subscriptionStatus === 'trialing'; // Only 'trialing' status shows countdown
  const isActive = subscriptionStatus === 'active';
  const isTrial = subscriptionStatus === 'trial'; // Users who need to start trial
  const isActiveOrTrialing = isActive || isTrialing; // Only active trials count for access

  let daysRemaining: number | null = null;
  let isExpired = false;

  // Only calculate time remaining for 'trialing' status, NOT for 'trial' status
  if (currentPeriodEnd && isTrialing) {
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
  
  // Handle 'trial' status - users who need to start their trial
  if (subscriptionInfo.subscriptionStatus === 'trial') {
    return "Trial Available";
  }
  
  // Handle 'trialing' status - users with active trial
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
