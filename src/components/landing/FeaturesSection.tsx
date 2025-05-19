"use client";

import React from 'react';
// Example icons from lucide-react. Replace with your actual icons that match the style in the image.
import { ListChecks, Timer, BarChart3, Target, MessageSquareText, Award } from 'lucide-react';

interface FeatureItemProps {
  id: string | number;
  icon?: React.ReactNode;
  name: string;
  description: string;
}

interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  features?: FeatureItemProps[];
}

const defaultFeaturesData: FeatureItemProps[] = [
  {
    id: 1,
    icon: <ListChecks size={28} className="text-gray-700" />,
    name: "Unlimited Practice",
    description: "Access hundreds of writing prompts designed specifically for selective school exams.",
  },
  {
    id: 2,
    icon: <Timer size={28} className="text-gray-700" />,
    name: "Mock Exams",
    description: "Experience realistic test conditions with timed mock exams that simulate the actual selective school test.",
  },
  {
    id: 3,
    icon: <BarChart3 size={28} className="text-gray-700" />,
    name: "Detailed Analytics",
    description: "Track progress with comprehensive analytics that identify strengths and areas for improvement.",
  },
  {
    id: 4,
    icon: <Target size={28} className="text-gray-700" />,
    name: "Time Management",
    description: "Learn to write efficiently under timed conditions, a crucial skill for the selective school test.",
  },
  {
    id: 5,
    icon: <MessageSquareText size={28} className="text-gray-700" />,
    name: "Expert Feedback",
    description: "Receive detailed feedback from experienced educators to improve your writing skills.",
  },
  {
    id: 6,
    icon: <Award size={28} className="text-gray-700" />,
    name: "Proven Results",
    description: "Join thousands of students who have improved their writing scores and gained admission to selective schools.",
  },
];

export function FeaturesSection({
  title = "Everything You Need to Succeed",
  subtitle = "Our platform provides comprehensive tools and resources to help students excel in the writing component of the NSW Selective Schools Test.",
  features = defaultFeaturesData,
}: FeaturesSectionProps) {
  return (
    <section id="features" className="bg-white py-16 md:py-20 lg:py-24">
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-start text-left p-6 border-2 border-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out" // Updated border color
            >
              {feature.icon && (
                <div className="mb-4 h-10 w-10 flex items-center justify-center">
                  {feature.icon}
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-1 text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}