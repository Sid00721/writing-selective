"use client";

import React from 'react';
import Link from 'next/link';

interface CtaProps {
  text: string;
  href: string;
}

interface FinalCTASectionProps {
  title?: string;
  description?: string;
  primaryCta?: CtaProps;
  secondaryCta?: CtaProps; // Optional secondary action
}

const defaultPrimaryCta: CtaProps = {
  text: "Get Started Now",
  href: "/signup",
};

// Example secondary CTA, can be removed or modified
const defaultSecondaryCta: CtaProps = {
  text: "View Features",
  href: "#features",
};

export function FinalCTASection({
  title = "Ready to Improve Your Writing Skills?",
  description = "Join thousands of students who have boosted their writing scores and gained admission to NSW selective schools. Take the next step on your journey to success today!",
  primaryCta = defaultPrimaryCta,
  secondaryCta = defaultSecondaryCta, // Set to undefined or null if not needed
}: FinalCTASectionProps) {
  return (
    <section className="bg-slate-50 py-16 md:py-20 lg:py-24"> {/* Using bg-slate-50 for slight visual break */}
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          {title}
        </h2>
        {description && (
          <p className="mt-5 text-lg text-gray-700 max-w-xl lg:max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryCta && (
            <Link
              href={primaryCta.href}
              className="inline-block w-full sm:w-auto bg-gray-800 text-white hover:bg-gray-700 transition-colors px-8 py-3 rounded-lg text-base sm:text-lg font-medium shadow-md"
            >
              {primaryCta.text}
            </Link>
          )}
          {secondaryCta && (
             <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {secondaryCta.text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}