// src/app/forgot-password/page.tsx
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // Use browser client
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

    // IMPORTANT: Define the URL where users will be redirected *after* clicking the email link
    // This page (e.g., /reset-password) must be configured in your Supabase project's URL allow list.
    // Use environment variables for the base URL in production.
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
      setEmail(''); // Clear form on success
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Forgot Password</h1>
        <p className="text-center text-sm text-gray-600">
            Enter your email address and we will send you a link to reset your password.
        </p>
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          {message && <div className="text-green-600 text-sm text-center">{message}</div>}
          {errorMsg && <div className="text-red-600 text-sm text-center">{errorMsg}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
          <div className="text-sm text-center">
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Back to Login
                </Link>
            </div>
        </form>
      </div>
    </div>
  );
}