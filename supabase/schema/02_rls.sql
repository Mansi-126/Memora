-- =============================================================================
-- Memora — row level security for public.folders and public.sources
-- Run after: 01_tables.sql   Run before: 03_grants.sql
-- Role: authenticated (JWT from Supabase Auth). anon has no policies here.
-- =============================================================================

alter table public.folders enable row level security;
alter table public.folders force row level security;

alter table public.sources enable row level security;
alter table public.sources force row level security;

-- -----------------------------------------------------------------------------
-- public.folders — one user per row (user_id = auth.uid())
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- public.sources — own rows only; folder_id must be yours or null
-- -----------------------------------------------------------------------------
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
