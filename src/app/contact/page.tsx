// src/app/contact/page.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitContactForm } from '@/app/_actions/contactActions';
import toast from 'react-hot-toast';

interface FormState {
  message: string;
  success: boolean;
}

// --- The NEW Success Display Component (with corrected SVG structure) ---
const SuccessDisplay = ({ onReset }: { onReset: () => void }) => (
  <div className="text-center transition-all duration-500 ease-in-out">
    {/* This SVG structure now more closely matches the reference example */}
    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
      <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>

    <h2 className="text-2xl font-bold text-gray-900 mt-4">Message Sent!</h2>
    <p className="text-gray-600 mt-2">
      We&apos;ve received your message and will get back to you shortly.
    </p>
    <button
      onClick={onReset}
      className="mt-8 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-150 ease-in-out"
    >
      Send Another Message
    </button>
  </div>
);


// --- The Form's Submit Button ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Sending...' : 'Send Message'}
    </button>
  );
}


// --- The Main Page Component ---
export default function ContactPage() {
  const initialState: FormState = { message: '', success: false };
  const [state, formAction] = useFormState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.dismiss();
        setShowSuccess(true);
        formRef.current?.reset();
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const handleReset = () => {
    setShowSuccess(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto bg-white p-8 md:p-10 rounded-xl shadow-lg">
        {showSuccess ? (
          <SuccessDisplay onReset={handleReset} />
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Contact Us
              </h1>
              <p className="text-gray-600 mt-2">
                Have a question? Fill out the form below and we&apos;ll get back to you.
              </p>
            </div>

            <form ref={formRef} action={formAction} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 shadow-sm text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 shadow-sm text-gray-900"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 shadow-sm text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 shadow-sm text-gray-900"
                ></textarea>
              </div>

              <div className="pt-2">
                <SubmitButton />
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}