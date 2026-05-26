import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Uses Next 15 async cookies API and forwards cookies on write so that
 * refreshed sessions are persisted across requests.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseEnv.url(), supabaseEnv.anonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Service-role client. NEVER expose to the client.
 * Use only in trusted server-side code that bypasses RLS intentionally
 * (e.g. admin tasks, webhooks). Prefer the user-scoped client above.
 */
import { createClient } from "@supabase/supabase-js";
export function createSupabaseServiceRoleClient() {
  return createClient<Database>(supabaseEnv.url(), supabaseEnv.serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
