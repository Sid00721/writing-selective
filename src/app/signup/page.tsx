// src/app/signup/page.tsx
"use client"; // <-- Mark this as a Client Component

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    setErrorMsg(null); // Clear previous errors
    setSuccessMsg(null);
    setLoading(true);

    if (!email || !password) {
        setErrorMsg("Please enter both email and password.");
        setLoading(false);
        return;
    }

    // Use Supabase auth signUp method
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      // You can add options here if needed, like redirect URLs or metadata
      // options: {
      //   emailRedirectTo: `${location.origin}/auth/callback`, // Example redirect
      // }
    });

    setLoading(false);

    if (error) {
      console.error('Error signing up:', error.message);
      setErrorMsg(`Signup failed: ${error.message}`);
    } else {
      // IMPORTANT: By default, Supabase sends a confirmation email.
      // The user object in 'data.user' might be null until confirmation,
      // or it might contain the user details depending on your Supabase settings.
      console.log('Sign up successful, check email for confirmation:', data);
      setSuccessMsg('Sign up successful! Please check your email for a confirmation link.');
      // Clear form or redirect user
      setEmail('');
      setPassword('');
      // Potentially redirect: router.push('/dashboard'); (needs `useRouter` hook)
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Create Account</h1>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
             {/* Add password strength indicator or requirements later */}
          </div>

          {errorMsg && (
            <div className="text-red-600 text-sm text-center">{errorMsg}</div>
          )}
          {successMsg && (
            <div className="text-green-600 text-sm text-center">{successMsg}</div>
          )}


          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}