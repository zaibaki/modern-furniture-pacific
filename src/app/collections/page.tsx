import Link from "next/link";
import { site, productByHandle } from "@/lib/data";

const TILE: Record<string, string> = {
  "living-room": "modern-copenhagen-7seater-corduroy-sofa",
  "bedroom-1": "modern-deluxe-solid-bed-5x6",
  "bedroom": "regal-oval-mahogany-dining-set",
  "tables": "elegant-coffee-table-white",
  "dressing-table": "king-size-mahogany-bed-set-6x6",
};

export default function CollectionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-4xl font-extrabold">Collections</h1>
      <p className="text-muted mt-2">Every collection from the original store, with the counts as listed — no invented categories.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {site.collections.filter((c) => c.handle !== "dressing-table").map((c) => {
          const img = productByHandle(TILE[c.handle])?.images[0];
          const href = c.handle === "bedroom" ? "/collections/dining"
            : c.handle === "bedroom-1" ? "/collections/bedroom"
            : c.handle === "living-room" ? "/collections/living-room"
            : c.handle === "tables" ? "/collections/tables" : "/shop";
          // Tables in this rebuild is the 3 non-dining tables; the other 3
          // in the original Tables collection are dining tables, shown under Dining.
          const shownCount = c.handle === "tables" ? 3 : c.count;
          return (
            <Link key={c.handle} href={href} className="group relative block rounded-[2rem] overflow-hidden bg-brand text-white min-h-[260px]">
              {img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={c.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/90 via-brand/30 to-transparent" />
              <div className="relative p-6 flex flex-col justify-end h-full min-h-[260px]">
                <h2 className="text-2xl font-extrabold">{c.title}</h2>
                <p className="text-white/85 text-sm mt-1">{shownCount} {shownCount === 1 ? "piece" : "pieces"}</p>
                <span className="mt-4 inline-flex w-fit bg-white text-brand text-sm font-bold px-4 py-2 rounded-full">Explore more »</span>
              </div>
            </Link>
          );
        })}
        <Link href="/shop?badge=new" className="group relative block rounded-[2rem] overflow-hidden bg-ink text-white min-h-[260px]">
          <div className="relative p-6 flex flex-col justify-end h-full min-h-[260px]">
            <h2 className="text-2xl font-extrabold">New arrivals</h2>
            <p className="text-white/85 text-sm mt-1">13 pieces</p>
            <span className="mt-4 inline-flex w-fit bg-white text-ink text-sm font-bold px-4 py-2 rounded-full">Explore more »</span>
          </div>
        </Link>
        <Link href="/shop?badge=best" className="group relative block rounded-[2rem] overflow-hidden bg-ink text-white min-h-[260px]">
          <div className="relative p-6 flex flex-col justify-end h-full min-h-[260px]">
            <h2 className="text-2xl font-extrabold">Best sellers</h2>
            <p className="text-white/85 text-sm mt-1">17 pieces</p>
            <span className="mt-4 inline-flex w-fit bg-white text-ink text-sm font-bold px-4 py-2 rounded-full">Explore more »</span>
          </div>
        </Link>
      </div>
      <p className="text-sm text-muted mt-8">
        Note: on the original site, &ldquo;Dinning&rdquo; is spelled that way and links to /collections/bedroom, while Bedroom Sets links to /collections/bedroom-1.
        This rebuild fixes the spelling and the links. The &ldquo;Dressing table&rdquo; collection on the original site actually contains beds, so it is not shown as a separate dressing-table category here.
      </p>
    </div>
  );
}
