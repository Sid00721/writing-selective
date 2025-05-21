"use client"; // If using Next.js App Router

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Using Next.js Image for optimization

interface Cta {
  text: string;
  href: string;
}

interface HeroSectionProps {
  headline: string;
  subHeadline: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  image: {
    src: string;
    alt: string;
    width: number; // Required for Next/Image static import or known dimensions
    height: number; // Required for Next/Image static import or known dimensions
  };
  badgeText?: string;
  finePrint?: string;
}

export function HeroSection({
  headline,
  subHeadline,
  primaryCta,
  secondaryCta,
  image,
  badgeText,
  finePrint,
}: HeroSectionProps) {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-28"> {/* Adjusted padding */}
      <div className="container mx-auto px-6 md:px-8 lg:px-16">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
          {/* Text Content Column */}
          <div className="md:w-1/2 lg:w-3/5 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-gray-900 leading-tight -tracking-[0.02em]">
              {headline}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-gray-700 max-w-xl mx-auto md:mx-0">
              {subHeadline}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link
                href={primaryCta.href}
                className="inline-block bg-gray-800 text-white hover:bg-gray-700 transition-colors px-8 py-3 rounded-lg text-base sm:text-lg font-medium shadow-md w-full sm:w-auto"
              >
                {primaryCta.text}
              </Link>
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium text-base sm:text-lg group w-full sm:w-auto justify-center"
                >
                  {secondaryCta.text}
                  <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
                </Link>
              )}
            </div>

            {finePrint && (
              <p className="mt-5 text-xs text-gray-500 text-center md:text-left">
                {finePrint}
              </p>
            )}
          </div>

          {/* Image Column */}
          <div className="md:w-1/2 lg:w-2/5 mt-10 md:mt-0 w-full">
            <div className="relative aspect-[4/3] sm:aspect-[5/3.5] md:aspect-auto md:h-full max-h-[300px] sm:max-h-[350px] md:max-h-[450px] lg:max-h-[500px]"> {/* Adjusted aspect ratio and max height */}
              <Image
                src={image.src}
                alt={image.alt}
                fill // Use fill and let parent div control size with aspect ratio or fixed height
                className="object-cover rounded-xl shadow-xl"
                priority // Good to add for LCP images
              />
              {badgeText && (
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-gray-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-md shadow">
                  {badgeText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Example of how to use it in src/app/page.tsx:
//
// import { HeroSection } from '@/components/landing/HeroSection';
//
// const heroData = {
//   headline: "Unlimited Practice for NSW Selective Schools Writing Tests",
//   subHeadline: "Improve your writing skills with hundreds of practice prompts, detailed feedback, and personalized analytics designed specifically for the NSW Selective Schools Test.",
//   primaryCta: { text: "Start Free Trial", href: "/signup" },
//   secondaryCta: { text: "Learn More", href: "#features" }, // Example link
//   image: {
//     src: "/images/placeholder-hero-students.jpg", // Replace with your actual image path in /public/images
//     alt: "Students happily learning and practicing writing for selective tests",
//     width: 800, // Provide actual or approximate dimensions
//     height: 600,
//   },
//   badgeText: "Students Helped 5,000+",
//   finePrint: "No credit card required. 7-day free trial. Cancel anytime.",
// };
//
// export default function LandingPage() {
//   return (
//     <div>
//       <Header /> {/* Assuming Header is already imported */}
//       <HeroSection {...heroData} />
//       {/* Other sections... */}
//     </div>
//   );
// }