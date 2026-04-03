-- Notebook list: favorite flag + tags on collections (folders).

alter table public.folders
  add column if not exists is_favorite boolean not null default false;

alter table public.folders
  add column if not exists tags text[] not null default '{}'::text[];

create index if not exists folders_user_favorite_idx
  on public.folders (user_id, is_favorite)
  where is_favorite = true;
