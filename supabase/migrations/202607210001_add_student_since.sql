alter table public.profiles
add column if not exists student_since timestamptz;

update public.profiles as profile
set student_since = first_enrollment.enrolled_at
from (
  select user_id, min(enrolled_at) as enrolled_at
  from public.enrollments
  where status = 'active'
  group by user_id
) as first_enrollment
where profile.id = first_enrollment.user_id
  and profile.student_since is null;
