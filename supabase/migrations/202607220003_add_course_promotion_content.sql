alter table public.courses
add column if not exists promotion_enabled boolean not null default true,
add column if not exists promotion_text text not null default 'Condição especial',
add column if not exists promotion_days integer not null default 7;

alter table public.courses
drop constraint if exists courses_promotion_days_check;

alter table public.courses
add constraint courses_promotion_days_check
check (promotion_days between 1 and 365);
