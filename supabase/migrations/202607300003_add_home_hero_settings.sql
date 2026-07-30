create table if not exists public.platform_settings (
  id text primary key,
  home_hero_mode text not null default 'video'
    check (home_hero_mode in ('video', 'carousel')),
  home_video_url text not null default 'https://www.youtube.com/watch?v=RLBZNpJHjpI',
  home_carousel_slides jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (id)
values ('main')
on conflict (id) do nothing;

alter table public.platform_settings enable row level security;

drop policy if exists "Authenticated users can view platform settings" on public.platform_settings;
create policy "Authenticated users can view platform settings"
on public.platform_settings for select
to authenticated
using (true);
