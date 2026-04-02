-- Run this in Supabase SQL Editor
-- Creates source storage + row-level security policies

create extension if not exists "pgcrypto";

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled source',
  source_url text not null,
  source_type text not null default 'web',
  platform text not null default 'web',
  selected_text text,
  content text,
  metadata jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sources_user_id_created_at_idx
  on public.sources (user_id, created_at desc);

create unique index if not exists sources_user_url_unique_idx
  on public.sources (user_id, source_url);

create or replace function public.set_sources_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sources_updated_at on public.sources;
create trigger trg_sources_updated_at
before update on public.sources
for each row execute function public.set_sources_updated_at();

alter table public.sources enable row level security;

drop policy if exists "sources_select_own" on public.sources;
create policy "sources_select_own"
on public.sources
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "sources_insert_own" on public.sources;
create policy "sources_insert_own"
on public.sources
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "sources_update_own" on public.sources;
create policy "sources_update_own"
on public.sources
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "sources_delete_own" on public.sources;
create policy "sources_delete_own"
on public.sources
for delete
to authenticated
using (auth.uid() = user_id);

