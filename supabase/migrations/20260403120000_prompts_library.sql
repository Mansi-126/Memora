-- Prompts library: user-defined prompt templates + optional folders (separate from source folders).

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

alter table public.prompt_folders enable row level security;
alter table public.prompt_folders force row level security;

alter table public.prompts enable row level security;
alter table public.prompts force row level security;

drop policy if exists "prompt_folders_select_own" on public.prompt_folders;
create policy "prompt_folders_select_own"
on public.prompt_folders for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "prompt_folders_insert_own" on public.prompt_folders;
create policy "prompt_folders_insert_own"
on public.prompt_folders for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "prompt_folders_update_own" on public.prompt_folders;
create policy "prompt_folders_update_own"
on public.prompt_folders for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "prompt_folders_delete_own" on public.prompt_folders;
create policy "prompt_folders_delete_own"
on public.prompt_folders for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "prompts_select_own" on public.prompts;
create policy "prompts_select_own"
on public.prompts for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "prompts_insert_own" on public.prompts;
create policy "prompts_insert_own"
on public.prompts for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (
    folder_id is null
    or exists (
      select 1 from public.prompt_folders pf
      where pf.id = folder_id and pf.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "prompts_update_own" on public.prompts;
create policy "prompts_update_own"
on public.prompts for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and (
    folder_id is null
    or exists (
      select 1 from public.prompt_folders pf
      where pf.id = folder_id and pf.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "prompts_delete_own" on public.prompts;
create policy "prompts_delete_own"
on public.prompts for delete to authenticated
using (user_id = (select auth.uid()));

revoke all on public.prompt_folders from public;
revoke all on public.prompts from public;
grant select, insert, update, delete on public.prompt_folders to authenticated;
grant select, insert, update, delete on public.prompts to authenticated;
