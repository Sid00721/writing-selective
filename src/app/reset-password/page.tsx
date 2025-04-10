// src/app/reset-password/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; // Use browser client
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null); // null = checking, false = invalid, true = valid
  const supabase = createClient();
  const router = useRouter();

  // Check if we have a valid recovery session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        // The middleware should have handled the hash fragment and created a session
        // if the recovery link was valid. Check if session exists and possibly type.
        // Supabase might add specific markers for recovery sessions, check their docs if needed.
        // For now, just check if a session exists after landing here.
        if (session) {
             console.log("Recovery session detected");
             setIsValidSession(true);
        } else {
             console.log("No recovery session detected");
             setIsValidSession(false);
             setErrorMsg("Invalid or expired password reset link. Please request a new one.");
        }
    });
  }, [supabase]);

  const handlePasswordUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) { // Enforce minimum length (Supabase default is 6)
        setErrorMsg("Password must be at least 6 characters long.");
        return;
    }

    setLoading(true);

    // updateUser works when authenticated via recovery link
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      console.error('Error updating password:', error.message);
      setErrorMsg(`Error updating password: ${error.message}`);
    } else {
      console.log('Password updated successfully:', data);
      setMessage('Password updated successfully! Redirecting to login...');
      setPassword('');
      setConfirmPassword('');
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  // Show loading/invalid state before form
  if (isValidSession === null) {
      return <div className="p-6 text-center">Checking reset link...</div>;
  }
  if (isValidSession === false) {
      return <div className="p-6 text-center text-red-500">{errorMsg || 'Invalid Link.'}</div>;
  }


  // Only show form if session is valid
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Set New Password</h1>
         <p className="text-center text-sm text-gray-600">
             Enter your new password below.
         </p>
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="password" name="password" type="password" required minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
           <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
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
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}