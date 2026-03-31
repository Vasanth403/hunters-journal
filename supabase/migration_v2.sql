-- ─── Public leaderboard profiles ────────────────────────────────────────────
create table if not exists public.user_public (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Hunter',
  level        integer not null default 1,
  xp_total     integer not null default 0,
  rank_title   text not null default 'Unranked',
  rank_badge   text not null default 'UNRANKED',
  quests_total integer not null default 0,
  updated_at   timestamptz not null default now()
);
alter table public.user_public enable row level security;
create policy "Public profiles viewable by all"    on public.user_public for select using (true);
create policy "Users manage own public profile"    on public.user_public for all    using (auth.uid() = id) with check (auth.uid() = id);

-- ─── Friendships ──────────────────────────────────────────────────────────────
create table if not exists public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users(id) on delete cascade not null,
  receiver_id  uuid references auth.users(id) on delete cascade not null,
  status       text not null default 'pending' check (status in ('pending','accepted')),
  created_at   timestamptz not null default now(),
  unique(requester_id, receiver_id)
);
alter table public.friendships enable row level security;
create policy "Participants can view"    on public.friendships for select using (auth.uid() = requester_id or auth.uid() = receiver_id);
create policy "Requester can insert"     on public.friendships for insert with check (auth.uid() = requester_id);
create policy "Receiver can update"      on public.friendships for update using (auth.uid() = receiver_id);
create policy "Participants can delete"  on public.friendships for delete using (auth.uid() = requester_id or auth.uid() = receiver_id);

-- ─── Guilds ───────────────────────────────────────────────────────────────────
create table if not exists public.guilds (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text not null default '',
  leader_id   uuid references auth.users(id) not null,
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  created_at  timestamptz not null default now()
);
alter table public.guilds enable row level security;
create policy "Guilds viewable by all"       on public.guilds for select using (true);
create policy "Anyone can create a guild"    on public.guilds for insert with check (auth.uid() = leader_id);
create policy "Leaders manage their guild"   on public.guilds for update using (auth.uid() = leader_id);
create policy "Leaders can delete their guild" on public.guilds for delete using (auth.uid() = leader_id);

-- ─── Guild members ────────────────────────────────────────────────────────────
create table if not exists public.guild_members (
  guild_id  uuid references public.guilds(id) on delete cascade,
  user_id   uuid references auth.users(id) on delete cascade,
  role      text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);
alter table public.guild_members enable row level security;
create policy "Members viewable by all"        on public.guild_members for select using (true);
create policy "Users manage own membership"    on public.guild_members for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Leaders can remove members"     on public.guild_members for delete using (
  exists (select 1 from public.guilds where id = guild_id and leader_id = auth.uid())
);
