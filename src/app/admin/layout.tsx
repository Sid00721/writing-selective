// src/app/admin/layout.tsx (WITH CONSOLE LOGS FOR DEBUGGING)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';

async function isAdminUser(): Promise<boolean> {
    console.log("isAdminUser: Checking admin status..."); // <-- Log 1
    const supabase = await createClient();

    // Add check after getting user
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr){
        console.error("isAdminUser: Error getting user:", authErr.message); // <-- Log ERROR A
        return false;
    }
    if (!user) {
        console.log("isAdminUser: No user found."); // <-- Log 2
        return false;
    }
    console.log("isAdminUser: User found:", user.id); // <-- Log 3

    // Check the profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (profileError) {
        // Log specific profile fetch errors (e.g., RLS issues)
        console.error("isAdminUser: Error fetching profile:", profileError.message); // <-- Log 4
        return false;
    }

    // Log the fetched profile data before checking is_admin
    console.log("isAdminUser: Profile data fetched:", profile); // <-- Log PROFILE DATA

    const isAdmin = profile?.is_admin ?? false;
    console.log("isAdminUser: is_admin flag from profile =", isAdmin); // <-- Log 5 (Corrected variable name)
    return isAdmin;
}


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("AdminLayout: Checking admin..."); // <-- Log 6
  const isAdmin = await isAdminUser();
  console.log("AdminLayout: isAdmin =", isAdmin); // <-- Log 7

  if (!isAdmin) {
    console.log("AdminLayout: Redirecting non-admin..."); // <-- Log 8
    redirect('/dashboard');
  }

  console.log("AdminLayout: Rendering admin content..."); // <-- Log 9
  // If user IS an admin, render the layout
  return (
    <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto">
            <div className="mb-4 flex justify-between items-center">
                 <h1 className="text-2xl font-bold">Admin Area</h1>
                 <Link href="/" className="text-blue-600 hover:underline text-sm">Back to Main Site</Link>
            </div>
            <div className="bg-white p-6 rounded shadow-md">
                {children} {/* The content of the specific admin page goes here */}
            </div>
        </div>
    </div>
  );
}