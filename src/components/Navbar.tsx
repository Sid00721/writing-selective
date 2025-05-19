// src/components/Navbar.tsx
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
} from "lucide-react";

// ---- Types ---------------------------------------------------------------
interface Profile {
  is_admin: boolean;
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

  // fetch user + profile once, then listen for auth changes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", authUser.id)
          .single();
        setProfile(error ? { is_admin: false } : (data as Profile));
      }
      setLoading(false);
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsMobileOpen(false);

        if (currentUser) {
          supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", currentUser.id)
            .single()
            .then(({ data, error }) =>
              setProfile(error ? { is_admin: false } : (data as Profile))
            );
        } else setProfile(null);
      }
    );

    return () => listener?.subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    setIsMobileOpen(false);
  };

  // ── Display data --------------------------------------------------------
  const isAdmin = profile?.is_admin ?? false;
  const brand = "Selective Writing";

  const navLinks: NavLink[] = [
    { text: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { text: "Practice", href: "/practice", icon: <PracticeIcon size={18} /> },
  ];

  // ---- Loading skeleton (keeps layout steady) ----------------------------
  if (loading && !user) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 md:px-8 lg:px-16 flex justify-between">
          <span className="text-2xl font-bold text-gray-800">{brand}</span>
          <span className="text-sm text-gray-500">Loading…</span>
        </div>
      </header>
    );
  }

  // If somehow unauthenticated, render nothing (your layout should redirect)
  if (!user) return null;

  // ---- Main header -------------------------------------------------------
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/dashboard" className="text-2xl font-bold text-gray-800">
            {brand}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.text}
                href={link.href}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-md text-sm lg:text-base"
              >
                {link.text}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-2">
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
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 flex items-center gap-x-1.5 disabled:opacity-60"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
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

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="md:hidden" id="mobile-menu">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
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