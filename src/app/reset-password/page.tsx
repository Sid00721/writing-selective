// src/app/reset-password/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for potential future use, e.g., back to login on error

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null); // null = checking, true = valid, false = invalid
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // This effect runs when the component mounts after the user clicks the email link.
    // Supabase client automatically handles the session if the URL contains the recovery token.
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // This event confirms the user is in a password recovery flow.
        // The session object might contain the user if Supabase automatically signs them in.
        console.log("Password recovery event detected, session:", session);
        setIsValidSession(true);
      } else if (!session && isValidSession === null) {
        // If there's no session on initial check and we haven't determined validity yet
        // This might indicate the token was invalid or already used.
        // However, PASSWORD_RECOVERY event is more reliable.
        // We will primarily rely on the PASSWORD_RECOVERY event.
        // If it doesn't fire and there's no session, it's likely invalid.
        // A slight delay to see if PASSWORD_RECOVERY fires.
        setTimeout(() => {
            if (isValidSession === null) { // If still null after a short delay
                console.log("No session or PASSWORD_RECOVERY event, likely invalid link.");
                setIsValidSession(false);
                setErrorMsg("Invalid or expired password reset link. Please request a new one.");
            }
        }, 500);
      } else if (session && isValidSession === null) {
        // If a session exists but not specifically PASSWORD_RECOVERY,
        // it could be a normal session, but we need the recovery context.
        // For this page, we are more interested in the recovery flow state.
        // If PASSWORD_RECOVERY doesn't fire, we may assume the link isn't for immediate recovery.
      }
    });

    // Initial check to see if we are in a recovery flow immediately
    // Supabase client handles this automatically by looking at the URL hash.
    // If a user is part of a session from a recovery link, they can update their password.
    // We don't need to manually parse tokens if using updateUser.
    // Just ensure there's *some* authenticated session, ideally initiated by the recovery link.
    supabase.auth.getSession().then(({ data: { session } }) => {
        // The key is that `updateUser` will only work if the user is in a recovery session.
        // If `session` is null here, it's harder to tell if link is bad vs. user needs to trigger flow.
        // The `onAuthStateChange` for 'PASSWORD_RECOVERY' is a more direct signal.
        // For now, let's assume if a session exists, it might be the recovery one.
        // The `updateUser` call will ultimately confirm.
        if (session) {
            console.log("Initial session check found a session.");
            // We don't set isValidSession to true here yet, wait for PASSWORD_RECOVERY or form submission outcome
        }
        if(isValidSession === null && !session) { // if still checking and no session found initially
             // If after initial load, no session and PASSWORD_RECOVERY hasn't fired, assume invalid.
             // This might be too aggressive if PASSWORD_RECOVERY event is delayed.
             // The useEffect above with timeout is a bit safer.
        }
        // If after a few moments, PASSWORD_RECOVERY hasn't set isValidSession, then it's likely not a valid recovery flow.
        // For this example, we'll let the form attempt decide or the useEffect set the error.
        if (isValidSession === null) {
            // Default to allowing form display, Supabase updateUser will error out if session not valid for recovery
            // setIsValidSession(true); // Tentatively allow form display
            // Let the initial useEffect with timeout handle setting to false if no recovery event.
        }
    });


  }, [supabase, router, isValidSession]); // Added isValidSession

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
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

    // The user object is updated with the new password.
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      console.error('Error updating password:', error.message);
      setErrorMsg(`Error updating password: ${error.message}. You might need to request a new reset link if this one has expired.`);
      setIsValidSession(false); // Explicitly set to false on error
    } else {
      console.log('Password updated successfully:', data);
      setMessage('Password updated successfully! Redirecting to login...');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.push('/login');
      }, 2000); // Redirect after 2 seconds
    }
  };

  if (isValidSession === null) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border-2 border-gray-800 text-center">
          <p className="text-gray-600">Verifying password reset link...</p>
          {/* Optional: Add a spinner */}
        </div>
      </div>
    );
  }

  if (isValidSession === false) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border-2 border-gray-800 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Link Invalid</h1>
          <p className="text-gray-700 mb-6">{errorMsg || 'This password reset link is invalid or has expired.'}</p>
          <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border-2 border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
          Set New Password
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6 sm:mb-8">
          Please enter and confirm your new password below.
        </p>

        <form onSubmit={handlePasswordUpdate} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              id="password" name="password" type="password" required minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm text-gray-900"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <div className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">{message}</div>
          )}
          {errorMsg && !message && ( // Only show error if no success message
            <div className="text-red-700 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">{errorMsg}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60 transition duration-150 ease-in-out"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}