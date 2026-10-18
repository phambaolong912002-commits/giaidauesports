-- Run this script in Supabase Dashboard > SQL Editor.
-- Public visitors can read published news; only authenticated admins can manage news.

create or replace function public.is_news_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    lower(coalesce((select auth.jwt() ->> 'email'), '')) in (
      'admin@gmail.com',
      'phambaolong912002@gmail.com'
    )
    or coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
    );
$$;

revoke all on function public.is_news_admin() from public;
grant execute on function public.is_news_admin() to anon, authenticated;
      
alter table public.news enable row level security;

drop policy if exists "Published news is publicly readable" on public.news;
create policy "Published news is publicly readable"
on public.news
for select
to anon, authenticated
using (status = 'published' or (select public.is_news_admin()));

drop policy if exists "News read access boundary" on public.news;
create policy "News read access boundary"
on public.news
as restrictive
for select
to anon, authenticated
using (status = 'published' or (select public.is_news_admin()));

drop policy if exists "Admins can insert news" on public.news;
create policy "Admins can insert news"
on public.news
for insert
to authenticated
with check ((select public.is_news_admin()));

drop policy if exists "News insert access boundary" on public.news;
create policy "News insert access boundary"
on public.news
as restrictive
for insert
to authenticated
with check ((select public.is_news_admin()));

drop policy if exists "Admins can update news" on public.news;
create policy "Admins can update news"
on public.news
for update
to authenticated
using ((select public.is_news_admin()))
with check ((select public.is_news_admin()));

drop policy if exists "News update access boundary" on public.news;
create policy "News update access boundary"
on public.news
as restrictive
for update
to authenticated
using ((select public.is_news_admin()))
with check ((select public.is_news_admin()));

drop policy if exists "Admins can delete news" on public.news;
create policy "Admins can delete news"
on public.news
for delete
to authenticated
using ((select public.is_news_admin()));

drop policy if exists "News delete access boundary" on public.news;
create policy "News delete access boundary"
on public.news
as restrictive
for delete
to authenticated
using ((select public.is_news_admin()));

grant select on public.news to anon, authenticated;
grant insert, update, delete on public.news to authenticated;
