"use client";

import React from 'react';
// Example icon from lucide-react.
import { Star } from 'lucide-react';

interface TestimonialItemProps {
  id: string | number;
  quote: string;
  name: string;
  role: string;
  rating: number; // Number from 1 to 5
  avatar?: string; // Optional avatar image URL
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: TestimonialItemProps[];
}

// Star component to render individual stars
const StarRating: React.FC<{ rating: number; maxRating?: number }> = ({ rating, maxRating = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => (
        <Star
          key={index}
          size={20}
          className={index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
};

// Default testimonials based on PDF page 9
const defaultTestimonialsData: TestimonialItemProps[] = [
  {
    id: 1,
    quote: "My daughter improved her writing score by 15 points after just one month of using Selective Writing Test. The detailed feedback was incredibly helpful.",
    name: "Sarah Johnson",
    role: "Parent of Year 5 Student",
    rating: 5,
  },
  {
    id: 2,
    quote: "The practice prompts are very similar to what appeared in the actual selective school test. This platform gave my son the confidence he needed.",
    name: "Michael Chen",
    role: "Parent of Year 6 Student",
    rating: 5,
  },
  {
    id: 3,
    quote: "As a tutor, I recommend this platform to all my students. The analytics help me identify exactly where each student needs to improve.",
    name: "Emma Rodriguez",
    role: "English Tutor",
    rating: 5,
  },
  {
    id: 4,
    quote: "The mock exams were instrumental in helping my son manage his time during the actual test. He got into his first-choice selective school!",
    name: "David Patel",
    role: "Parent of Year 6 Student",
    rating: 5,
  },
];

export function TestimonialsSection({
  title = "What Parents & Educators Say",
  subtitle = "Don't just take our word for it. Here's what parents and educators have to say about our platform.",
  testimonials = defaultTestimonialsData,
}: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="bg-slate-50 py-16 md:py-20 lg:py-24">
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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-2 border-gray-800 flex flex-col" // Updated border and hover shadow
            >
              <div className="mb-4">
                <StarRating rating={testimonial.rating} />
              </div>
              <blockquote className="text-gray-700 italic text-base md:text-lg leading-relaxed flex-grow">
                <p>&quot;{testimonial.quote}&quot;</p>
              </blockquote>
              <div className="mt-6 pt-5 border-t border-gray-200">
                <p className="font-semibold text-gray-800 text-base">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}