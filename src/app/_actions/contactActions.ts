// src/app/_actions/contactActions.ts
"use server";

import { Resend } from 'resend';

export interface FormState {
  message: string;
  success: boolean;
}

export async function submitContactForm(prevState: FormState, formData: FormData) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set.');
    return { message: 'Server configuration error. Please try again later.', success: false };
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string || 'No Subject';
  const message = formData.get('message') as string;

  // --- Server-Side Validation ---
  if (!name || !email || !message) {
    return { message: 'Please fill out all required fields.', success: false };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { message: 'Please enter a valid email address.', success: false };
  }
  // --- End Validation ---

  const emailHtml = `
    <div>
      <h1 style="font-family: Arial, sans-serif; color: #333;">New Contact Form Message</h1>
      <p style="font-family: Arial, sans-serif; font-size: 14px; color: #555;">From: ${name} (${email})</p>
      <hr>
      <h3 style="font-family: Arial, sans-serif; color: #333;">Subject: ${subject}</h3>
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #555; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: 'YOUR_EMAIL_HERE@example.com', // <-- IMPORTANT: CHANGE THIS
      subject: `New Message from ${name}: ${subject}`,
      replyTo: email, // This allows you to reply directly to the user
      html: emailHtml,
    });

    return { message: 'Thank you for your message! We will get back to you soon.', success: true };

  } catch (error) {
    console.error('Email sending error:', error);
    return { message: 'Something went wrong. Please try again.', success: false };
  }
}