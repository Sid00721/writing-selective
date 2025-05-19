"use client"; // If using Next.js App Router

import React, { useState } from 'react';
import Link from 'next/link'; // Assuming Next.js for optimized navigation

interface NavLink {
  text: string;
  href: string;
}

interface HeaderProps {
  brandName?: string;
  navLinks?: NavLink[];
}

const defaultNavLinks: NavLink[] = [
  { text: "Features", href: "#features" },       // Update hrefs as needed
  { text: "How It Works", href: "#how-it-works" },
  { text: "Testimonials", href: "#testimonials" },
  { text: "Pricing", href: "#pricing" },
  { text: "FAQ", href: "#faq" },
];

export function Header({
  brandName = "Selective Writing",
  navLinks = defaultNavLinks,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between">
          {/* Brand Name / Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-800">
            {brandName}
          </Link>

          {/* Desktop Navigation Links */}
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

          {/* Authentication Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login" // Update with your actual login path
              className="bg-gray-800 text-white hover:bg-gray-700 transition-colors px-4 py-2 rounded-md text-sm font-medium"
            >
              Log In
            </Link>
            <Link
              href="/signup" // Update with your actual signup path
              className="bg-gray-800 text-white hover:bg-gray-700 transition-colors px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              ) : (
                // Close Icon (X)
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.text}
                href={link.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
              >
                {link.text}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <Link
                href="/login" // Update with your actual login path
                className="block w-full text-left bg-gray-800 text-white hover:bg-gray-700 transition-colors px-3 py-2 rounded-md text-base font-medium mb-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/signup" // Update with your actual signup path
                className="block w-full text-left bg-gray-800 text-white hover:bg-gray-700 transition-colors px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// To use it in a page:
// import { Header } from './Header'; // Adjust path as needed
//
// export default function LandingPage() {
//   return (
//     <div>
//       <Header />
//       {/* Other page content */}
//     </div>
//   );
// }