-- =============================================================================
-- Memora — table definitions (Supabase PostgreSQL only; no local app database)
-- Run after: nothing. Run before: 02_rls.sql, 03_grants.sql
--
-- UI mapping (no extra tables):
--   Collections  → public.folders (+ sources where folder_id = folder.id)
--   Artifacts    → public.sources where source_type = 'artifact'
--   Favorites    → public.sources where is_favorite = true
--   Sources      → public.sources (all types / filters in the app)
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- public.folders — user-owned collections (referenced by sources.folder_id)
-- -----------------------------------------------------------------------------
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

alter table public.folders
  add column if not exists is_favorite boolean not null default false;

alter table public.folders
  add column if not exists tags text[] not null default '{}'::text[];

create index if not exists folders_user_favorite_idx
  on public.folders (user_id, is_favorite)
  where is_favorite = true;

-- -----------------------------------------------------------------------------
-- public.sources — bookmarks, artifacts, imports, etc.
-- -----------------------------------------------------------------------------
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

-- Legacy installs: ensure folder_id exists and references folders
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

-- -----------------------------------------------------------------------------
-- Triggers: updated_at
-- -----------------------------------------------------------------------------
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

-- Remove legacy trigger helpers if upgrading from older Memora SQL
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

-- -----------------------------------------------------------------------------
-- public.prompt_folders / public.prompts — saved prompt templates (Tools › Prompts)
-- -----------------------------------------------------------------------------
create table if not exists public.prompt_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists prompt_folders_user_id_idx on public.prompt_folders (user_id);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  folder_id uuid references public.prompt_folders (id) on delete set null,
  title text not null default 'Untitled prompt',
  body text not null default '',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompts_user_id_created_at_idx on public.prompts (user_id, created_at desc);
create index if not exists prompts_user_folder_idx on public.prompts (user_id, folder_id);

drop trigger if exists trg_prompt_folders_updated_at on public.prompt_folders;
create trigger trg_prompt_folders_updated_at
before update on public.prompt_folders
for each row execute function public.memora_set_updated_at();

drop trigger if exists trg_prompts_updated_at on public.prompts;
create trigger trg_prompts_updated_at
before update on public.prompts
for each row execute function public.memora_set_updated_at();
