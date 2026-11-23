import raw from "@/data/products.json";
import { supabase, isSupabaseConfigured } from "./supabase";

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

// The catalogue as baked into the repo. This is the fallback: it is what
// the site renders today, and what it keeps rendering whenever Supabase
// is not configured or not reachable.
const jsonSite = raw as unknown as SiteData;

// Collection titles as listed on the original Shopify store. The slugs
// are the source of truth for counts (products carry them in their
// `collections` array); the titles are NOT derivable from the slug —
// "bedroom" is the Dining collection on the original site, and
// "bedroom-1" is Bedroom. Keep this map in sync with the collections
// page's TILE/href tables.
const COLLECTION_TITLES: Record<string, string> = {
  "living-room": "Living Room",
  "bedroom-1": "Bedroom",
  bedroom: "Dining",
  tables: "Tables",
  "dressing-table": "Dressing Tables",
};

// Row shapes returned by the Supabase queries below. The joins embed the
// category name, variants and images on each product row.
type SupabaseProductRow = {
  shopify_id: number;
  handle: string;
  title: string;
  original_title: string | null;
  type: string | null;
  categories: { name: string } | { name: string }[] | null;
  collections: string[] | null;
  is_new: boolean;
  is_best_seller: boolean;
  vendor: string | null;
  description: string | null;
  price_min: number | string;
  price_max: number | string;
  in_stock: boolean;
  original_url: string | null;
  product_variants: {
    option: string;
    price: number | string;
    available: boolean;
    position: number;
  }[];
  product_images: { path: string; position: number }[];
};

type SupabaseBusinessRow = {
  name: string;
  tagline: string | null;
  phone: string[] | null;
  whatsapp: string | null;
  email: string | null;
  hours: string | null;
  showrooms: { name: string; location: string }[] | null;
  source_url: string | null;
};

// Map one Supabase product row onto the Product shape the pages consume.
// Pure function, exported so it can be tested against real DB rows.
export function mapSupabaseProduct(row: SupabaseProductRow): Product {
  const variants = [...(row.product_variants ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      option: v.option,
      price: Number(v.price),
      available: v.available,
    }));
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((i) => i.path);
  return {
    id: Number(row.shopify_id),
    handle: row.handle,
    title: row.title,
    originalTitle: row.original_title ?? row.title,
    type: row.type ?? "",
    // PostgREST returns the many-to-one category as a single object;
    // the client's types describe it as an array, so accept both.
    category: Array.isArray(row.categories)
      ? row.categories[0]?.name ?? ""
      : row.categories?.name ?? "",
    collections: row.collections ?? [],
    isNew: row.is_new,
    isBestSeller: row.is_best_seller,
    vendor: row.vendor ?? "",
    description: row.description ?? "",
    priceMin: Number(row.price_min),
    priceMax: Number(row.price_max),
    inStock: row.in_stock,
    variants,
    images,
    imageCount: images.length,
    url: row.original_url ?? "",
  };
}

// Build the SiteData the pages consume from Supabase rows. Pure function,
// exported so it can be tested against real DB rows.
export function siteDataFromSupabaseRows(
  productRows: SupabaseProductRow[],
  businessRow: SupabaseBusinessRow | null,
): SiteData | null {
  if (productRows.length === 0 || !businessRow) return null;
  const products = productRows.map(mapSupabaseProduct);
  return {
    business: {
      name: businessRow.name,
      tagline: businessRow.tagline ?? "",
      phone: businessRow.phone ?? [],
      whatsapp: businessRow.whatsapp ?? "",
      email: businessRow.email ?? "",
      hours: businessRow.hours ?? "",
      showrooms: businessRow.showrooms ?? [],
      // Provenance of the original Shopify fetch — the values the JSON
      // carries. They describe where the seed came from, not live data,
      // and no page renders them (layout hardcodes the fetch date).
      source: businessRow.source_url ?? "",
      fetched: jsonSite.business.fetched,
      note: jsonSite.business.note,
    },
    collections: Object.entries(COLLECTION_TITLES).map(([handle, title]) => ({
      handle,
      title,
      count: products.filter((p) => p.collections.includes(handle)).length,
    })),
    products,
  };
}

// Fetch the whole catalogue from Supabase. Throws on any query error so
// the caller falls back to the local JSON — a dead or empty backend must
// never blank the live site.
async function fetchSiteDataFromSupabase(): Promise<SiteData | null> {
  if (!supabase) return null;
  const [productsRes, businessRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "shopify_id, handle, title, original_title, type, categories(name), collections, is_new, is_best_seller, vendor, description, price_min, price_max, in_stock, original_url, product_variants(option, price, available, position), product_images(path, position)",
      )
      .order("position", { ascending: true })
      .order("position", { referencedTable: "product_variants", ascending: true })
      .order("position", { referencedTable: "product_images", ascending: true }),
    supabase
      .from("business_info")
      .select("name, tagline, phone, whatsapp, email, hours, showrooms, source_url")
      .limit(1),
  ]);
  if (productsRes.error) throw new Error(`products: ${productsRes.error.message}`);
  if (businessRes.error) throw new Error(`business_info: ${businessRes.error.message}`);
  return siteDataFromSupabaseRows(
    (productsRes.data ?? []) as SupabaseProductRow[],
    (businessRes.data?.[0] ?? null) as SupabaseBusinessRow | null,
  );
}

// Load the catalogue: Supabase when configured, local JSON otherwise.
// The fetch is capped at 10s and any failure falls back to the JSON, so
// the site keeps rendering with the baked-in data until the live project
// exists and answers.
async function loadSiteData(): Promise<SiteData> {
  if (!isSupabaseConfigured) return jsonSite;
  try {
    const data = await Promise.race([
      fetchSiteDataFromSupabase().catch(() => null),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
    ]);
    if (!data || data.products.length === 0) {
      console.warn("[data] Supabase returned no usable catalogue, using local products.json");
      return jsonSite;
    }
    return data;
  } catch (err) {
    console.warn("[data] Supabase fetch failed, using local products.json:", err);
    return jsonSite;
  }
}

// NOTE: top-level await. Every importer is a server component, so module
// evaluation happens on the server at build/prerender time (or once per
// server process for dynamic routes). With no env vars set this resolves
// immediately to the JSON; with env vars set it fetches once and the
// result is what every page renders.
export const site: SiteData = await loadSiteData();
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
