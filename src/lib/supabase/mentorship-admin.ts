import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export function createMentorshipAdminClient() {
  // Courses, authentication and mentorships now share the same Supabase
  // project. Keep this wrapper temporarily so mentorship data callers do not
  // need a risky large-scale rewrite.
  return createAdminClient();
}
