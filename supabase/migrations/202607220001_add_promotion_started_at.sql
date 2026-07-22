alter table public.profiles
add column if not exists promotion_started_at timestamptz not null default now();
