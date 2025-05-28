// src/components/Navbar.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Edit3 as PracticeIcon,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  AlertTriangle, // Optional: for trial message icon
} from "lucide-react";

// ---- Types ---------------------------------------------------------------
interface Profile {
  is_admin: boolean;
  subscription_status?: string | null;
  trial_ends_at?: string | null;
}

interface NavLink {
  text: string;
  href: string;
  icon?: React.ReactNode; // mobile icons
}

// ---- Component -----------------------------------------------------------
export default function AuthenticatedHeader() {
  const supabase = createClient();

  // auth & profile state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // mobile menu
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const loadUserProfile = React.useCallback(
    async (userId: string) => {
      console.log("Navbar: loadUserProfile called for userId:", userId);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin, subscription_status, trial_ends_at")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Navbar: Error fetching profile:", error);
          setProfile(null);
        } else {
          setProfile(data as Profile);
        }
      } catch (error) {
        console.error("Navbar: Exception in loadUserProfile:", error);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsMobileOpen(false);
      if (currentUser) {
        await loadUserProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });
  }, [loadUserProfile, supabase.auth]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    setIsMobileOpen(false);
  };

  const isAdmin = profile?.is_admin ?? false;
  const brand = "Selective Writing";

  const navLinks: NavLink[] = [
    {
      text: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { text: "Practice", href: "/practice", icon: <PracticeIcon size={18} /> },
  ];

  // ---- Calculate Trial Message ----
  let trialMessageElement: React.ReactNode = null;
  if (
    profile &&
    profile.subscription_status === "trial" &&
    profile.trial_ends_at
  ) {
    if (typeof window !== "undefined") {
      console.log("Navbar: Attempting to calculate trial message.");
      console.log(
        "Navbar: Profile subscription_status:",
        profile.subscription_status
      );
      console.log("Navbar: Profile trial_ends_at:", profile.trial_ends_at);
    }

    const now = new Date();
    const trialEndDate = new Date(profile.trial_ends_at); // Ensure this parsing is correct
    const timeRemaining = trialEndDate.getTime() - now.getTime();

    if (typeof window !== "undefined") {
      console.log("Navbar: Current Time (now):", now.toISOString());
      console.log(
        "Navbar: Trial End Date (parsed):",
        isNaN(trialEndDate.getTime())
          ? "Invalid Date"
          : trialEndDate.toISOString()
      );
      console.log("Navbar: Time Remaining (ms):", timeRemaining);
    }

    if (timeRemaining > 0) {
      const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
      let messageText = "";
      if (daysRemaining === 1) {
        messageText = "Trial: 1 day left";
      } else {
        messageText = `Trial: ${daysRemaining} days left`;
      }
      if (typeof window !== "undefined") {
        console.log(
          "Navbar: Trial message calculated, should be visible:",
          messageText
        );
      }
      trialMessageElement = (
        <span className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-orange-700 bg-orange-100 border border-orange-300">
          <AlertTriangle size={16} className="mr-1.5 text-orange-500" />
          {messageText}
        </span>
      );
    } else {
      if (typeof window !== "undefined") {
        console.log(
          "Navbar: Trial time remaining is not > 0 (trial might be expired or date parsing issue)."
        );
      }
    }
  } else {
    if (typeof window !== "undefined") {
      if (profile) {
        console.log(
          "Navbar: Not calculating trial message because conditions not met.",
          "Status:",
          profile.subscription_status,
          "Ends At:",
          profile.trial_ends_at
        );
      } else {
        console.log(
          "Navbar: Not calculating trial message because profile is null or not yet loaded."
        );
      }
    }
  }

  // ---- Loading skeleton (keeps layout steady) ----------------------------
  if (loading && !user && !profile) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50 dark:bg-slate-800">
        <div className="container mx-auto px-6 py-4 md:px-8 lg:px-16 flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-800">{brand}</span>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>
    );
  }

  if (!user) return null;

  // ---- Main header -------------------------------------------------------
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 dark:bg-slate-800">
      <div className="container mx-auto px-6 py-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-gray-800 dark:text-white"
          >
            {brand}
          </Link>

          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.text}
                href={link.href}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-md text-sm lg:text-base dark:text-gray-200 dark:hover:text-white"
              >
                {link.text}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            {trialMessageElement}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-x-1.5"
              >
                <ShieldCheck size={16} />
                Admin
              </Link>
            )}
            <span
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 flex items-center gap-x-1.5 cursor-default"
              title={user.email ?? "User"}
            >
              <UserIcon size={16} className="text-gray-500" />
              <span className="truncate max-w-[100px] hidden lg:inline">
                {user.email}
              </span>
            </span>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 flex items-center gap-x-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 p-2 rounded-md"
              aria-controls="mobile-menu"
              aria-expanded={isMobileOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div className="md:hidden" id="mobile-menu">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            {/* MODIFIED: Added trial message for mobile view */}
            {trialMessageElement && (
              <div className="px-1 pt-1 pb-2">
                {" "}
                {/* Wrapper for consistent padding/layout */}
                {trialMessageElement}
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.text}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.text}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-md"
              >
                <ShieldCheck className="mr-2" size={18} /> Admin
              </Link>
            )}
            <div className="pt-3 mt-2 border-t border-gray-100">
              <div className="flex items-center px-3 mb-2 text-gray-500">
                <UserIcon size={18} className="mr-2" />
                <span className="truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md disabled:opacity-60"
              >
                <LogOut className="mr-2" size={18} />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
