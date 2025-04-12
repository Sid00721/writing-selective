// src/app/forgot-password/page.tsx (Polished UI)
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setErrorMsg(null);
    setLoading(true);

    const resetUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    });

    setLoading(false);

    if (error) {
      console.error('Error sending password reset email:', error.message);
      setErrorMsg(`Error: ${error.message}`);
    } else {
      setMessage('Password reset email sent! Please check your inbox (and spam folder).');
      setEmail('');
    }
  };

  return (
    // Consistent main container
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
      {/* Consistent Card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        {/* Consistent Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Forgot Your Password?
        </h1>
        <p className="text-center text-sm text-gray-600">
            Enter your email address below and we&apos;ll send you a link to reset your password.
        </p>
        <form onSubmit={handlePasswordReset} className="space-y-5">
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
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          {/* Consistent Message Areas */}
          {message && <div className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">{message}</div>}
          {errorMsg && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">{errorMsg}</div>}

          {/* Consistent Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>

          {/* Consistent Link */}
          <div className="text-sm text-center text-gray-600 pt-2">
                Remembered your password?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                    Back to Login
                </Link>
            </div>
        </form>
      </div>
    </div>
  );
}