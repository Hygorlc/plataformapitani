-- Course materials are private and only visible to enrolled students or admins.
update storage.buckets
set public = false
where id = 'lesson-materials';

drop policy if exists "Authenticated users can view lesson materials"
on public.lesson_materials;

create policy "Enrolled students and admins can view lesson materials"
on public.lesson_materials for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
  or exists (
    select 1
    from public.enrollments
    where enrollments.user_id = (select auth.uid())
      and enrollments.course_id = lesson_materials.course_id
      and enrollments.status = 'active'
  )
);

-- Files are delivered through the authenticated application route using
-- short-lived signed URLs. Direct object access is intentionally disabled.
drop policy if exists "Authenticated users can read lesson material objects"
on storage.objects;

-- Stripe can deliver the same event more than once. This private table makes
-- webhook processing idempotent and is only accessible with the server key.
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
revoke all on table public.stripe_webhook_events from anon, authenticated;
grant all on table public.stripe_webhook_events to service_role;
