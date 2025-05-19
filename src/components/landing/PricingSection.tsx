"use client";

import React from 'react';
import Link from 'next/link';
// Example icon from lucide-react.
import { Check } from 'lucide-react';

interface PricingPlanItemProps {
  id: string | number;
  name: string;
  price: string;
  frequency: string;
  description?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  isFeatured?: boolean;
  borderColor?: string; // e.g., "border-gray-800" or "border-sky-500"
}

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  plans?: PricingPlanItemProps[];
}

// Default plan based on PDF page 5 ("Complete Package")
const defaultPlansData: PricingPlanItemProps[] = [
  {
    id: 1,
    name: "Complete Package",
    price: "$15.00",
    frequency: "/ month",
    // description: "One simple plan with all the features you need.", // Could be a prop for the section subtitle instead
    features: [
      "Unlimited Writing Tests",
      "Personalized Feedback",
      "Advanced Analytics",
    ],
    ctaText: "Sign Up Now",
    ctaLink: "/signup?plan=complete", // Example link structure
    isFeatured: true, // Making it featured to apply the dark border from PDF
    borderColor: "border-gray-800", // Prominent dark border as seen on PDF page 5
  },
  // Add more plans here if needed
  // {
  //   id: 2,
  //   name: "Basic",
  //   price: "$9.99",
  //   frequency: "/ month",
  //   features: ["Feature A", "Feature B"],
  //   ctaText: "Get Started",
  //   ctaLink: "/signup?plan=basic",
  //   borderColor: "border-gray-300",
  // },
];

export function PricingSection({
  title = "Simple, Transparent Pricing",
  subtitle, // = "One simple plan with all the features you need.", // Or "Choose the plan that's right for you."
  plans = defaultPlansData,
}: PricingSectionProps) {
  // If only one plan, we might want to center it more explicitly.
  // The grid classes will handle one item by centering it if max-w is set on the grid container.
  const gridColsClass = plans.length === 1 ? "max-w-md mx-auto" :
                       plans.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" :
                       "md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto";

  return (
    <section id="pricing" className="bg-white py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-6 md:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
              {subtitle || (plans.length === 1 && "One simple plan with all the features you need.")}
            </p>
          )}
        </div>

        {/* Pricing Plans Grid */}
        <div className={`grid grid-cols-1 gap-8 ${gridColsClass}`}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white p-6 md:p-8 rounded-xl shadow-xl border-2 ${plan.borderColor || 'border-gray-300'} flex flex-col h-full`}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {plan.name}
              </h3>
              {plan.description && (
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
              )}
              <div className="flex items-end mb-6">
                <span className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-none">
                  {plan.price}
                </span>
                <span className="text-base text-gray-500 ml-1 self-end pb-1">
                  {plan.frequency}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <Check size={20} className="text-green-500 h-5 w-5 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaLink}
                className="w-full block text-center bg-gray-800 text-white hover:bg-gray-700 transition-colors px-6 py-3 rounded-lg text-lg font-medium mt-auto"
              >
                {plan.ctaText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}