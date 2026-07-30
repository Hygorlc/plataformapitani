alter table public.courses
add column if not exists original_price_cents integer;

alter table public.courses
add constraint courses_original_price_cents_nonnegative
check (original_price_cents is null or original_price_cents >= 0);
