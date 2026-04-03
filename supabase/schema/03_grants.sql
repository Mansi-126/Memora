-- =============================================================================
-- Memora — privileges for API access via Supabase (authenticated JWT)
-- Run after: 01_tables.sql, 02_rls.sql
-- service_role bypasses RLS (dashboard / edge with service key only — not the app).
-- =============================================================================

revoke all on public.folders from public;
revoke all on public.sources from public;
revoke all on public.prompt_folders from public;
revoke all on public.prompts from public;

grant select, insert, update, delete on public.folders to authenticated;
grant select, insert, update, delete on public.sources to authenticated;
grant select, insert, update, delete on public.prompt_folders to authenticated;
grant select, insert, update, delete on public.prompts to authenticated;

-- Sequences: not used for uuid PKs; omit.
