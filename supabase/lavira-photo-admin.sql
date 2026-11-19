-- Run in the Supabase SQL Editor as project owner.
-- Only users explicitly allowlisted by owner can manage photos.
create table if not exists public.lavira_photo_editors (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.lavira_photo_editors enable row level security;
revoke all on public.lavira_photo_editors from anon, authenticated;
grant select on public.lavira_photo_editors to authenticated;
drop policy if exists "editors read own membership" on public.lavira_photo_editors;
create policy "editors read own membership" on public.lavira_photo_editors
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.lavira_gallery_photos (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('collections','lookbook','products')),
  title text not null check (char_length(title) between 1 and 100),
  storage_path text not null unique,
  uploaded_by uuid not null default auth.uid() references auth.users(id),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint lavira_editor_path check (storage_path like uploaded_by::text || '/%')
);
create index if not exists lavira_gallery_public_idx
on public.lavira_gallery_photos(category, created_at desc) where published;
alter table public.lavira_gallery_photos enable row level security;
revoke all on public.lavira_gallery_photos from anon, authenticated;
grant select on public.lavira_gallery_photos to anon, authenticated;
grant insert(category,title,storage_path,uploaded_by,published) on public.lavira_gallery_photos to authenticated;
grant update(category,title,published) on public.lavira_gallery_photos to authenticated;
grant delete on public.lavira_gallery_photos to authenticated;

drop policy if exists "public views published photos" on public.lavira_gallery_photos;
create policy "public views published photos" on public.lavira_gallery_photos
  for select to anon, authenticated using (
    published or (uploaded_by = (select auth.uid()) and exists (
      select 1 from public.lavira_photo_editors e where e.user_id = (select auth.uid())
    ))
  );
drop policy if exists "approved editors insert own photos" on public.lavira_gallery_photos;
create policy "approved editors insert own photos" on public.lavira_gallery_photos
  for insert to authenticated with check (
    uploaded_by = (select auth.uid()) and exists (
      select 1 from public.lavira_photo_editors e where e.user_id = (select auth.uid())
    )
  );
drop policy if exists "approved editors update own photos" on public.lavira_gallery_photos;
create policy "approved editors update own photos" on public.lavira_gallery_photos
  for update to authenticated using (
    uploaded_by = (select auth.uid()) and exists (
      select 1 from public.lavira_photo_editors e where e.user_id = (select auth.uid())
    )
  ) with check (
    uploaded_by = (select auth.uid()) and exists (
      select 1 from public.lavira_photo_editors e where e.user_id = (select auth.uid())
    )
  );
drop policy if exists "approved editors delete own photos" on public.lavira_gallery_photos;
create policy "approved editors delete own photos" on public.lavira_gallery_photos
  for delete to authenticated using (
    uploaded_by = (select auth.uid()) and exists (
      select 1 from public.lavira_photo_editors e where e.user_id = (select auth.uid())
    )
  );

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('lavira-gallery','lavira-gallery',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880,
allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "lavira editors upload own images" on storage.objects;
create policy "lavira editors upload own images" on storage.objects
 for insert to authenticated with check (
   bucket_id='lavira-gallery'
   and (storage.foldername(name))[1] = (select auth.uid())::text
   and exists (select 1 from public.lavira_photo_editors e where e.user_id=(select auth.uid()))
 );
drop policy if exists "lavira editors list their images" on storage.objects;
create policy "lavira editors list their images" on storage.objects
 for select to authenticated using (
   bucket_id='lavira-gallery'
   and (storage.foldername(name))[1] = (select auth.uid())::text
   and exists (select 1 from public.lavira_photo_editors e where e.user_id=(select auth.uid()))
 );
drop policy if exists "lavira editors delete own images" on storage.objects;
create policy "lavira editors delete own images" on storage.objects
 for delete to authenticated using (
   bucket_id='lavira-gallery'
   and (storage.foldername(name))[1] = (select auth.uid())::text
   and exists (select 1 from public.lavira_photo_editors e where e.user_id=(select auth.uid()))
 );

-- After creating a user in Authentication > Users, OWNER runs:
-- insert into public.lavira_photo_editors(user_id) values ('USER_UUID_HERE');
-- Never add the client as a GitHub or Supabase project collaborator.
-- Revoke by deleting their row. Public bucket URLs are inherently public
-- when known, even if the associated gallery row is unpublished.
