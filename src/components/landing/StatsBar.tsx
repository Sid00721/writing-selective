"use client"; // If using Next.js App Router

import React from 'react';
// Example icons from lucide-react.
// Replace these with your actual Subframe IconWithBackground components or other preferred SVGs.
import { Users, CheckCircle, Edit3, Star } from 'lucide-react';

interface StatItemProps {
  id: string | number;
  icon?: React.ReactNode; // Can be an SVG or a component like <IconWithBackground icon={<FeatherUsers />} />
  value: string;
  label: string;
}

interface StatsBarProps {
  title?: string;
  stats?: StatItemProps[]; // Optional: allows overriding default stats from page.tsx if ever needed
}

// Default static stats based on PDF (page 2) and your previous mock code's interpretation.
// The icons here are placeholders from lucide-react.
// You should replace 'icon' with your actual <IconWithBackground ... /> components.
const defaultStatsData: StatItemProps[] = [
  {
    id: 1,
    // Example: Replace with your <IconWithBackground size="large" icon={<FeatherUsers />} />
    icon: <Users size={36} className="text-sky-600" />,
    value: "5,000+",
    label: "Students Served",
  },
  {
    id: 2,
    // Example: Replace with your <IconWithBackground variant="success" ... />
    icon: <CheckCircle size={36} className="text-green-500" />,
    value: "92%", // From PDF page 2
    label: "Success Rate",
  },
  {
    id: 3,
    // Example: Replace with your <IconWithBackground ... />
    icon: <Edit3 size={36} className="text-blue-500" />,
    value: "100,000+",
    label: "Tests Completed",
  },
  {
    id: 4,
    // Example: Replace with your <IconWithBackground variant="warning" ... />
    icon: <Star size={36} className="text-yellow-500" />,
    value: "4.8/5",
    label: "Student Rating",
  },
];

export function StatsBar({
  title = "Trusted by Students Across NSW", // Default title
  stats = defaultStatsData, // Uses the static default data
}: StatsBarProps) {
  return (
    <section className="bg-slate-50 py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-6 md:px-8 lg:px-16">
        {title && (
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12 md:mb-16">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 lg:gap-x-8">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center flex flex-col items-center">
              {/*
                Render your IconWithBackground component here if you have one.
                For example, if stat.icon was structured like:
                stat.icon = <IconWithBackground icon={<FeatherUsers />} variant="primary" />;
                then you could just render {stat.icon}
                The current placeholder uses simple Lucide icons.
              */}
              {stat.icon && (
                <div className="mb-4 h-16 w-16 flex items-center justify-center">
                  {/* This div is a basic placeholder for icon presentation.
                      Your actual IconWithBackground component will define its own styling (background, padding etc.) */}
                  {stat.icon}
                </div>
              )}
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}