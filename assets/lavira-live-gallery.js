import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const config=window.LAVIRA_SUPABASE||{};
if(config.url && config.publishableKey){
 const map={collections:'collections',lookbook:'lookbook',shop:'products'};
 const category=map[document.body.dataset.page];
 const target=document.getElementById('lavira-live-gallery');
 if(category && target){
   const client=createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
   const {data,error}=await client.from('lavira_gallery_photos').select('title,storage_path').eq('category',category).eq('published',true).order('created_at',{ascending:false}).limit(30);
   if(!error && data?.length){
     const grid=target.querySelector('.lavira-live-grid');
     for(const photo of data){
       const image= document.createElement('img');
       image.src=client.storage.from('lavira-gallery').getPublicUrl(photo.storage_path).data.publicUrl;
       image.loading='lazy';image.decoding='async';image.alt=photo.title;
       const tile=document.createElement('figure');tile.append(image);
       const caption=document.createElement('figcaption');caption.textContent=photo.title;tile.append(caption);grid.append(tile);
     }
     target.hidden=false;
   }
 }
}
