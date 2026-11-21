import Link from "next/link";
import { business, productByHandle, whatsappLink } from "@/lib/data";

// Homepage v7 — the orange theme is back (cream, #f4530a, peach), because
// that is what made the site beautiful. Structure follows the reference
// Richie shared: each section is one clear graphic, a brief description,
// and a PRIMARY action button (orange, filled), in a clean sans font.
// No side-by-side images, no grids, no cards, no prices, no product names
// on the scroll. The scroll is long and covers every section, one moment
// at a time. Names, prices and buying live on /shop and the product pages.
//
// Graphics are the premium studio images Codex generated on the Mac
// (premium/codex/): same sofas, seamless light-grey studio, soft light.
// Hover: the graphic lifts, brightens, a warm light washes in — and where
// a 3D view exists it crossfades in, so the piece turns in space.

function PrimaryButton({ href, children, white }: { href: string; children: React.ReactNode; white?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold transition-colors ${
        white ? "bg-white text-brand hover:bg-peach" : "bg-brand text-white hover:bg-brand-dark"
      }`}
    >
      {children} <span aria-hidden>↗</span>
    </Link>
  );
}

// One graphic. `view3d` (when it exists) crossfades in on hover.
function Visual({ src, view3d, href }: { src: string; view3d?: string; href: string }) {
  return (
    <Link href={href} className="group block">
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading="lazy"
          className="w-full aspect-[16/9] object-cover transition-all duration-700 group-hover:scale-[1.02] group-hover:brightness-110"
        />
        {view3d && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={view3d}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: "radial-gradient(120% 90% at 50% 0%, rgba(255, 214, 170, 0.35), rgba(255, 214, 170, 0) 60%)" }}
        />
      </div>
    </Link>
  );
}

// One section: graphic, title, brief, one primary button.
function Moment({
  title, blurb, img, view3d, href, button,
}: {
  title: string; blurb: string; img: string; view3d?: string; href: string; button: string;
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
      <Visual src={img} view3d={view3d} href={href} />
      <div className="mt-9 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-brand">{title}</h2>
        <p className="text-muted leading-relaxed mt-3 max-w-md mx-auto">{blurb}</p>
        <div className="mt-7">
          <PrimaryButton href={href}>{button}</PrimaryButton>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const hero = productByHandle("nova-sofa-set");
  const living = productByHandle("benin-sofa");
  const sofas = productByHandle("cozy-sofa");
  const spotlight = productByHandle("juventus-sofa-set");

  return (
    <div>
      {/* Hero — soft peach, orange headline, brief, primary button. */}
      <section className="bg-peach">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-14 md:pt-16 md:pb-20 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-brand leading-[1.05]">
            Make you<br />feel luxury
          </h1>
          <p className="mt-5 text-muted leading-relaxed max-w-md mx-auto">
            Sofas, beds, dining sets and tables for Kenyan homes.
          </p>
          {hero && (
            <div className="mt-10">
              <Visual
                src="/images/premium/nova-sofa-set-premium.jpg"
                view3d="/images/premium/nova-sofa-set-3d.jpg"
                href="/shop"
              />
            </div>
          )}
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <PrimaryButton href="/shop">Shop now</PrimaryButton>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white border border-brand/30 px-7 py-3.5 font-bold hover:border-brand transition-colors"
            >
              Chat on WhatsApp <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* Every section, one moment at a time. */}
      {living && (
        <Moment
          title="Living Room"
          blurb="Sofas and chairs to sink into at the end of the day."
          img="/images/premium/benin-sofa-premium.jpg"
          view3d="/images/premium/benin-sofa-3d.jpg"
          href="/shop?category=Living%20Room"
          button="Explore"
        />
      )}

      <Moment
        title="Bedroom"
        blurb="Beds and bedroom sets for deep, quiet sleep."
        img="/images/site/header.png"
        href="/shop?category=Bedroom"
        button="Explore"
      />

      {sofas && (
        <Moment
          title="Sofas"
          blurb="Two pieces. Made to be lived in."
          img="/images/premium/cozy-sofa-premium.jpg"
          view3d="/images/premium/cozy-sofa-3d.jpg"
          href="/shop?category=Living%20Room"
          button="Explore"
        />
      )}

      {spotlight && (
        <Moment
          title="The Statement"
          blurb="A statement set for the living room. See it in person, or order it on WhatsApp."
          img="/images/premium/juventus-sofa-set-premium.jpg"
          view3d="/images/premium/juventus-sofa-set-3d.jpg"
          href={`/products/${spotlight.handle}`}
          button="View Product"
        />
      )}

      <Moment
        title="About Us"
        blurb="Modern Furniture Pacific Ltd believes furniture is more than functional. It is the comfort you come home to."
        img="/images/site/mf237.jpg"
        href="/about"
        button="More about us"
      />

      {/* Visit — orange panel, one primary button. */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
        <div className="bg-brand text-white rounded-3xl p-8 sm:p-12 text-center">
          <p className="text-2xl sm:text-3xl font-extrabold">See it in person</p>
          <p className="text-white/85 mt-2">Ruiru · Kihunguro · Nyeri</p>
          <div className="mt-7">
            <PrimaryButton href="/contact" white>
              Visit a showroom
            </PrimaryButton>
          </div>
          <p className="text-white/70 text-sm mt-5">Call {business.phone.join(" or ")}</p>
        </div>
      </section>
    </div>
  );
}
