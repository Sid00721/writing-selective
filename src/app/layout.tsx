// src/app/layout.tsx
import type { Metadata } from "next";
// Keep the Inter import, remove Geist imports
import { Inter } from 'next/font/google';
import "./globals.css";

// Initialize Inter (remove GeistSans and GeistMono initializations)
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Writing Selective Practice", // You can update the title here
  description: "Practice writing for the NSW selective test", // Update description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the Inter font className directly to the body
    // Removed the Geist variable classes
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}