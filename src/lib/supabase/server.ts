// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers'; // Keep this import

// Modified: Function now accepts URL and Key as arguments
export function createClient(supabaseUrl: string, supabaseKey: string) {
  // Corrected: Remove 'await', cookies() is synchronous
  const cookieStore = cookies();

  // Check if required arguments were passed
  if (!supabaseUrl || !supabaseKey) {
    // Throw an error early if the config is missing when the function is called
    throw new Error('Supabase URL and Anon Key are required to create a client.');
  }

  // Use the passed arguments
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (_error) {
            // Ignore errors from Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (_error) {
            // Ignore errors from Server Components
          }
        },
      },
    }
  );
}