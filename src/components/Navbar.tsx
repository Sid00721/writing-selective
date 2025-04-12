// src/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client'; // Browser client
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
// Import icons if desired
import { LayoutDashboard, LogOut, LogIn, UserPlus, Settings, ShieldCheck } from 'lucide-react';

interface Profile {
  is_admin: boolean;
  // Add other profile fields if needed later
}

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            setLoading(true);
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

            if (authUser) {
                // Fetch profile only if user is logged in
                const { data: userProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', authUser.id)
                    .single();

                if (profileError) {
                    console.error("Error fetching user profile:", profileError);
                }
                setProfile(userProfile as Profile | null);
            } else {
                setProfile(null); // No profile if no user
            }
            setLoading(false);
        };

        fetchUserAndProfile();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                 // Re-fetch profile on auth change if user logs in/out
                if (currentUser) {
                     supabase.from('profiles').select('is_admin').eq('id', currentUser.id).single()
                        .then(({ data, error }) => {
                            if (error) console.error("Error fetching profile on auth change:", error);
                            setProfile(data as Profile | null);
                        });
                } else {
                     setProfile(null);
                }
            }
        );

        // Cleanup listener on unmount
        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, [supabase]);


    const handleLogout = async () => {
        await supabase.auth.signOut();
        // No need to manually redirect, onAuthStateChange should handle state update
        // Or use router.push('/login') if needed after signout
    };

    const isAdmin = profile?.is_admin ?? false;

    return (
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
                            Writing Practice {/* Or your App Name/Logo */}
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        {loading ? (
                           <div className="text-sm text-gray-500">Loading...</div>
                        ) : user ? (
                            // Logged In Links
                            <>
                                <Link href="/practice" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                                    Practice
                                </Link>
                                <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                                    Dashboard
                                </Link>
                                {isAdmin && ( // Show Admin link only if admin
                                    <Link href="/admin" className="flex items-center text-purple-600 hover:text-purple-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                                        <ShieldCheck className="mr-1 h-4 w-4" /> Admin
                                    </Link>
                                )}
                                <span className="text-sm text-gray-500 hidden sm:inline">
                                    {user.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            // Logged Out Links
                            <>
                                <Link href="/login" className="flex items-center text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                                   <LogIn className="mr-1 h-4 w-4" /> Login
                                </Link>
                                <Link href="/signup" className="flex items-center bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition duration-150 ease-in-out">
                                    <UserPlus className="mr-1 h-4 w-4" /> Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}