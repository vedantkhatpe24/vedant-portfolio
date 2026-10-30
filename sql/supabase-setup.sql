-- Run this entire script in Supabase > SQL Editor.
-- Public visitors can read only published projects. Add/edit projects from Supabase Table Editor.

create table if not exists public.portfolio_projects (
  id bigint generated always as identity primary key,
  title text not null,
  category text not null check (category in ('editing', 'cinematography', 'graphic-design', 'photography')),
  description text,
  thumbnail_url text,
  media_url text,
  media_type text not null default 'video' check (media_type in ('video', 'image')),
  client_name text,
  year text,
  featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.portfolio_projects enable row level security;

-- Remove broad table permissions, then grant read-only access to website visitors.
revoke all on table public.portfolio_projects from anon, authenticated;
grant select on table public.portfolio_projects to anon, authenticated;

drop policy if exists "Public can read published portfolio projects" on public.portfolio_projects;
create policy "Public can read published portfolio projects"
on public.portfolio_projects
for select
to anon, authenticated
using (is_published = true);

-- Optional example row. Replace the placeholder URLs before publishing.
-- insert into public.portfolio_projects
--   (title, category, description, thumbnail_url, media_url, media_type, client_name, year, is_published, sort_order)
-- values
--   ('Podcast Episode 01', 'editing', 'Podcast edit and post-production.',
--    'https://your-domain.com/podcast-cover.jpg', 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
--    'video', 'Podcast / YouTube', '2026', true, 1);
