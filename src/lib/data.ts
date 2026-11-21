import raw from "@/data/products.json";

export type Variant = { option: string; price: number; available: boolean };
export type Product = {
  id: number;
  handle: string;
  title: string;
  originalTitle: string;
  type: string;
  category: string;
  collections: string[];
  isNew: boolean;
  isBestSeller: boolean;
  vendor: string;
  description: string;
  priceMin: number;
  priceMax: number;
  inStock: boolean;
  variants: Variant[];
  images: string[];
  imageCount: number;
  url: string;
};

export type SiteData = {
  business: {
    name: string;
    tagline: string;
    phone: string[];
    whatsapp: string;
    email: string;
    hours: string;
    showrooms: { name: string; location: string }[];
    source: string;
    fetched: string;
    note: string;
  };
  collections: { handle: string; title: string; count: number }[];
  products: Product[];
};

export const site = raw as unknown as SiteData;
export const products: Product[] = site.products;
export const business = site.business;

export function formatKES(n: number) {
  return "KSh " + n.toLocaleString("en-KE");
}

// Watermark audit (2026-11-21): every product photo from the old site carries
// the seller's logo stamp — centre on indoor shots, small corner on outdoor
// shots. Only the 4 site banner images are truly stamp-free. For the 8 outdoor
// products below, the corner stamp was cropped off (bottom 22%) and the result
// saved under /images/clean/. Homepage visuals use ONLY stamp-free images:
// these 8 + the 4 site images. All other products keep their original photos
// on the shop / detail pages until Murage supplies clean re-shoots.
export const CLEAN_IMAGE_HANDLES = new Set([
  "benin-sofa",
  "napoli-sofa",
  "retractable-sofa",
  "nova-sofa-set",
  "urban-nest-sofa-set",
  "cozy-sofa",
  "modena-sofa-set",
  "juventus-sofa-set",
]);

// Handles with Codex premium studio images (premium + 3D view) in
// /images/premium/. Grows as the generation batches land; every surface
// that shows a product photo (shop cards, category rows, related)
// automatically uses the premium hero for these.
export const PREMIUM_HANDLES = new Set([
  "nova-sofa-set",
  "benin-sofa",
  "cozy-sofa",
  "juventus-sofa-set",
  "modern-majestic-6seater-dining-set",
  "elegant-coffee-table-white",
  "king-size-mahogany-bed-set-6x6",
  // Codex batch 1 (2026-11-21)
  "7-seater-semi-recliner-back",
  "modern-copenhagen-7seater-corduroy-sofa",
  "modern-vista-7seater-microfiber-sofa",
  "mahogany-6-seater-classic",
  "modern-serenity-dining-table",
  "suede-standard-bed-5x6",
  "5x6-chester-bed-cream",
  // Codex batch 2 (2026-11-21)
  "brown-recliner-7-seater",
  "modern-austic-7-seater-microfiber-recliner-sofa-3-2-1-1",
  "retractable-sofa",
  "6-seater-dining-set",
  "regal-oval-mahogany-dining-set",
  "urban-nest-sofa-set",
  "modena-sofa-set",
  // Agy batch 3 (2026-11-21) — premium + 3D verified visually.
  "coffee-table-mahogany",
  "modern-black-peachy-tv-stands",
  "6x6-pacific-pocker-spring-mattress",
  "double-decker-4x6-by-3-5x6",
  "modern-timeless-bed-5x6",
  "crown-mahogany-queen-size-bed-5x6",
  // Codex batch 4 (2026-11-21) — premium + 3D verified visually.
  // Includes the modern-deluxe-solid-bed-5x6 3D redo: batch 3's came
  // back pale blonde with no bedding, the redo matches the honey-amber
  // wood and white bedding. All 35 products now have premium images.
  "modern-celine-chester-7seater-sofa-3-2-1-1",
  "modern-asmara-7-seater-corduroy-sofa",
  "stripe-design-bed-5x6",
  "napoli-sofa",
  "modern-cuddle-microfibre-recliner-sofa-6-seater-3-2-1",
  "sofa-set-silver-stripe-5-seater",
  "modern-serenity-oval-6-seater-dining-set",
  "modern-deluxe-solid-bed-5x6",
]);

export function premiumImages(product: Product) {
  if (!PREMIUM_HANDLES.has(product.handle)) return null;
  return {
    hero: `/images/premium/${product.handle}-premium.jpg`,
    view3d: `/images/premium/${product.handle}-3d.jpg`,
  };
}

export function displayImage(product: Product) {
  if (PREMIUM_HANDLES.has(product.handle)) {
    return `/images/premium/${product.handle}-premium.jpg`;
  }
  return CLEAN_IMAGE_HANDLES.has(product.handle)
    ? `/images/clean/${product.handle}.jpg`
    : product.images[0];
}

// Shopify descriptions sometimes carry the seller's drafting notes:
// a "Premium Product Description" prefix and a "2. Short Social Media
// Caption" section that trails off mid-word (Juventus). Strip both so
// customers only ever see the finished description.
export function cleanDescription(product: Product) {
  let d = (product.description || "").trim();
  d = d.replace(/^(Premium Product Description|Product Description)\s*/i, "");
  const cut = d.search(/2\.\s*Short Social Media Caption|Short Social Media Caption/i);
  if (cut > 0) d = d.slice(0, cut).trim();
  return d;
}

export type DescriptionFeature = { title: string; body: string };
export type ParsedDescription = { intro: string; features: DescriptionFeature[] };

// Turn a wall-of-text description into something a customer can scan:
// a short intro plus a list of features (title + one short body each).
// Handles the shapes the seller's copy actually comes in:
//  - bullet lists ("• Individual Support: ... • No More Bouncing: ...")
//    — the mattress, the unreadable one;
//  - numbered marketing sections ("1. Simple & Elegant ... 2. Luxury
//    Feel ...") — alternate captions, not product facts, so only the
//    first section is kept, as the intro;
//  - AI preambles ("Here is a professional website-ready product
//    description ...") and private-use junk characters — stripped.
export function parseDescription(product: Product): ParsedDescription {
  let d = cleanDescription(product);
  // Private-use junk characters (mangled emoji/checkmarks in the source).
  d = d.replace(/[\uE000-\uF8FF]/g, " ");
  d = d.replace(/^Here is a [^.]*?product description[^:]*:\s*/i, "");
  d = d.replace(/\s+/g, " ").trim();

  // Bullet features.
  if (/[•●]/.test(d)) {
    const parts = d.split(/[•●]/).map((s) => s.trim()).filter(Boolean);
    const features: DescriptionFeature[] = [];
    let intro = "";
    for (const part of parts) {
      const colon = part.indexOf(":");
      if (colon > 2 && colon < 60) {
        features.push({ title: part.slice(0, colon).trim(), body: part.slice(colon + 1).trim() });
      } else if (features.length === 0 && !intro) {
        intro = part;
      } else {
        features.push({ title: "", body: part });
      }
    }
    return { intro, features };
  }

  // Numbered sections: keep only the first, as the intro.
  const numbered = d.match(/\d+\.\s+/);
  if (numbered && numbered.index !== undefined && numbered.index > 0) {
    // Text before the first number is the intro (e.g. Retractable's
    // opening quote); the numbered captions after it are dropped.
    const second = d.search(/(?<!^)\s2\.\s/);
    const intro = (second > 0 ? d.slice(0, second) : d).replace(/^["“”]/, "").replace(/["”]$/, "").trim();
    return { intro, features: [] };
  }
  if (numbered && numbered.index === 0) {
    // Starts with "1. Title ..." — drop the label, keep the section's
    // body up to "2." as the intro.
    const second = d.search(/\s2\.\s/);
    let intro = second > 0 ? d.slice(0, second) : d;
    intro = intro.replace(/^\d+\.\s*[^"“”]{2,60}?\s*[“"']/, "").replace(/^["“”]/, "").trim();
    return { intro, features: [] };
  }

  return { intro: d, features: [] };
}

export function productByHandle(handle: string) {
  return products.find((p) => p.handle === handle);
}

export function whatsappLink(product?: Product) {
  const text = product
    ? `Hi Modern Furniture Pacific, I'd like to order the ${product.title} (${formatKES(product.priceMin)}). Is it available?`
    : "Hi Modern Furniture Pacific, I'd like to ask about your furniture.";
  return `https://wa.me/254716335555?text=${encodeURIComponent(text)}`;
}
