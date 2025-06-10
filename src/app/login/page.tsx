"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setRedirecting(true);
          router.replace('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setLoading(false);
      console.error('Error logging in:', error.message);
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Please confirm your email address first. Check your inbox.');
      } else {
        setErrorMsg(`Login failed: ${error.message}`);
      }
    } else {
      setRedirecting(true);
      router.replace('/dashboard');
    }
  };

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
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border-2 border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
          Login to Your Account
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || checkingAuth || redirecting}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm text-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>
            <input
              id="password" name="password" type="password" autoComplete="current-password" required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || checkingAuth || redirecting}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm text-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <div className="text-red-700 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">{errorMsg}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || checkingAuth || redirecting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600 pt-2 sm:pt-4">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}