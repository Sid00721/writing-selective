// src/app/pricing/page.tsx (Unified Subscription Page)
import SubscribeButton from '@/components/SubscribeButton';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionInfo } from '@/lib/subscriptionStatus';
import { redirect } from 'next/navigation';
import { Clock, Crown, CheckCircle, AlertTriangle } from 'lucide-react';

export default async function PricingPage() {
  let subscriptionInfo = null;
  let userEmail = '';
  
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/login?message=Please log in to access subscription');
    }
    
    userEmail = user.email || '';
    subscriptionInfo = await getSubscriptionInfo(user.id);
    
    // If user has active subscription, redirect to dashboard
    if (subscriptionInfo?.isActive && !subscriptionInfo?.isTrialing) {
      redirect('/dashboard');
    }
    
  } catch (error) {
    console.error('Error checking subscription status:', error);
  }

  // Determine the content based on subscription status
  const getPageContent = () => {
    if (!subscriptionInfo) {
      // Fallback for no subscription info
      return {
        title: 'Get Started',
        heading: 'Start Your Journey',
        description: 'Begin with our premium writing practice platform.',
        buttonText: 'Get Started',
        footerText: 'Choose your plan to continue.',
        showTrialOffer: false,
        bgGradient: 'from-gray-50 to-slate-100',
        badgeColor: 'bg-gray-100 text-gray-800',
        daysRemaining: 0,
        bypassPayment: false,
        trialDays: 30
      };
    }

    const status = subscriptionInfo.subscriptionStatus;
    const isTrialing = subscriptionInfo.isTrialing;
    const daysRemaining = subscriptionInfo.daysRemaining || 0;

    if (status === null) {
      // New user - offer trial
      return {
        title: 'Welcome!',
        heading: 'Start Your Free Trial',
        description: 'Get full access to unlimited writing practice sessions and AI-powered feedback for 30 days.',
        buttonText: 'Start 30-Day Free Trial',
        footerText: 'No payment required. Cancel anytime during trial.',
        showTrialOffer: true,
        bgGradient: 'from-green-50 to-emerald-100',
        badgeColor: 'bg-green-100 text-green-800',
        daysRemaining: 0,
        bypassPayment: false,
        trialDays: 30
      };
    }

    if (status === 'trial') {
      // User has trial status but no active subscription - needs to start trial
      return {
        title: 'Start Your Trial',
        heading: 'Begin Your Free Trial',
        description: 'Start your 30-day free trial to access unlimited writing practice sessions and AI-powered feedback.',
        buttonText: 'Start 30-Day Free Trial',
        footerText: 'No payment required during trial period.',
        showTrialOffer: true,
        bgGradient: 'from-blue-50 to-indigo-100',
        badgeColor: 'bg-blue-100 text-blue-800',
        daysRemaining: 0,
        bypassPayment: true,
        trialDays: 30
      };
    }

    if (isTrialing) {
      // User has active trial subscription - show upgrade option
      return {
        title: 'Your Trial is Active!',
        heading: 'Upgrade to Continue',
        description: 'Continue enjoying unlimited access by upgrading to our full subscription plan.',
        buttonText: 'Upgrade to Full Plan',
        footerText: 'Upgrade now to continue without interruption.',
        showTrialOffer: false,
        bgGradient: 'from-blue-50 to-indigo-100',
        badgeColor: 'bg-blue-100 text-blue-800',
        daysRemaining,
        bypassPayment: false,
        trialDays: 30
      };
    }

    // Other statuses (canceled, expired, past_due, etc.)
    return {
      title: 'Reactivate Your Access',
      heading: 'Resubscribe to Continue',
      description: 'Resubscribe to regain access to unlimited writing practice sessions and all premium features.',
      buttonText: getResubscribeButtonText(status),
      footerText: 'Payment required immediately for returning users.',
      showTrialOffer: false,
      bgGradient: 'from-orange-50 to-red-100',
      badgeColor: 'bg-red-100 text-red-800',
      daysRemaining: 0,
      bypassPayment: false,
      trialDays: 30
    };
  };

  const getResubscribeButtonText = (status: string | null) => {
    switch (status) {
      case 'canceled': return 'Resubscribe Now';
      case 'past_due': return 'Update Payment';
      case 'unpaid': return 'Complete Payment';
      default: return 'Subscribe Now';
    }
  };

  const content = getPageContent();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
      {/* Main Content Card */}
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-200">
        <div className="text-center space-y-6">
          
          {/* Status Badge */}
          {subscriptionInfo && (
            <div className={`inline-flex items-center px-4 py-2 ${content.badgeColor} rounded-full text-sm font-semibold`}>
              {subscriptionInfo.isTrialing ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Free Trial Active
                </>
              ) : content.showTrialOffer ? (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Premium Access
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Subscription Required
                </>
              )}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {content.title}
          </h1>
          
          {/* Days Remaining for Trial Users */}
          {subscriptionInfo?.isTrialing && content.daysRemaining > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                  {content.daysRemaining}
                </div>
                <div className="text-lg text-blue-700 font-medium">
                  {content.daysRemaining === 1 ? 'day remaining' : 'days remaining'}
                </div>
                <div className="text-sm text-blue-600 mt-2">
                  in your free trial
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
              {content.heading}
            </h2>
            <p className="text-md sm:text-lg text-gray-600 mb-6">
              {content.description}
            </p>
          </div>

          {/* Features List */}
          <div className="text-left space-y-3 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 text-center mb-3">
              {content.showTrialOffer ? 'What you get with your trial:' : 'Premium features included:'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                Unlimited writing practice sessions
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                AI-powered feedback and scoring
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                All writing genres and prompts
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                Performance tracking and analytics
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="my-6">
            <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">$15</span>
            <span className="text-lg sm:text-xl font-medium text-gray-500"> AUD / month</span>
          </div>

          {/* Subscribe Button */}
          <div className="mt-2">
            <SubscribeButton 
              buttonText={content.buttonText} 
              bypassPayment={content.bypassPayment || false}
              trialDays={content.trialDays || 30}
            />
          </div>

          <p className="text-xs text-gray-500 mt-3">
            {content.footerText}
          </p>
          
          {/* Navigation Links */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <Link href="/dashboard" className="block text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              {subscriptionInfo?.isTrialing ? 'Continue with trial → Dashboard' : 'Back to Dashboard'}
            </Link>
            {subscriptionInfo?.isTrialing && (
              <Link href="/practice" className="block text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline">
                Continue Practice Session
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Warning for trialing users ending soon */}
      {subscriptionInfo?.isTrialing && content.daysRemaining <= 3 && content.daysRemaining > 0 && (
        <div className="mt-6 w-full max-w-lg bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-amber-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Trial ending soon!
              </p>
              <p className="text-xs text-amber-700">
                Upgrade now to avoid any interruption to your practice sessions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}