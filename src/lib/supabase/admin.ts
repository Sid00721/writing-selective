// src/lib/supabase/admin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in server environment variables
// DO NOT EXPOSE SERVICE_ROLE_KEY TO THE BROWSER
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase URL or Service Role Key for admin client. Check server environment variables.');
}

// Cache the admin client singleton
let supabaseAdminClient: SupabaseClient | undefined;

// Function to get the admin client
export const createAdminClient = (): SupabaseClient => {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      // Note: For service_role key, auth options are often less critical
      // as it bypasses RLS, but setting these doesn't hurt.
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
     console.log("Supabase Admin Client Initialized (server-side)");
  }
  return supabaseAdminClient;
};