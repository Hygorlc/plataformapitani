create table if not exists public.course_access_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  claimed_by uuid references public.profiles(id) on delete set null,
  constraint course_access_invites_normalized_email
    check (email = lower(btrim(email))),
  constraint course_access_invites_email_course_key unique (email, course_id)
);

create index if not exists course_access_invites_pending_email_idx
  on public.course_access_invites (email)
  where claimed_at is null;

alter table public.course_access_invites enable row level security;

revoke all on table public.course_access_invites from anon, authenticated;
grant all on table public.course_access_invites to service_role;
