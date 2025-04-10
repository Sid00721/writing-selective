// src/components/LogoutButton.tsx
"use client"; // This needs to be a client component for onClick

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // Use browser client

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient(); // Create browser client

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error logging out:', error.message);
      // Optionally show an error message to the user
    } else {
       // Redirect to homepage or login page after logout
       // Using router.refresh() might also be needed sometimes to clear cached pages
      router.push('/login');
      router.refresh(); // Force refresh to ensure server components re-evaluate auth state
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