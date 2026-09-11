import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 *
 * This client bypasses RLS and must NEVER be imported into client code — the
 * `server-only` import above enforces that at build time. All browser access
 * goes through Next.js API routes (src/app/api/*), which use this client.
 * The prototype's mock login is checked in those routes; there is no real
 * Supabase Auth (SSOT Section 1.4).
 */
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
