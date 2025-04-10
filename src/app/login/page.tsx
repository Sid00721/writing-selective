// src/app/login/page.tsx
"use client"; // Mark as a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Used for redirection
import { createClient } from '@/lib/supabase/client';

import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize the router

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

    // Use Supabase auth signInWithPassword method
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      console.error('Error logging in:', error.message);
      // Provide more user-friendly errors if needed
      if (error.message.includes('Invalid login credentials')) {
           setErrorMsg('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
            setErrorMsg('Please confirm your email address first. Check your inbox for the confirmation link.');
      }
       else {
           setErrorMsg(`Login failed: ${error.message}`);
      }
    } else {
      console.log('Login successful:', data);
      // Redirect the user after successful login
      // For now, redirect to the homepage. Later, redirect to the dashboard.
      router.push('/dashboard'); // Or router.push('/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
             {/* Add link to 'Forgot Password?' page later */}
          </div>
            
          <div className="text-sm text-center mt-4">
            <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
            </Link>
          </div>
          
          {errorMsg && (
            <div className="text-red-600 text-sm text-center">{errorMsg}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </div>

           {/* Add link to Sign Up page later */}
           {/* <div className="text-sm text-center">
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign Up
                    </a>
                </p>
            </div> */}
        </form>
      </div>
    </div>
  );
}