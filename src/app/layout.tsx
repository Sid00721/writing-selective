// src/app/layout.tsx
import type { Metadata } from "next";
// Keep the Inter import, remove Geist imports
import { Inter } from 'next/font/google';
import "./globals.css";
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

// Initialize Inter (remove GeistSans and GeistMono initializations)
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Writing Selective Practice", // You can update the title here
  description: "Practice writing for the NSW selective test", // Update description
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}> {/* Added bg-slate-50 maybe */}
        <Navbar /> {/* <-- Render Navbar here */}
        <main>{children}</main> {/* Wrap children in main for semantics */}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}