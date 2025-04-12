// src/app/login/page.tsx (Fixed Input Text Color)
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
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

    setLoading(false);

    if (error) {
      console.error('Error logging in:', error.message);
      if (error.message.includes('Invalid login credentials')) {
           setErrorMsg('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
           setErrorMsg('Please confirm your email address first. Check your inbox.');
      } else {
           setErrorMsg(`Login failed: ${error.message}`);
      }
    } else {
      console.log('Login successful');
      router.push('/dashboard'); // Redirect to dashboard on success
      router.refresh(); // Optional: Refresh to ensure layout potentially gets fresh user state
    }
  };

  return (
    // Main container
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
      {/* Card holding the form */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Login to Your Account
        </h1>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              // --- Added text-gray-900 ---
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm text-gray-900"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password" name="password" type="password" autoComplete="current-password" required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              // --- Added text-gray-900 ---
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm text-gray-900"
              placeholder="••••••••"
            />
          </div>

          {/* Forgot Password Link */}
           <div className="text-sm text-right">
             <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                 Forgot your password?
             </Link>
           </div>

          {/* Error Message Area */}
          {errorMsg && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">{errorMsg}</div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </div>

           {/* Link to Sign Up page */}
           <div className="text-sm text-center text-gray-600 pt-2">
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