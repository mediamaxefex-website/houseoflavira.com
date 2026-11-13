'use strict';

// Edit this value to update the exact location in the Contact page map and directions.
const LAVIRA_MAP_QUERY = 'Kerala, India';
// Add official store/social URLs here when ready; blank values show “Coming soon”.
const LAVIRA_ACCOUNT_LINKS = {
  amazon: '',
  flipkart: '',
  indiamart: '',
  instagram: '',
  threads: '',
  facebook: '',
  youtube: ''
};
const LAVIRA_EMAIL = 'info@houseoflavira.com';
const LAVIRA_WA = '919544675067';

const LOOKS = {
  ivory: { title: 'Ivory Reverie', img: 'ivory', desc: 'Ivory embroidered draping with an understated, elegant finish.' },
  olive: { title: 'The Olive Edit', img: 'olive', desc: 'A richly textured botanical green statement with soft gold accents.' },
  mauve: { title: 'Mauve Muse', img: 'mauve', desc: 'Muted mauve and delicate detailing for an occasion-led look.' },
  emerald: { title: 'Emerald Evening', img: 'emerald', desc: 'Deep emerald tones with refined heritage-inspired detailing.' },
  blush: { title: 'Blush Poetry', img: 'blush', desc: 'Gentle blush styling for effortless daytime elegance.' },
  champagne: { title: 'Champagne Light', img: 'campaign', desc: 'A pale champagne look with a subtle golden glow.' }
};

let memorySaved = [];
const safeSaved = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('lavira.v3.saved') || '[]');
    return Array.isArray(saved) ? saved.filter(item => typeof item === 'string') : memorySaved;
  } catch {
    return memorySaved;
  }
};
const writeSaved = saved => {
  memorySaved = [...saved];
  try { localStorage.setItem('lavira.v3.saved', JSON.stringify(saved)); } catch {}
};
function toast(message) {
  const element = document.querySelector('#toast');
  if (!element) return;
  element.textContent = message;
  element.style.display = 'block';
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => { element.style.display = 'none'; }, 3000);
}
function initAccountLinks() {
  document.querySelectorAll('[data-account]').forEach(link => {
    const raw = LAVIRA_ACCOUNT_LINKS[link.dataset.account] || '';
    let valid = '';
    try {
      const url = new URL(raw);
      if (url.protocol === 'https:' || url.protocol === 'http:') valid = url.href;
    } catch {}
    const status = link.querySelector('.account-status');
    if (valid) {
      link.href = valid;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      if (status) status.textContent = 'Visit ↗';
    } else {
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.setAttribute('aria-disabled', 'true');
      if (status) status.textContent = 'Coming soon';
    }
  });
}
function updateHearts() {
  const saved = safeSaved();
  document.querySelectorAll('[data-heart]').forEach(button => {
    const isSaved = saved.includes(button.dataset.heart);
    button.setAttribute('aria-pressed', String(isSaved));
    button.textContent = isSaved ? '♥' : '♡';
  });
  const count = document.querySelector('#fav-count');
  if (count) count.textContent = String(saved.length);
}
function initMenu() {
  const button = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }
  });
}
function initCollectionFilters() {
  const filters = document.querySelectorAll('[data-collection-filter]');
  if (!filters.length) return;
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('#collection-grid > [data-group]').forEach(card => {
      card.hidden = button.dataset.collectionFilter !== 'all' && card.dataset.group !== button.dataset.collectionFilter;
    });
  }));
}
function applyShop() {
  const grid = document.querySelector('#shop-grid');
  if (!grid) return;
  const query = (document.querySelector('#shop-search')?.value || '').trim().toLowerCase();
  const category = document.querySelector('input[name="category"]:checked')?.value || 'all';
  const savedOnly = Boolean(document.querySelector('#saved-only')?.checked);
  const saved = safeSaved();
  const sort = document.querySelector('#shop-sort')?.value || 'featured';
  const cards = Array.from(grid.querySelectorAll('.product'));
  cards.sort((a, b) => sort === 'az'
    ? a.dataset.name.localeCompare(b.dataset.name)
    : sort === 'za' ? b.dataset.name.localeCompare(a.dataset.name)
      : Number(a.dataset.index) - Number(b.dataset.index));
  cards.forEach(card => grid.appendChild(card));
  let visible = 0;
  cards.forEach(card => {
    const show = (category === 'all' || card.dataset.category === category)
      && (card.dataset.name || '').includes(query)
      && (!savedOnly || saved.includes(card.dataset.id));
    card.hidden = !show;
    if (show) visible += 1;
  });
  const count = document.querySelector('#result-count');
  if (count) count.textContent = `${visible} ${visible === 1 ? 'look' : 'looks'}`;
  const empty = document.querySelector('#no-results');
  if (empty) empty.hidden = visible > 0;
}
function initShop() {
  if (!document.querySelector('#shop-grid')) return;
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  if (category && ['all', 'everyday', 'classics', 'occasion'].includes(category)) {
    const input = document.querySelector(`input[name="category"][value="${category}"]`);
    if (input) input.checked = true;
  }
  if (params.get('favourites') === '1') {
    const checkbox = document.querySelector('#saved-only');
    if (checkbox) checkbox.checked = true;
  }
  document.querySelectorAll('input[name="category"], #saved-only, #shop-sort').forEach(element => element.addEventListener('change', applyShop));
  document.querySelector('#shop-search')?.addEventListener('input', applyShop);
  document.querySelector('#clear-filters')?.addEventListener('click', () => {
    const all = document.querySelector('input[name="category"][value="all"]');
    if (all) all.checked = true;
    const saved = document.querySelector('#saved-only');
    if (saved) saved.checked = false;
    const sort = document.querySelector('#shop-sort');
    if (sort) sort.value = 'featured';
    const search = document.querySelector('#shop-search');
    if (search) search.value = '';
    try { history.replaceState(null, '', window.location.pathname); } catch {}
    applyShop();
  });
  applyShop();
}
function initProductActions() {
  document.querySelectorAll('[data-heart]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.heart;
    const saved = safeSaved();
    const adding = !saved.includes(id);
    writeSaved(adding ? [...saved, id] : saved.filter(item => item !== id));
    updateHearts();
    applyShop();
    toast(adding ? 'Added to your saved looks' : 'Removed from saved looks');
  }));
  const dialog = document.querySelector('#preview-dialog');
  document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
    if (!dialog) return;
    const look = LOOKS[button.dataset.preview];
    if (!look) return;
    const image = document.querySelector('#dialog-image');
    if (image) { image.src = `assets/${look.img}.webp`; image.alt = `Editorial concept for ${look.title}`; }
    const title = document.querySelector('#dialog-title');
    if (title) title.textContent = look.title;
    const description = document.querySelector('#dialog-description');
    if (description) description.textContent = look.desc;
    const link = document.querySelector('#dialog-link');
    if (link) link.href = `https://wa.me/${LAVIRA_WA}?text=${encodeURIComponent(`Hello House of Lavira, please share availability, sizes and price for ${look.title}.`)}`;
    dialog.showModal();
  }));
  document.querySelector('#dialog-close')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}
function initLookbook() {
  const dialog = document.querySelector('#lightbox');
  if (!dialog) return;
  document.querySelectorAll('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.lightbox;
    const title = button.dataset.caption || 'Lavira editorial';
    const image = document.querySelector('#lightbox-image');
    if (image) { image.src = `assets/${name}.webp`; image.alt = title; }
    const caption = document.querySelector('#lightbox-caption');
    if (caption) caption.textContent = title;
    dialog.showModal();
  }));
  dialog.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}
function initContact() {
  const map = document.querySelector('#location-map');
  if (map) map.src = `https://maps.google.com/maps?q=${encodeURIComponent(LAVIRA_MAP_QUERY)}&output=embed`;
  const directions = document.querySelector('#map-directions');
  if (directions) directions.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LAVIRA_MAP_QUERY)}`;
  const form = document.querySelector('#contact-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const from = String(data.get('email') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const topic = String(data.get('topic') || 'General enquiry');
    const message = String(data.get('message') || '').trim();
    const subject = encodeURIComponent(`[Lavira Website] ${topic} — ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${from}\nPhone: ${phone}\nEnquiry type: ${topic}\n\n${message}`);
    window.location.href = `mailto:${LAVIRA_EMAIL}?subject=${subject}&body=${body}`;
    const status = document.querySelector('#form-status');
    if (status) status.textContent = 'Your email app should open with your message ready to send.';
  });
}
document.addEventListener('DOMContentLoaded', () => {
  initAccountLinks();
  initMenu();
  updateHearts();
  initCollectionFilters();
  initShop();
  initProductActions();
  initLookbook();
  initContact();
});
