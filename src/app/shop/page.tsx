import Link from "next/link";
import { Suspense } from "react";
import { products, formatKES } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = ["All", "Living Room", "Bedroom", "Dining", "Tables"];

async function ShopContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const category = typeof sp.category === "string" ? sp.category : "All";
  const badge = typeof sp.badge === "string" ? sp.badge : "";
  const onlyInStock = sp.instock === "1";

  const filtered = products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (badge === "new" && !p.isNew) return false;
    if (badge === "best" && !p.isBestSeller) return false;
    if (onlyInStock && !p.inStock) return false;
    if (q && !`${p.title} ${p.type} ${p.category} ${p.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <p className="text-muted mt-2">
        {filtered.length} of {products.length} pieces · Prices {formatKES(6000)} – {formatKES(260000)} · In-store pickup free
      </p>

      <form method="get" className="mt-6 flex flex-col sm:flex-row gap-3">
        <input name="q" defaultValue={q} placeholder="Search sofas, beds, dining sets…" aria-label="Search products"
          className="flex-1 rounded-full border border-peach-dark bg-white px-5 py-3 outline-none focus:border-brand" />
        <select name="category" defaultValue={category} aria-label="Category"
          className="rounded-full border border-peach-dark bg-white px-4 py-3 outline-none">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}
        </select>
        <select name="badge" defaultValue={badge} aria-label="Collection"
          className="rounded-full border border-peach-dark bg-white px-4 py-3 outline-none">
          <option value="">All collections</option>
          <option value="new">New arrivals</option>
          <option value="best">Best sellers</option>
        </select>
        <label className="flex items-center gap-2 rounded-full border border-peach-dark bg-white px-4 py-3 text-sm cursor-pointer">
          <input type="checkbox" name="instock" value="1" defaultChecked={onlyInStock} className="accent-[#f4530a]" /> In stock only
        </label>
        <button className="rounded-full bg-brand text-white px-6 py-3 font-bold hover:bg-brand-dark">Filter</button>
      </form>

      {(category !== "All" || badge || q || onlyInStock) && (
        <p className="mt-4 text-sm"><Link href="/shop" className="text-brand font-bold">Clear all filters →</Link></p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-10 bg-white rounded-3xl border border-peach p-10 text-center">
          <p className="text-xl font-bold">Nothing matches that search yet.</p>
          <p className="text-muted mt-2">Try a different word, or browse the full shop.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-full bg-brand text-white px-6 py-3 font-bold">View everything</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => <ProductCard key={p.handle} product={p} />)}
        </div>
      )}
    </>
  );
}

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-4xl font-extrabold">Shop</h1>
      <Suspense fallback={<p className="text-muted mt-4">Loading products…</p>}>
        <ShopContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
