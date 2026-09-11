import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 *
 * This client bypasses RLS and must NEVER be imported into client code — the
 * `server-only` import above enforces that at build time. All browser access
 * goes through Next.js API routes (src/app/api/*), which use this client.
 *
 * The client is created lazily (on first use) rather than at module load, so
 * importing this file during the build doesn't throw when env vars aren't yet
 * available — the error only surfaces at request time if they're truly missing.
 */
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/**
 * Backward-compatible lazy proxy. Existing code uses `supabaseAdmin.from(...)`;
 * the proxy defers client creation until a property is actually accessed at
 * request time, so importing this module during the build never throws.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const real = getSupabaseAdmin();
    const value = Reflect.get(
      real as unknown as object,
      prop,
      receiver
    );
    return typeof value === "function" ? value.bind(real) : value;
  },
});
