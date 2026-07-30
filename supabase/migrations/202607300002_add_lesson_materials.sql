create table if not exists public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  file_name text not null,
  file_url text not null,
  storage_path text not null,
  file_size_bytes bigint not null default 0,
  mime_type text,
  created_at timestamptz not null default now()
);

alter table public.lesson_materials enable row level security;

drop policy if exists "Authenticated users can view lesson materials" on public.lesson_materials;
create policy "Authenticated users can view lesson materials"
on public.lesson_materials for select
to authenticated
using (true);

insert into storage.buckets (id, name, public, file_size_limit)
values ('lesson-materials', 'lesson-materials', true, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;
