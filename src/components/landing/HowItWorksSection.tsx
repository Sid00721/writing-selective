"use client";

import React from 'react';
import Link from 'next/link';
// Example icons from lucide-react. Replace with your actual icons.
import { UserPlus, Edit, MessageCircleHeart, TrendingUp } from 'lucide-react';

interface StepItemProps {
  id: string | number;
  number: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

interface HowItWorksSectionProps {
  title?: string;
  subtitle?: string;
  steps?: StepItemProps[];
  ctaText?: string;
  ctaLink?: string;
}

const defaultStepsData: StepItemProps[] = [
  {
    id: 1,
    number: "01",
    name: "Sign Up",
    description: "Create your account in minutes and get immediate access to our comprehensive writing platform.",
    icon: <UserPlus size={28} className="text-gray-500" />, // Increased icon size
  },
  {
    id: 2,
    number: "02",
    name: "Practice with Prompts",
    description: "Choose from hundreds of writing prompts designed specifically for the NSW Selective Schools Test.",
    icon: <Edit size={28} className="text-gray-500" />, // Increased icon size
  },
  {
    id: 3,
    number: "03",
    name: "Receive Feedback",
    description: "Get detailed feedback on your writing to understand your strengths and areas for improvement.",
    icon: <MessageCircleHeart size={28} className="text-gray-500" />, // Increased icon size
  },
  {
    id: 4,
    number: "04",
    name: "Track Your Progress",
    description: "Monitor your improvement over time with comprehensive analytics and performance tracking.",
    icon: <TrendingUp size={28} className="text-gray-500" />, // Increased icon size
  },
];

export function HowItWorksSection({
  title = "How It Works",
  subtitle = "Our simple four-step process will help you improve your writing skills and prepare for the NSW Selective School Test.",
  steps = defaultStepsData,
  ctaText = "Get Started Today",
  ctaLink = "/signup",
}: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="bg-white py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-6 md:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Steps Container */}
        <div className="max-w-3xl lg:max-w-4xl mx-auto flex flex-col gap-8 md:gap-10"> {/* Increased max-width */}
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-5 sm:gap-6 md:gap-8 py-3"> {/* Main flex container for a step */}
              {/* Step Number */}
              <div className="flex-none w-10 text-2xl sm:text-3xl font-bold text-gray-700"> {/* Adjusted styling for number */}
                {step.number}
              </div>

              {/* Step Text Content */}
              <div className="flex-1 text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {step.name}
                </h3>
                <p className="mt-1 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step Icon */}
              {step.icon && (
                <div className="flex-none text-gray-500"> {/* Icon on the far right */}
                  {step.icon}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        {ctaText && ctaLink && (
          <div className="mt-12 md:mt-16 text-center">
            <Link
              href={ctaLink}
              className="inline-block bg-gray-800 text-white hover:bg-gray-700 transition-colors px-10 py-3 rounded-lg text-base sm:text-lg font-medium shadow-md"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}