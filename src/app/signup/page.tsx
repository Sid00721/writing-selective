// src/app/signup/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Set redirecting state to prevent form flash
          setRedirecting(true);
          // Use replace instead of push to avoid adding to history
          router.replace('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        // Only set checkingAuth to false if we're not redirecting
        setCheckingAuth(false);
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      console.error('Error signing up:', error.message);
      setErrorMsg(`Signup failed: ${error.message}`);
    } else {
      console.log('Sign up successful:', data);
      setSuccessMsg('Sign up successful! Please check your email for a confirmation link.');
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreedToTerms(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth || redirecting) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border-2 border-gray-800">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="text-lg text-gray-600">
              {redirecting ? 'Redirecting to dashboard...' : 'Checking authentication...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // This outer div centers the card on the page
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
      {/* "Selective Writing" brand text removed from here */}

      <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border-2 border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
          Create Your Account
        </h1>

        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Optional Full Name Input - Uncomment and adapt if needed
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName" name="fullName" type="text" autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm text-gray-900"
              placeholder="Your Full Name"
            />
          </div>
          */}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm text-gray-900"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-xs text-gray-500">(min. 6 characters)</span>
            </label>
            <input
              id="password" name="password" type="password" autoComplete="new-password" required minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="terms" name="terms" type="checkbox" required
              checked={agreedToTerms}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAgreedToTerms(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                Privacy Policy
              </Link>.
            </label>
          </div>

          {successMsg && (
            <div className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">{successMsg}</div>
          )}
          {errorMsg && (
            <div className="text-red-700 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">{errorMsg}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60 transition duration-150 ease-in-out"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600 pt-2 sm:pt-4">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}