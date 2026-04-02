-- Incremental migration (run AFTER initial sources schema is already applied)
-- Safe to run multiple times.

create extension if not exists "pgcrypto";

-- 1) Create folders table
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

-- 2) Add folder_id to sources (if missing)
alter table public.sources
  add column if not exists folder_id uuid references public.folders(id) on delete set null;

create index if not exists sources_user_folder_idx
  on public.sources (user_id, folder_id);

-- 3) Trigger for folders.updated_at
create or replace function public.set_folders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_folders_updated_at on public.folders;
create trigger trg_folders_updated_at
before update on public.folders
for each row execute function public.set_folders_updated_at();

-- 4) RLS for folders
alter table public.folders enable row level security;

drop policy if exists "folders_select_own" on public.folders;
create policy "folders_select_own"
on public.folders
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "folders_insert_own" on public.folders;
create policy "folders_insert_own"
on public.folders
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "folders_update_own" on public.folders;
create policy "folders_update_own"
on public.folders
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "folders_delete_own" on public.folders;
create policy "folders_delete_own"
on public.folders
for delete
to authenticated
using (auth.uid() = user_id);

