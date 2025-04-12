// src/lib/supabase/server.ts (TEMPORARY DIAGNOSTIC - Uses basic client)

import { createClient as createBasicClient } from '@supabase/supabase-js'; // Use basic client

// TEMPORARY: Create a basic client without cookie handling for diagnosis
export function createClient() { // No longer async needed for this basic version
  console.log('[DIAGNOSTIC] Attempting BASIC createClient in server.ts');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[DIAGNOSTIC] Missing URL or Anon Key for BASIC client in server.ts');
    // If env vars ARE missing here despite previous log, that's the problem
    throw new Error('Missing Supabase URL or Anon Key inside server.ts createClient');
  }

  console.log('[DIAGNOSTIC] URL & Anon Key found. Initializing basic client...');

  // Create a basic client instance.
  // NOTE: This client WILL NOT manage auth sessions via cookies correctly.
  // This is ONLY to see if the basic initialization succeeds at runtime.
  try {
    const client = createBasicClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            // Required for server-side operations without session persistence
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false, // Usually false for server-side
        }
    });
    console.log('[DIAGNOSTIC] Basic client initialized successfully.');
    return client;
  } catch (error) {
      console.error('[DIAGNOSTIC] Error during basic client initialization:', error);
      throw error; // Re-throw error to see it clearly
  }
}

// --- ORIGINAL SSR CODE COMMENTED OUT ---
/*
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (error) {}
        },
      },
    }
  );
}
*/