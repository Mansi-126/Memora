-- Remove content_templates (notebook/source/note template UI was retired).

drop table if exists public.content_templates cascade;
