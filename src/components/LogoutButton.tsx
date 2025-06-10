// src/components/LogoutButton.tsx
"use client"; // This needs to be a client component for onClick

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // Use browser client

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient(); // Create browser client

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error logging out:', error.message);
        // Still redirect even if there's an error to ensure UI state is cleared
      }
      
      // Use window.location.href for immediate redirect and state clearing
      window.location.href = '/login';
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      // Force redirect even on unexpected errors
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="py-2 px-4 rounded-md no-underline bg-red-500 hover:bg-red-600 text-white"
    >
      Logout
    </button>
  );
}