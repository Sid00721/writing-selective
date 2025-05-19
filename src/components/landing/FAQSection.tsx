"use client";

import React, { useState } from 'react';
// Example icons from lucide-react.
import { ChevronDown, ChevronUp } from 'lucide-react'; // Or Plus / Minus

interface FAQItemData {
  id: string | number;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FAQItemData[];
}

// Default FAQ data based on PDF page 4 (answers are placeholders)
const defaultFaqsData: FAQItemData[] = [
  {
    id: 1,
    question: "How does the platform help improve writing skills?",
    answer: "Our platform helps improve writing skills by providing a vast library of practice prompts across all official genres, timed exercises to simulate exam conditions, and detailed, AI-powered feedback based on specific marking criteria. This allows students to understand their strengths and weaknesses, learn from targeted suggestions, and iteratively refine their writing.",
  },
  {
    id: 2,
    question: "Is this suitable for all year levels?",
    answer: "The platform is specifically designed for Year 5 and Year 6 students in NSW, Australia, preparing for the writing component of the Selective School Placement Test. The prompts and feedback rubrics are tailored to this curriculum and age group.",
  },
  {
    id: 3,
    question: "How often is new content added?",
    answer: "We regularly update our prompt library and review our AI feedback models to ensure the content remains fresh, relevant, and aligned with the latest exam formats and expectations. New prompts are typically added on a monthly basis.",
  },
  {
    id: 4,
    question: "Can I provide feedback on my child's experience?",
    answer: "Yes, we welcome feedback from parents and students! There is a contact form available on our platform, and we encourage you to share your experiences or suggestions to help us continuously improve.",
  },
  {
    id: 5,
    question: "What happens after my subscription ends?",
    answer: "After your subscription ends, you will still be able to log in to view your past submissions and feedback reports. However, you will not be able to attempt new writing prompts until you renew your subscription.",
  },
  {
    id: 6, // As per PDF page 4 "Is there a free trial available?" was the last one
    question: "Is there a free trial available?",
    answer: "Currently, we focus on providing maximum value through our comprehensive paid package. We encourage you to review our features and testimonials to see how we can help your child succeed. Please email info@easycodingau.com.au for a request for a free trial."
  },
];

// Individual FAQ Item Component
const FAQItem: React.FC<{ item: FAQItemData; isOpen: boolean; onToggle: () => void }> = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200">
      <h2>
        <button
          type="button"
          className="flex justify-between items-center w-full py-5 text-left text-gray-800 hover:text-sky-600 focus:outline-none"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${item.id}`}
        >
          <span className="text-lg font-medium">{item.question}</span>
          <span className="ml-4">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </span>
        </button>
      </h2>
      <div
        id={`faq-answer-${item.id}`}
        className={`overflow-hidden transition-max-height duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
        role="region"
        aria-labelledby={`faq-question-${item.id}`}
      >
        <div className="pt-1 pb-5 text-gray-600 leading-relaxed">
          {item.answer}
        </div>
      </div>
    </div>
  );
};


export function FAQSection({
  title = "Frequently Asked Questions",
  subtitle = "Find answers to common questions about our platform and how it helps students prepare for the NSW Selective Schools Test.",
  faqs = defaultFaqsData,
}: FAQSectionProps) {
  const [openFAQ, setOpenFAQ] = useState<string | number | null>(null);

  const handleToggle = (id: string | number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <section id="faq" className="bg-white py-16 md:py-20 lg:py-24">
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

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faqItem) => (
            <FAQItem
              key={faqItem.id}
              item={faqItem}
              isOpen={openFAQ === faqItem.id}
              onToggle={() => handleToggle(faqItem.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}