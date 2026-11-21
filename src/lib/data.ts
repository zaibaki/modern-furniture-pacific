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

export function productByHandle(handle: string) {
  return products.find((p) => p.handle === handle);
}

export function whatsappLink(product?: Product) {
  const text = product
    ? `Hi Modern Furniture Pacific, I'd like to order the ${product.title} (${formatKES(product.priceMin)}). Is it available?`
    : "Hi Modern Furniture Pacific, I'd like to ask about your furniture.";
  return `https://wa.me/254716335555?text=${encodeURIComponent(text)}`;
}
