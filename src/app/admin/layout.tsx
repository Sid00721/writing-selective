// src/app/admin/layout.tsx (WITH createClient FIX)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';

async function isAdminUser(): Promise<boolean> {
    console.log("isAdminUser: Checking admin status...");

    // --- Read Environment Variables ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // --- Check if variables exist ---
    if (!supabaseUrl || !supabaseKey) {
      console.error("isAdminUser Error: Supabase URL or Anon Key missing!");
      // Cannot determine admin status if client can't be created
      return false;
    }

    // --- Create Client by PASSING variables (without await) ---
    const supabase = createClient(supabaseUrl, supabaseKey);


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
    <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto">
            <div className="mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Admin Area</h1>
                {/* Maybe add Admin specific nav links here? */}
                <Link href="/" className="text-blue-600 hover:underline text-sm">Back to Main Site</Link>
            </div>
            <div className="bg-white p-6 rounded shadow-md">
                {children} {/* The content of the specific admin page goes here */}
            </div>
        </div>
    </div>
  );
}