# HOUSE OF LAVIRA — Photo-only client admin

## Status
Code is installed, but uploading is intentionally DISABLED until the owner configures Supabase.
The original static website photographs are retained. Published uploads appear in separate
"Latest from Lavira" sections of Collections, Lookbook, and Shop the Edit.

## Owner-only setup
1. Create a Supabase project at https://supabase.com/dashboard under YOUR account.
2. In SQL Editor run the entire file supabase/lavira-photo-admin.sql. This creates:
   - three-category metadata table and editor allowlist, enforced through Row Level Security;
   - 5 MB JPEG/PNG/WebP public image bucket, with authenticated allowlisted-user upload rules.
3. In Authentication > Providers > Email, turn OFF public email signup. Enable a secure
   email confirmation/recovery process. In Authentication > Users, create/invite ONE client
   email as an auth user. Do not invite the client into your Supabase organization.
4. Copy the created user's UUID from Authentication > Users. In SQL Editor (OWNER ONLY):
     insert into public.lavira_photo_editors (user_id) values ('ACTUAL_USER_UUID');
   You may add another editor later with the same owner-only SQL statement.
5. Open assets/lavira-supabase-config.js. Paste ONLY Project URL and public
   publishable/anon key. Both are safe browser-facing values WITH the SQL policies in force.
   Never paste service_role, secret, or database credentials into this GitHub repo.
6. Deploy and visit https://houseoflavira.com/admin/ . Test upload / publish / unpublish
   with the approved editor account, and test that an unapproved account cannot upload.
   Confirm live galleries on /collections.html, /lookbook.html, /shop.html.
7. Optional: add the admin URL as a bookmark for client. DO NOT provide GitHub or Supabase
   dashboard login. Strong password / MFA options and identity management remain owner's job.

## Permissions and known limitations
- Editor can upload, view, publish/unpublish, and delete ONLY their own photos (3 categories).
- Editor cannot modify site code, grant new editors, view private credentials, or replace site layout.
- Other unauthorised visitors see only published metadata in the database.
- Storage bucket is public for live website photo URLs: anyone who obtains the exact file URL
  can view that file, including an unpublished file. Do not upload confidential images.
- The panel is browser-side; do not rely on hiding buttons. SQL RLS enforces permissions.
- No cloud backend is supplied until owner sets up Supabase and the editor's account.
- Uploaded photos supplement existing static photographs. Replacing original page images
  with client-controlled content would require a separate, deliberate editorial decision.
- Image filenames are random UUIDs in per-user paths; uploads max 5MB.
- A client can still inspect PUBLIC website HTML/source in any browser, as any visitor can.
  They cannot edit the repo or deploy code through this photo-only login.
