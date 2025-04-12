// src/app/reset-password/page.tsx (Polished UI)
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
             console.log("Recovery session detected for password reset");
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
     if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
        return;
    }

    setLoading(true);

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
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  // Show loading/invalid state before form
   if (isValidSession === null) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <div className="p-8 text-center">Checking reset link...</div>
        </div>
      );
  }
  if (isValidSession === false) {
       return (
         <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <div className="p-8 text-center text-red-600">{errorMsg || 'Invalid or expired link.'}</div>
        </div>
      );
  }

  // Render form if session is valid
  return (
    // Consistent main container
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
      {/* Consistent Card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        {/* Consistent Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Set New Password
        </h1>
         <p className="text-center text-sm text-gray-600">
             Please enter your new password below.
         </p>
        <form onSubmit={handlePasswordUpdate} className="space-y-5">
          {/* Consistent Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              id="password" name="password" type="password" required minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          {/* Consistent Confirm Password Input */}
           <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
              placeholder="••••••••"
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
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}