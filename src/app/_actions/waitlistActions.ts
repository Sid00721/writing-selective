"use server";

import { Resend } from 'resend';

export interface FormState {
  message: string;
  success: boolean;
}

export async function submitWaitlist(prevState: FormState, formData: FormData) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set.');
    return { message: 'Server configuration error. Please try again later.', success: false };
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);

  const studentName = formData.get('studentName') as string;
  const parentName = formData.get('parentName') as string;
  const phone = formData.get('phone') as string;
  const yearLevel = formData.get('yearLevel') as string;
  const message = formData.get('message') as string || 'No message provided.';

  // --- ENHANCED VALIDATION ---
  if (!studentName || !parentName || !phone || !yearLevel) {
    return { message: 'Please fill out all required fields.', success: false };
  }
  
  // Checks if the phone number contains anything other than numbers, spaces, or a plus/minus sign
  const phoneRegex = /^[0-9\s+-]*$/;
  if (!phoneRegex.test(phone)) {
    return { message: 'Please enter a valid phone number with no letters.', success: false };
  }
  // --- END VALIDATION ---

  const emailHtml = `
    <div>
      <h1 style="font-family: Arial, sans-serif; color: #333;">New Waitlist Submission (EOI)</h1>
      <p style="font-family: Arial, sans-serif; font-size: 14px; color: #555;">You have received a new Expression of Interest from your website.</p>
      <hr>
      <h3 style="font-family: Arial, sans-serif; color: #333;">Submission Details:</h3>
      <ul>
        <li style="font-family: Arial, sans-serif; font-size: 14px;"><strong>Student's Name:</strong> ${studentName}</li>
        <li style="font-family: Arial, sans-serif; font-size: 14px;"><strong>Student's Year Level:</strong> Year ${yearLevel}</li>
        <li style="font-family: Arial, sans-serif; font-size: 14px;"><strong>Parent's Name:</strong> ${parentName}</li>
        <li style="font-family: Arial, sans-serif; font-size: 14px;"><strong>Parent's Phone:</strong> ${phone}</li>
        <li style="font-family: Arial, sans-serif; font-size: 14px;"><strong>Message:</strong> ${message}</li>
      </ul>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Waitlist Form <onboarding@resend.dev>',
      to: 'YOUR_EMAIL_HERE@example.com', 
      subject: `New EOI Submission: ${studentName}`,
      html: emailHtml,
    });

    return { message: 'Thank you! Your submission has been received.', success: true };

  } catch (error) {
    console.error('Email sending error:', error);
    return { message: 'Something went wrong. Please try again.', success: false };
  }
}