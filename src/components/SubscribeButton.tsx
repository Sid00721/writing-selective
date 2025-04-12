// src/components/SubscribeButton.tsx
"use client";

import React, { useState, useTransition } from 'react';
import { createCheckoutSession } from '@/app/_actions/checkActions'; // Import the Server Action
import toast from 'react-hot-toast';

export default function SubscribeButton() {
  // useTransition is helpful for loading states with Server Actions
  // isPending will be true while the action is executing
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubscribeClick = async () => {
    setErrorMessage(null); // Clear previous errors

    // startTransition keeps the UI interactive during action execution
    startTransition(async () => {
      const result = await createCheckoutSession(); // Call the server action

      if (result.error) {
        console.error("Checkout Error:", result.error);
        setErrorMessage(result.error); // Store error message
        toast.error(result.error); // Show toast error
      } else if (result.checkoutUrl) {
        // On success, redirect the user to Stripe Checkout
        console.log("Redirecting to Stripe Checkout:", result.checkoutUrl);
        window.location.href = result.checkoutUrl; // Use window.location for Stripe redirect
      } else {
        // Handle unexpected case where there's no error but no URL
        const unexpectedError = "Could not retrieve checkout session. Please try again.";
        console.error("Checkout Error:", unexpectedError);
        setErrorMessage(unexpectedError);
        toast.error(unexpectedError);
      }
    });
  };

  return (
    // You can style this button however you like
    <button
      onClick={handleSubscribeClick}
      disabled={isPending} // Disable button while action is running
      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Processing...' : 'Subscribe $15 AUD/month'}
    </button>
    // Optionally display error message near the button
    // {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
  );
}