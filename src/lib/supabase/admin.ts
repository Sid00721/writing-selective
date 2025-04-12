// src/lib/supabase/admin.ts (Revised to defer client creation)
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Function to create and return an admin client instance ON DEMAND
export const createAdminClient = (): SupabaseClient => {
  // Read environment variables INSIDE the function call
  // This ensures they are read at RUNTIME when the webhook executes, not at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Add runtime checks in case variables are missing in the execution environment
  if (!supabaseUrl) {
      console.error('CRITICAL ERROR (Webhook): Missing NEXT_PUBLIC_SUPABASE_URL env var.');
      throw new Error('Missing Supabase configuration.');
  }
  if (!supabaseServiceRoleKey) {
      console.error('CRITICAL ERROR (Webhook): Missing SUPABASE_SERVICE_ROLE_KEY env var.');
      throw new Error('Missing Supabase admin configuration.');
  }

  // Create a new client instance each time the function is called.
  // This is generally safe for serverless environments like Vercel's API routes/Edge Functions.
  const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      // detectSessionInUrl: false, // Might be useful if running strictly server-side
    },
  });

  console.log("Supabase Admin Client Created for request."); // Optional: log creation
  return supabaseAdminClient;
};