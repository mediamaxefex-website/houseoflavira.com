'use strict';
// Edit this one value to update the exact location in the Contact page map and directions.
const LAVIRA_MAP_QUERY = 'Kerala, India';
// PASTE OFFICIAL STORE / SOCIAL PROFILE URLs BETWEEN THE QUOTES WHEN READY.
// Leave an empty string to show the visible "Coming soon" state (no broken links).
// Use complete https:// URLs. Do NOT enter generic marketplace homepages.
const LAVIRA_ACCOUNT_LINKS = {
  amazon: '',
  flipkart: '',
  indiamart: '',
  instagram: '',
  threads: '',
  facebook: '',
  youtube: ''
};
function initAccountLinks(){
  document.querySelectorAll('[data-account]').forEach(link=>{
    const raw=LAVIRA_ACCOUNT_LINKS[link.dataset.account] || '';
    let valid='';
    try{const url=new URL(raw);if(url.protocol==='https:' || url.protocol==='http:')valid=url.href}catch{}
    const status=link.querySelector('.account-status');
    if(valid){link.href=valid;link.target='_blank';link.rel='noopener noreferrer';link.removeAttribute('aria-disabled');if(status)status.textContent='Visit ↗'}
    else{link.removeAttribute('href');link.removeAttribute('target');link.setAttribute('aria-disabled','true');if(status)status.textContent='Coming soon'}
  });
}
const LAVIRA_EMAIL = 'houseoflavira@gmail.com';
const LAVIRA_WA = '919544675067';
const LOOKS = {
  ivory:{title:'Ivory Reverie',img:'ivory',desc:'Ivory embroidered draping with an understated, elegant finish.'},
  olive:{title:'The Olive Edit',img:'olive',desc:'A richly textured botanical green statement with soft gold accents.'},
  mauve:{title:'Mauve Muse',img:'mauve',desc:'Muted mauve and delicate detailing for an occasion-led look.'},
  emerald:{title:'Emerald Evening',img:'emerald',desc:'Deep emerald tones with refined heritage-inspired detailing.'},
  blush:{title:'Blush Poetry',img:'blush',desc:'Gentle blush styling for effortless daytime elegance.'},
  champagne:{title:'Champagne Light',img:'campaign',desc:'A pale champagne look with a subtle golden glow.'}
};
let memorySaved = [];
const safeSaved = () => { try {const v=JSON.parse(localStorage.getItem('lavira.v3.saved')||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):memorySaved}catch{return memorySaved} };
const writeSaved = v => {memorySaved=[...v];try{localStorage.setItem('lavira.v3.saved',JSON.stringify(v))}catch{} };
function toast(message){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.style.display='block';window.clearTimeout(toast.timer);toast.timer=window.setTimeout(()=>el.style.display='none',3000)}
function updateHearts(){const saved=safeSaved();document.querySelectorAll('[data-heart]').forEach(b=>{const on=saved.includes(b.dataset.heart);b.setAttribute('aria-pressed',String(on));b.textContent=on?'♥':'♡'});const count=document.querySelector('#fav-count');if(count)count.textContent=String(saved.length)}
function initMenu(){const btn=document.querySelector('#menu-toggle'),nav=document.querySelector('#site-nav');if(!btn||!nav)return;btn.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));btn.setAttribute('aria-label',open?'Close navigation':'Open navigation')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');btn.setAttribute('aria-expanded','false')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');btn.setAttribute('aria-expanded','false')}})}
function initCollectionFilters(){const filters=document.querySelectorAll('[data-collection-filter]');if(!filters.length)return;filters.forEach(b=>b.addEventListener('click',()=>{filters.forEach(x=>{const selected=x===b;x.classList.toggle('active',selected);x.setAttribute('aria-pressed',String(selected))});document.querySelectorAll('#collection-grid>[data-group]').forEach(card=>{card.hidden=b.dataset.collectionFilter!=='all'&&card.dataset.group!==b.dataset.collectionFilter})}))}
function applyShop(){const grid=document.querySelector('#shop-grid');if(!grid)return;const query=(document.querySelector('#shop-search')?.value||'').trim().toLowerCase();const category=document.querySelector('input[name="category"]:checked')?.value||'all';const savedOnly=document.querySelector('#saved-only')?.checked;const saved=safeSaved();const sort=document.querySelector('#shop-sort')?.value||'featured';const cards=Array.from(grid.querySelectorAll('.product'));cards.sort((a,b)=>sort==='az'?a.dataset.name.localeCompare(b.dataset.name):sort==='za'?b.dataset.name.localeCompare(a.dataset.name):Number(a.dataset.index)-Number(b.dataset.index));cards.forEach(c=>grid.appendChild(c));let visible=0;cards.forEach(card=>{const show=(category==='all'||card.dataset.category===category)&&card.dataset.name.includes(query)&&(!savedOnly||saved.includes(card.dataset.id));card.hidden=!show;if(show)visible++});const count=document.querySelector('#result-count');if(count)count.textContent=`${visible} ${visible===1?'look':'looks'}`;const empty=document.querySelector('#no-results');if(empty)empty.hidden=visible>0}
function initShop(){if(!document.querySelector('#shop-grid'))return;const q=new URLSearchParams(window.location.search);const cat=q.get('category');if(cat&&['all','everyday','classics','occasion'].includes(cat)){const input=document.querySelector(`input[name="category"][value="${cat}"]`);if(input)input.checked=true}if(q.get('favourites')==='1'){const box=document.querySelector('#saved-only');if(box)box.checked=true}document.querySelectorAll('input[name="category"],#saved-only,#shop-sort').forEach(el=>el.addEventListener('change',applyShop));document.querySelector('#shop-search')?.addEventListener('input',applyShop);document.querySelector('#clear-filters')?.addEventListener('click',()=>{document.querySelector('input[name="category"][value="all"]').checked=true;document.querySelector('#saved-only').checked=false;document.querySelector('#shop-sort').value='featured';document.querySelector('#shop-search').value='';try{history.replaceState(null,'',window.location.pathname||'shop.html')}catch{}applyShop()});applyShop()}
function initProductActions(){document.querySelectorAll('[data-heart]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.heart;let saved=safeSaved();const add=!saved.includes(id);saved=add?[...saved,id]:saved.filter(s=>s!==id);writeSaved(saved);updateHearts();applyShop();toast(add?'Added to your saved looks':'Removed from saved looks')}));const dialog=document.querySelector('#preview-dialog');document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>{if(!dialog)return;const look=LOOKS[b.dataset.preview];if(!look)return;document.querySelector('#dialog-image').src=`assets/${look.img}.webp`;document.querySelector('#dialog-image').alt=`Editorial concept for ${look.title}`;document.querySelector('#dialog-title').textContent=look.title;document.querySelector('#dialog-description').textContent=look.desc;document.querySelector('#dialog-link').href=`https://wa.me/${LAVIRA_WA}?text=${encodeURIComponent('Hello House of Lavira, please share availability, sizes and price for '+look.title+'.')}`;dialog.showModal()}));dialog?.querySelector('.dialog-close')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()})}
function initLookbook(){const dialog=document.querySelector('#lightbox');if(!dialog)return;document.querySelectorAll('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{const name=b.dataset.lightbox;const title=b.dataset.caption||'Lavira editorial';document.querySelector('#lightbox-image').src=`assets/${name}.webp`;document.querySelector('#lightbox-image').alt=title;document.querySelector('#lightbox-caption').textContent=title;dialog.showModal()}));dialog.querySelector('.lightbox-close')?.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()})}
function initContact(){const map=document.querySelector('#location-map');if(map)map.src=`https://maps.google.com/maps?q=${encodeURIComponent(LAVIRA_MAP_QUERY)}&output=embed`;const link=document.querySelector('#map-directions');if(link)link.href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LAVIRA_MAP_QUERY)}`;const form=document.querySelector('#contact-form');if(!form)return;form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);const name=String(d.get('name')||'').trim();const from=String(d.get('email')||'').trim();const phone=String(d.get('phone')||'').trim();const topic=String(d.get('topic')||'General enquiry');const msg=String(d.get('message')||'').trim();const subject=encodeURIComponent(`[Lavira Website] ${topic} — ${name}`);const body=encodeURIComponent(`Name: ${name}\nEmail: ${from}\nPhone: ${phone}\nEnquiry type: ${topic}\n\n${msg}`);window.location.href=`mailto:${LAVIRA_EMAIL}?subject=${subject}&body=${body}`;const status=document.querySelector('#form-status');if(status)status.textContent='Your email application should open with your message ready to send.'})}
document.addEventListener('DOMContentLoaded',()=>{initAccountLinks();initMenu();updateHearts();initCollectionFilters();initShop();initProductActions();initLookbook();initContact()});
