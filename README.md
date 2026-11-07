# HOUSE OF LAVIRA — V3 Signature Edition

A new six-page editorial fashion website with cream and gold styling and your supplied original logo. Responsive static HTML/CSS/JavaScript, with self-hosted optimized images (no frameworks or build step required).

## Pages

- `index.html` — Home
- `about.html` — Our Story
- `collections.html` — Collections, with working collection filters
- `shop.html` — Shop the Edit, with working search, category filters, sorting, saved looks and quick-view dialogs
- `lookbook.html` — Visual lookbook, with full-screen lightbox
- `contact.html` — Phone, WhatsApp, email enquiry and Google map

## Brand and contacts

- Brand: HOUSE OF LAVIRA; tagline: **Wear your confidence, live in your comfort**
- Theme: warm cream, champagne gold and charcoal
- Phone 1: +91 95446 75067
- Phone 2: +91 97446 75067
- Email: houseoflavira@gmail.com
- General location: Kerala, India

## How to edit

- Update `assets/site.js` → `LAVIRA_MAP_QUERY` with your actual shop address or `latitude,longitude`. Both map and direction link use it.
- Edit CSS colors in `assets/style.css` in the `:root` block.
- For live product imagery, replace the `.webp` images in `assets/` with photography of your actual stock and update product names/descriptions in the HTML and `LOOKS` object in `assets/site.js`.
- Edit the contact phone, WhatsApp and email directly in the HTML pages and `assets/site.js` if they change.
- Load `index.html` in a browser, or upload this folder to a static website host. Keep folder structure unchanged. Google Fonts and map require an internet connection.

## Important publishing notes

- The included garment imagery is **AI-assisted editorial concept photography**. It is not certified as photography of actual HOUSE OF LAVIRA inventory.
- The sample product names are concepts. No real stock levels, prices, orders, checkout, payment gateway, shipping promises or marketplace links have been fabricated.
- Product enquiry opens WhatsApp. The contact form composes a `mailto:` message in a visitor's email app; no backend sends or saves messages.
- Replace photos with your own product images and confirm content before launching a store.

The original logo is preserved in the `assets/lavira-logo.webp` crop, derived from the file you uploaded.

## V4 — Confirmed client revisions

- Readable heading font **Libre Baskerville** and UI/body font **Inter**, both loaded via Google Fonts.
- Location copy and placeholder map changed to **Kerala, India**, with no specific store address claimed.
- Footer years **2026–2027**, credit **Designed & Developed by MAX EFEX**.
- **Amazon, Flipkart, IndiaMART** marketplace cards appear on Home and Shop.
- **Instagram, Threads, Facebook, YouTube** appear in every page's footer under House of Lavira.

### IMPORTANT: Activate the marketplace and social links

Open `assets/site.js` and find `LAVIRA_ACCOUNT_LINKS` near the top. Paste the real House of Lavira account/profile/store URL in each quoted field. Example: `instagram: 'https://www.instagram.com/YOUR_ACTUAL_ACCOUNT/'`. The link automatically becomes clickable and opens in a new tab. Leaving it blank displays **Coming soon**; no unofficial or guessed accounts are linked.

### Map later

The embedded map currently searches **Kerala, India** only. Edit `LAVIRA_MAP_QUERY` in `assets/site.js` once the exact store address is approved.
