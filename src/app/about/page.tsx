import Link from "next/link";
import { business, products } from "@/lib/data";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-4xl font-extrabold text-brand">About Us</h1>
      <div className="mt-6 grid md:grid-cols-2 gap-8 items-start">
        <div className="leading-relaxed text-muted space-y-4">
          <p>
            Modern Furniture Pacific Ltd believes furniture is more than functional. It is the comfort
            you come home to, the table your family gathers around, and the bed you rest in after a long day.
          </p>
          <p>
            The store carries {products.length} pieces — sofas, beds, dining sets, tables and TV stands —
            priced from KSh 6,000 to KSh 260,000, with {products.filter((p) => p.inStock).length} in stock at the time this rebuild was made (21 Nov 2026).
          </p>
          <p>
            Visit a showroom to see a piece in person before you buy, or message us on WhatsApp and we will
            help you choose, confirm availability, and arrange pickup or delivery.
          </p>
          <Link href="/shop" className="inline-block rounded-full bg-brand text-white px-6 py-3 font-bold hover:bg-brand-dark">Shop the collection ↗</Link>
        </div>
        <div className="rounded-[2rem] overflow-hidden bg-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/site/header.png" alt="Modern Furniture Pacific showroom bedroom" className="w-full aspect-[16/9] object-cover" />
        </div>
      </div>
      <section className="pt-12">
        <h2 className="text-2xl font-extrabold">Our showrooms</h2>
        <div className="mt-5 grid sm:grid-cols-3 gap-5">
          {business.showrooms.map((s) => (
            <div key={s.name} className="bg-white rounded-3xl border border-peach p-6">
              <p className="font-extrabold">{s.name}</p>
              <p className="text-muted text-sm mt-1">{s.location}</p>
              <p className="text-sm mt-3">{business.hours}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
