"use client";

import React from 'react';
import Link from 'next/link';

interface FooterNavLink {
  text: string;
  href: string;
}

interface FooterProps {
  brandName?: string;
  footerNavLinks?: FooterNavLink[];
  startYear?: number; // For copyright, e.g., 2023
}

const defaultFooterNavLinks: FooterNavLink[] = [
  { text: "Terms", href: "/terms" },
  { text: "Privacy", href: "/privacy" },
  { text: "Help", href: "/help" }, // Or "/faq"
  { text: "Contact", href: "/contact" },
];

export function Footer({
  brandName = "Selective Writing", // Display name
  footerNavLinks = defaultFooterNavLinks,
  startYear,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  let copyrightYears = `${currentYear}`;
  if (startYear && startYear < currentYear) {
    copyrightYears = `${startYear} - ${currentYear}`;
  }

  return (
    <footer className="bg-gray-800 text-gray-400">
      <div className="container mx-auto px-6 py-10 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand and Copyright */}
          <div className="text-center md:text-left">
            <Link href="/" className="text-xl font-bold text-white hover:text-gray-200 transition-colors">
              {brandName}
            </Link>
            <p className="mt-2 text-sm">
              &copy; {copyrightYears} SelectiveWritingTest.com.au. All rights reserved.
            </p>
          </div>

          {/* Navigation Links */}
          {footerNavLinks && footerNavLinks.length > 0 && (
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
              {footerNavLinks.map((link) => (
                <Link
                  key={link.text}
                  href={link.href}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.text}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}