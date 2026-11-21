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

export function displayImage(product: Product) {
  return CLEAN_IMAGE_HANDLES.has(product.handle)
    ? `/images/clean/${product.handle}.jpg`
    : product.images[0];
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
