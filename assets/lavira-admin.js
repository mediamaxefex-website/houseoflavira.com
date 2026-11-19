import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const config = window.LAVIRA_SUPABASE || {};
const $ = id => document.getElementById(id);
const message = msg => { $('message').textContent = msg; };
const configured = Boolean(config.url && config.publishableKey);
const client = configured ? createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true }}) : null;
let signedInUser = null;
const approved = async () => {
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data, error: membershipError } = await client.from('lavira_photo_editors').select('user_id').eq('user_id',user.id).maybeSingle();
  if (membershipError || !data) return null;
  return user;
};
async function refreshAuth() {
  $('setup').hidden = configured; $('login').hidden = true; $('dashboard').hidden = true;
  if (!configured) return;
  signedInUser = await approved();
  if (!signedInUser) { $('login').hidden = false; return; }
  $('identity').textContent = signedInUser.email || 'Approved editor';
  $('dashboard').hidden = false;
  await listPhotos();
}
async function listPhotos() {
  const {data,error} = await client.from('lavira_gallery_photos')
    .select('id,title,category,storage_path,published,created_at')
    .eq('uploaded_by', signedInUser.id).order('created_at',{ascending:false}).limit(100);
  if(error){message(error.message);return;}
  const target = $('photo-list'); target.replaceChildren();
  if(!data.length){ const p=document.createElement('p');p.textContent='No photos uploaded yet.';target.append(p);return;}
  for(const photo of data){
    const card=document.createElement('article');card.className='photo-card';
    const img=document.createElement('img'); img.alt=photo.title; img.loading='lazy';
    img.src=client.storage.from('lavira-gallery').getPublicUrl(photo.storage_path).data.publicUrl;
    const title=document.createElement('strong');title.textContent=photo.title;
    const details=document.createElement('p');details.textContent=photo.category+' · '+(photo.published?'Published':'Unpublished');
    const actions=document.createElement('div');actions.className='actions';
    const toggle=document.createElement('button');toggle.type='button';toggle.textContent=photo.published?'Unpublish':'Publish';
    toggle.addEventListener('click',async()=>{toggle.disabled=true;const {error}=await client.from('lavira_gallery_photos').update({published:!photo.published}).eq('id',photo.id);if(error)message(error.message);else await listPhotos();toggle.disabled=false;});
    const del=document.createElement('button');del.type='button';del.className='secondary';del.textContent='Delete';
    del.addEventListener('click',async()=>{
      if(!confirm('Delete this photo permanently?'))return;
      del.disabled=true;
      // Hide the image before storage cleanup, so a failed storage operation
      // does not leave a published gallery entry pointing to a missing image.
      const {error: hideError}=await client.from('lavira_gallery_photos').update({published:false}).eq('id',photo.id);
      if(hideError){message(hideError.message);del.disabled=false;return;}
      const {error: storageError}=await client.storage.from('lavira-gallery').remove([photo.storage_path]);
      if(storageError){message('Photo unpublished, but storage deletion failed: '+storageError.message);await listPhotos();return;}
      const {error: deleteError}=await client.from('lavira_gallery_photos').delete().eq('id',photo.id);
      if(deleteError)message(deleteError.message);
      await listPhotos();
    });
    actions.append(toggle,del);card.append(img,title,details,actions);target.append(card);
  }
}
$('login-form').addEventListener('submit',async event=>{
  event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;message('');
  const fields=new FormData(event.target);
  const {error}=await client.auth.signInWithPassword({email:String(fields.get('email')),password:String(fields.get('password'))});
  if(error){message('Login failed. Check your credentials.');}else{await refreshAuth();if(!signedInUser){await client.auth.signOut();message('This account is not approved for photo management.');}}
  button.disabled=false;
});
$('upload-form').addEventListener('submit',async event=>{
  event.preventDefault();const button=$('upload-button');button.disabled=true;message('');
  try{
    const fields=new FormData(event.target), file=fields.get('photo'), category=String(fields.get('category'));
    const title=String(fields.get('title')).trim();
    if(!signedInUser || !['collections','lookbook','products'].includes(category))throw Error('Access denied.');
    if(!title || title.length>100)throw Error('Enter a photo title (max 100 characters).');
    if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024||file.size<1)throw Error('Use a JPG, PNG or WebP file under 5 MB.');
    const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[file.type];
    const path=signedInUser.id+'/'+crypto.randomUUID()+'.'+ext;
    const {error: uploadError}=await client.storage.from('lavira-gallery').upload(path,file,{contentType:file.type,upsert:false});
    if(uploadError)throw uploadError;
    const {error: rowError}=await client.from('lavira_gallery_photos').insert({
      category,title,storage_path:path,uploaded_by:signedInUser.id,published:fields.get('published')==='on'
    });
    if(rowError){await client.storage.from('lavira-gallery').remove([path]);throw rowError;}
    event.target.reset();message('Photo uploaded successfully.');await listPhotos();
  }catch(error){message(error.message||'Upload failed.');}
  finally{button.disabled=false;}
});
$('signout').addEventListener('click',async()=>{await client.auth.signOut();signedInUser=null;message('Signed out.');await refreshAuth();});
$('refresh').addEventListener('click',listPhotos);
if(!configured){$('setup').hidden=false;}else{refreshAuth().catch(()=>message('Could not connect to the photo service.'));}
