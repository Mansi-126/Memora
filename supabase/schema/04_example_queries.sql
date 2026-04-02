-- =============================================================================
-- Memora — example SQL (reference only; app uses Supabase JS with user session)
-- In SQL Editor without a user JWT, RLS blocks rows unless you use service role.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Inspect policies
-- -----------------------------------------------------------------------------
-- select schemaname, tablename, policyname, cmd, roles::text, qual, with_check
-- from pg_policies
-- where tablename in ('sources', 'folders')
-- order by tablename, cmd, policyname;

-- -----------------------------------------------------------------------------
-- Collections (folders + items in a collection)
-- -----------------------------------------------------------------------------
-- All collections for the current user:
--   select * from public.folders order by name asc;

-- Sources inside one collection (replace :folder_id):
--   select * from public.sources
--   where folder_id = '00000000-0000-0000-0000-000000000000'
--   order by created_at desc;

-- Count items per collection:
--   select f.id, f.name, count(s.id) as item_count
--   from public.folders f
--   left join public.sources s on s.folder_id = f.id
--   group by f.id, f.name
--   order by f.name;

-- -----------------------------------------------------------------------------
-- Artifacts (subset of sources; same table, same RLS)
-- -----------------------------------------------------------------------------
--   select * from public.sources
--   where source_type = 'artifact'
--   order by created_at desc;

-- -----------------------------------------------------------------------------
-- Favorites (starred sources; same table, same RLS)
-- -----------------------------------------------------------------------------
--   select * from public.sources
--   where is_favorite = true
--   order by created_at desc;

-- -----------------------------------------------------------------------------
-- All sources (default Sources page — optional filters in app)
-- -----------------------------------------------------------------------------
--   select * from public.sources order by created_at desc;

-- -----------------------------------------------------------------------------
-- Join: sources with folder name (still only your rows)
-- -----------------------------------------------------------------------------
-- select s.id, s.title, s.source_url, s.source_type, f.name as folder_name
-- from public.sources s
-- left join public.folders f on f.id = s.folder_id
-- order by s.created_at desc;

-- -----------------------------------------------------------------------------
-- Admin / maintenance (service role or postgres — bypasses RLS)
-- -----------------------------------------------------------------------------
-- vacuum analyze public.sources;
-- vacuum analyze public.folders;
