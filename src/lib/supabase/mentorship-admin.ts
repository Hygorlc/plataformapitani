import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createMentorshipAdminClient() {
  const url = process.env.MENTORSHIP_SUPABASE_URL;
  const secretKey = process.env.MENTORSHIP_SUPABASE_SECRET_KEY;

  if (!url || !secretKey) return null;

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
