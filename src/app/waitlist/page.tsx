// src/app/waitlist/page.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitWaitlist } from '@/app/_actions/waitlistActions';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface FormState {
  message: string;
  success: boolean;
}

// --- The Success Display Component ---
const SuccessDisplay = ({ onReset }: { onReset: () => void }) => (
  <div className="text-center transition-all duration-500 ease-in-out">
    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
      <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>
    <h2 className="text-2xl font-bold text-gray-900 mt-4">You&apos;re on the list!</h2>
    <p className="text-gray-600 mt-2">
      Thank you for your interest! We&apos;ll be in touch with updates soon.
    </p>

    <div className="mt-8 flex flex-col sm:flex-row-reverse justify-center gap-4">
        <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center"
        >
            Discover Our Services
        </Link>
        <button
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-150 ease-in-out"
        >
            Submit Another EOI
        </button>
    </div>
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
      {pending ? 'Submitting...' : 'Submit Interest'}
    </button>
  );
}


// --- The Main Page Component ---
export default function WaitlistPage() {
  const initialState: FormState = { message: '', success: false };
  const [state, formAction] = useFormState(submitWaitlist, initialState);
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
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto bg-white p-8 md:p-10 rounded-xl shadow-lg">
        {showSuccess ? (
          <SuccessDisplay onReset={handleReset} />
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Selective Writing Classes EOI
              </h1>
              <p className="text-gray-600 mt-2">
                Fill the form to level up your student&apos;s writing marks for selective entrance exams.
              </p>
            </div>

            <form ref={formRef} action={formAction} className="space-y-6">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Student&apos;s Full Name
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 shadow-sm text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Name
                </label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 shadow-sm text-gray-900"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent&apos;s Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  pattern="[0-9\s+-]*"
                  title="Please enter a valid phone number without letters."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 shadow-sm text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="yearLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Student&apos;s Current Year Level
                </label>
                <select
                  id="yearLevel"
                  name="yearLevel"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 shadow-sm bg-white text-gray-900"
                >
                  <option value="">Please select a year</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
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