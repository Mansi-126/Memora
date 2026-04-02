-- Memora full schema: tables + RLS + grants (fresh project or reset).
-- Idempotent where possible. Combines supabase/schema/01–03.
-- UI: Collections = folders; Artifacts = sources where source_type='artifact';
--      Favorites = sources where is_favorite; Sources = all sources (filtered in app).

-- ========== 01_tables.sql ==========
create extension if not exists "pgcrypto";

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists folders_user_id_idx
  on public.folders (user_id);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled source',
  source_url text not null,
  source_type text not null default 'web',
  platform text not null default 'web',
  selected_text text,
  content text,
  metadata jsonb not null default '{}'::jsonb,
  folder_id uuid references public.folders (id) on delete set null,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sources
  add column if not exists folder_id uuid references public.folders (id) on delete set null;

create index if not exists sources_user_id_created_at_idx
  on public.sources (user_id, created_at desc);

create unique index if not exists sources_user_url_unique_idx
  on public.sources (user_id, source_url);

create index if not exists sources_user_folder_idx
  on public.sources (user_id, folder_id);

create index if not exists sources_user_type_idx
  on public.sources (user_id, source_type);

create index if not exists sources_user_favorite_idx
  on public.sources (user_id, is_favorite)
  where is_favorite = true;

create or replace function public.memora_set_updated_at()
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
for each row execute function public.memora_set_updated_at();

drop trigger if exists trg_sources_updated_at on public.sources;
create trigger trg_sources_updated_at
before update on public.sources
for each row execute function public.memora_set_updated_at();

drop function if exists public.set_folders_updated_at();
drop function if exists public.set_sources_updated_at();

comment on table public.folders is
  'Memora Collections: one row per user folder; sources.folder_id may reference id.';

comment on table public.sources is
  'Saved links and content: Sources (all), Artifacts (source_type=artifact), Favorites (is_favorite=true).';

comment on column public.sources.source_type is
  'Discriminator for UI, e.g. artifact, bookmark, web, manual. Artifacts page filters source_type = artifact.';

comment on column public.sources.is_favorite is
  'When true, row appears on Favorites; same RLS and table as other sources.';

comment on column public.sources.folder_id is
  'Optional collection membership; must reference public.folders owned by the same user (enforced in RLS).';

-- ========== 02_rls.sql ==========
alter table public.folders enable row level security;
alter table public.folders force row level security;

alter table public.sources enable row level security;
alter table public.sources force row level security;

drop policy if exists "folders_select_own" on public.folders;
create policy "folders_select_own"
on public.folders
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "folders_insert_own" on public.folders;
create policy "folders_insert_own"
on public.folders
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "folders_update_own" on public.folders;
create policy "folders_update_own"
on public.folders
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "folders_delete_own" on public.folders;
create policy "folders_delete_own"
on public.folders
for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "sources_select_own" on public.sources;
create policy "sources_select_own"
on public.sources
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "sources_insert_own" on public.sources;
create policy "sources_insert_own"
on public.sources
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    folder_id is null
    or exists (
      select 1
      from public.folders f
      where f.id = folder_id
        and f.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "sources_update_own" on public.sources;
create policy "sources_update_own"
on public.sources
for update
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and (
    folder_id is null
    or exists (
      select 1
      from public.folders f
      where f.id = folder_id
        and f.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "sources_delete_own" on public.sources;
create policy "sources_delete_own"
on public.sources
for delete
to authenticated
using (user_id = (select auth.uid()));

-- ========== 03_grants.sql ==========
revoke all on public.folders from public;
revoke all on public.sources from public;

grant select, insert, update, delete on public.folders to authenticated;
grant select, insert, update, delete on public.sources to authenticated;
