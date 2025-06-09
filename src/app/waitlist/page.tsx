"use client";

import React, { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitWaitlist } from '@/app/_actions/waitlistActions';
import toast from 'react-hot-toast';

interface FormState {
  message: string;
  success: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Submitting...' : 'Submit Interest'} {/* <-- CHANGE: Button text updated */}
    </button>
  );
}

export default function WaitlistPage() {
  const initialState: FormState = { message: '', success: false };
  const [state, formAction] = useFormState(submitWaitlist, initialState);
  const formRef = useRef<HTMLFormElement>(null); // Ref to reset the form

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        formRef.current?.reset(); // Clear the form on success
        
        // --- CHANGE: Redirect after 5 seconds ---
        const timer = setTimeout(() => {
          window.location.href = '/'; // Redirect to the landing page
        }, 5000);

        // Cleanup the timer if the component unmounts
        return () => clearTimeout(timer);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto bg-white p-8 md:p-10 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Selective Writing Classes EOI
          </h1>
          {/* --- CHANGE: Subtitle updated --- */}
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
             {/* --- CHANGE: Label updated --- */}
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
              // --- CHANGE: Added pattern for client-side validation (no letters) ---
              pattern="[0-9\s+-]*"
              title="Please enter a valid phone number without letters."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 shadow-sm text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="yearLevel" className="block text-sm font-medium text-gray-700 mb-1">
              Student&apos;s Current Year Level
            </label>
            {/* --- CHANGE: Year level options updated --- */}
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
      </div>
    </div>
  );
}