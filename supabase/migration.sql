-- Run this once in your Supabase project → SQL Editor

-- 1. User profiles table (one row per user, stores all app data as JSON)
create table if not exists public.user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  data        jsonb        not null default '{}',
  updated_at  timestamptz  not null default now()
);

-- 2. Row Level Security — users can only read/write their own row
alter table public.user_profiles enable row level security;

create policy "Users manage own profile"
  on public.user_profiles
  for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. Auto-update updated_at on every write
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_user_profiles_updated
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();
