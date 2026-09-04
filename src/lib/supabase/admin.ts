import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role client. Bypasses RLS entirely — only ever import this from
 * server-only code paths (Server Actions, Route Handlers) that have already
 * verified the caller's identity/authorization themselves.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // This is the server key for the single consolidated Supabase project.
    // The legacy variable name remains in Vercel to avoid copying the secret.
    process.env.MENTORSHIP_SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
