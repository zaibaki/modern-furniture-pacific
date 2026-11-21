# Modern Furniture Pacific — premium rebuild

Premium Next.js rebuild of https://www.modernfurniturepacificltd.com/, based on the orange
“Make you feel luxury” template Richie shared (Furniture_Website_Design.png).

## What was fetched (21 Nov 2026, from the live Shopify store)

- Routes: sitemap — 35 products, 9 collections, 3 pages
  (`/`, `/pages/contact`, `/pages/contact-us`, `/pages/about-us`, plus
  `/collections/shop`, `living-room`, `bedroom` [Dining], `bedroom-1` [Bedroom],
  `new-arrivals`, `best-sellers`, `tables`, `dressing-table`, `frontpage`)
- Products: 35 via `products.json`, 23 in stock / 12 out of stock, KSh 6,000–260,000
- Images: 183 product images (`images/web/`, 1024px, jpg/webp as served) +
  site files in `images/site/` (header, Livingroom, mf22, mf237, chair, logo).
  Note: every product photo has the logo + “CALL / WHATSAPP 0716 335555”
  burned into the centre of the image on the original site. That is the
  single most non-premium element and cannot be fixed by a redesign alone —
  the photos need re-shooting / clean exports.
- Raw data: `data/products-raw.json`, `data/collections-raw.json`,
  `data/collection-membership.json`, `data/site-images.json`

## Data baked into the site

- `site/src/data/products.json` — cleaned from the raw feed (script: `build-data.py`).
  Titles title-cased, `POCKER` → `POCKET`. “Austic” kept as listed.
  Prices, variants, availability, collections, isNew / isBestSeller, image paths.
- `site/src/lib/data.ts` — typed accessors, KES formatting, WhatsApp links.

## The site (`site/` — Next.js 16, App Router, Tailwind 4)

- `/` — hero (template layout), Our Collections grid, New arrivals, Best sellers, About, showrooms
- **v3 homepage (21 Nov 2026, after the watermark audit):** the homepage is now
  clean and visual only. Watermark audit of all 183 product photos: every one
  carries the logo stamp (centre on indoor shots, small corner on outdoor
  shots); only the 4 site banner images (`header.png`, `chair.jpg`, `mf22.jpg`,
  `mf237.jpg`) are truly stamp-free. For 8 outdoor products the corner stamp
  was cropped off (bottom 22%) into `site/public/images/clean/` (1600px) and
  the homepage uses ONLY those 8 + the 4 site images (`displayImage()` in
  `site/src/lib/data.ts`). Featured pieces are in-stock clean ones only
  (Benin, Nova, Urban Nest, Juventus, Modena, Retractable). No search, stats,
  stock counts or detail text on the homepage — all details live on the
  product detail pages. Each section ends in one primary orange action button.
  Note: outdoor clean shots still show the shopfront in the background; and
  the shop / detail pages still show the original watermarked photos for the
  other 27 products until Murage supplies clean re-shoots.
- `/shop` — all 35 products, search + category / collection / in-stock filters (server-side, `?q=&category=&badge=&instock=`)
- `/products/[handle]` — 35 static pages, gallery, variants, WhatsApp order, call
- `/collections` — real collections only
- `/about`, `/contact` — real Kenyan showrooms, hours, phone, email

Template lorem ipsum, fake stats (1.3M+ reviews etc.) and the template’s US
address were NOT carried over. Stats on the new home page are real:
35 products, 3 showrooms, 7-day return policy.

## Fixes vs the original (baked in)

- “Dinning” → Dining; Dining no longer links to a `/bedroom` slug
- About / Inspiration no longer both link to Living Room — real About page exists
- Footer email fixed: `info@modernfurniturepacificltd.com` (original footer spells it `mordern…`)
- No dead “Read all reviews” / trust-strip links; no fake urgency widgets
- Sold-out state is honest per variant; no “112 customers viewing” widgets
- “Dressing table” collection on the original actually contains beds, so it is
  not presented as a dressing-table category here (noted on /collections)

## Run it

```bash
cd site
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start
```
