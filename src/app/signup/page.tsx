// src/app/signup/page.tsx (Polished UI)
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link'; // Import Link

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Add state for confirm password if desired
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    // Add password confirmation check here if input is added
    if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
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
      setEmail('');
      setPassword('');
    }
  };

  return (
    // Consistent main container
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
      {/* Consistent Card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        {/* Consistent Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Create Your Account
        </h1>

        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Consistent Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm text-gray-900"
              placeholder="you@example.com"
            />
          </div>

          {/* Consistent Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password (min. 6 characters)
            </label>
            <input
              id="password" name="password" type="password" autoComplete="new-password" required minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm text-gray-900"
              placeholder="••••••••"
            />
             {/* Optional: Add Confirm Password input here with same styling */}
          </div>

          {/* Consistent Message Areas */}
          {successMsg && (
            <div className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">{successMsg}</div>
          )}
          {errorMsg && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">{errorMsg}</div>
          )}


          {/* Consistent Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>

           {/* Consistent Link */}
           <div className="text-sm text-center text-gray-600 pt-2">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                    Login
                </Link>
            </div>
        </form>
      </div>
    </div>
  );
}