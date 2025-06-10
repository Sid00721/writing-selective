// src/app/forgot-password/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null); // For success messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handlePasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setErrorMsg(null);
    setLoading(true);

    // Ensure the redirect URL is correctly pointing to where your actual reset password page will be.
    // This page is where the user lands after clicking the link in the email.
    // For example, if it's at /auth/reset-password, the URL should reflect that.
    // Supabase will append tokens to this URL.
    const resetUrl = `${window.location.origin}/reset-password`; // Or your specific reset password page route

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    });

    setLoading(false);

    if (error) {
      console.error('Error sending password reset email:', error.message);
      setErrorMsg(`Error: ${error.message}`);
    } else {
      setMessage('Password reset email sent! Please check your inbox (and spam folder).');
      setEmail(''); // Clear email field on success
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border-2 border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
          Forgot Your Password?
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6 sm:mb-8">
          Enter your email address below and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handlePasswordReset} className="space-y-5">
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

          {message && (
            <div className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">{message}</div>
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600 pt-2 sm:pt-4">
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