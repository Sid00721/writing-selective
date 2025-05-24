// src/app/layout.tsx
"use client"; // <-- Add this line to enable client-side hooks like usePathname

import type { Metadata } from "next"; // Metadata can still be exported from client components for initial load
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // This is your existing global Navbar

import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation"; // Import usePathname

const inter = Inter({ subsets: ["latin"] });

// Note: While `export const metadata` works for initial static rendering,
// for fully dynamic titles/descriptions in a client component context,
// you might explore other solutions like using a useEffect to set document.title,
// or if parts of your layout remain Server Components. For now, this should be okay.
/*
// This static metadata object might have limited effect in a full client component,
// but Next.js often handles initial static export well.
export const metadata: Metadata = {
  title: "Writing Selective Practice",
  description: "Practice writing for the NSW selective test",
};
*/
// If you need dynamic titles/descriptions not covered by the above,
// you'd typically manage that at the page level or via a context/provider.
// For now, let's focus on the layout structure.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/"; // Check if the current path is the root/landing page

  return (
    <html lang="en">
      <head>
        {/*
          It's generally recommended to let Next.js handle the <title> and <meta name="description">
          tags via its Metadata API at the page or layout level, rather than hardcoding them here.
          The `export const metadata` above is the preferred way.
          If that causes issues in a "use client" layout, you might need to handle title/meta
          at the page level or through a useEffect hook for dynamic updates.
        */}
        <title>Writing Selective Practice</title>{" "}
        {/* You can also manage this via metadata export */}
        <meta
          name="description"
          content="Practice writing for the NSW selective test"
        />
      </head>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-900`}>
        {/* Conditionally render the global Navbar */}
        {/* It will NOT render if isLandingPage is true */}
        {!isLandingPage && <Navbar />}

        <main>{children}</main>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
