alter table public.courses
add column if not exists promotion_enabled boolean not null default true;
