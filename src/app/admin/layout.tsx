// src/app/admin/layout.tsx (WITH createClient FIX)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import type { SupabaseClient } from '@supabase/supabase-js';

async function isAdminUser(): Promise<boolean> {
    console.log("isAdminUser: Checking admin status...");

    // --- Create Client ---
    const supabase = createClient();


    // --- Check user session ---
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr){
        console.error("isAdminUser: Error getting user:", authErr.message);
        return false; // Cannot be admin if error getting user
    }
    if (!user) {
        console.log("isAdminUser: No user found."); // Not logged in, so not admin
        return false;
    }
    console.log("isAdminUser: User found:", user.id);

    // --- Check the profiles table for the is_admin flag ---
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin') // Select only the needed column
        .eq('id', user.id)
        .single(); // Expect only one row

    if (profileError) {
        // Log specific profile fetch errors (e.g., RLS issues, row not found)
        console.error("isAdminUser: Error fetching profile:", profileError.message);
        return false; // Cannot determine admin status if profile fetch fails
    }

    // Log the fetched profile data for debugging
    console.log("isAdminUser: Profile data fetched:", profile);

    // Check the is_admin flag from the profile
    // Use nullish coalescing (??) to default to false if profile or is_admin is null/undefined
    const isAdmin = profile?.is_admin ?? false;
    console.log("isAdminUser: is_admin flag from profile =", isAdmin);
    return isAdmin; // Return the boolean value
}


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("AdminLayout: Checking admin permissions...");
  const isAdmin = await isAdminUser(); // Call the updated helper function
  console.log("AdminLayout: isAdmin =", isAdmin);

  if (!isAdmin) {
    console.log("AdminLayout: Redirecting non-admin user to dashboard...");
    // Redirect non-admins away from the admin section
    redirect('/dashboard'); // Or redirect to '/' or '/login' depending on desired behavior
  }

  console.log("AdminLayout: User is admin, rendering admin layout...");
  // If user IS an admin, render the layout with admin navigation/structure
  return (
    <div className="min-h-screen bg-white">
      {/* Include main navbar with trial countdown and subscription buttons */}
      <Navbar />
      
      {/* Admin-specific content area */}
      <div className="bg-gray-50 min-h-screen pt-6">
        <div className="container mx-auto px-6 md:px-8 lg:px-16">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Area</h1>
              <p className="text-gray-600 mt-1">Manage submissions, prompts, and user data</p>
            </div>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {children} {/* The content of the specific admin page goes here */}
          </div>
        </div>
      </div>
    </div>
  );
}