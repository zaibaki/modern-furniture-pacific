import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { business, whatsappLink } from "@/lib/data";
import SalesAssistant from "@/components/SalesAssistant";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modern Furniture Pacific Ltd — Make you feel luxury",
  description:
    "Premium sofas, beds, dining sets and tables in Kenya. Visit our showrooms in Ruiru, Kihunguro and Nyeri. Prices from KSh 6,000.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <div className="bg-brand text-white text-center text-xs sm:text-sm py-2 px-4">
          Call or WhatsApp {business.phone[0]} · {business.phone[1]} — Showrooms in Ruiru, Kihunguro &amp; Nyeri
        </div>
        <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-peach-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 py-3">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center font-extrabold text-lg" aria-hidden>M</span>
              <span className="leading-tight">
                <span className="block font-extrabold tracking-tight text-brand text-lg">Modern Furniture</span>
                <span className="block text-[11px] tracking-[0.25em] uppercase text-muted">Pacific Ltd</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-brand transition-colors">{n.label}</Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <a href={whatsappLink()} target="_blank" rel="noreferrer"
                 className="hidden sm:inline-flex rounded-full border border-brand text-brand px-4 py-2 text-sm font-semibold hover:bg-brand hover:text-white transition-colors">
                WhatsApp us
              </a>
              <Link href="/shop" className="rounded-full bg-brand text-white px-4 py-2 text-sm font-semibold hover:bg-brand-dark transition-colors">
                Shop now ↗
              </Link>
            </div>
          </div>
          <nav className="md:hidden flex gap-5 overflow-x-auto px-4 pb-3 text-sm font-medium">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="whitespace-nowrap hover:text-brand">{n.label}</Link>
            ))}
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-peach mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
            <div>
              <p className="font-extrabold text-brand text-lg">Modern Furniture Pacific Ltd</p>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Furniture that is more than functional. Sofas, beds, dining sets and tables, made to make your home feel luxurious.
              </p>
              <p className="text-sm mt-4">{business.hours}</p>
            </div>
            <div>
              <p className="font-bold mb-3">Shop</p>
              <ul className="space-y-2 text-sm">
                <li><Link className="hover:text-brand" href="/shop">All products</Link></li>
                <li><Link className="hover:text-brand" href="/shop?category=Living%20Room">Living Room</Link></li>
                <li><Link className="hover:text-brand" href="/shop?category=Bedroom">Bedroom</Link></li>
                <li><Link className="hover:text-brand" href="/shop?category=Dining">Dining</Link></li>
                <li><Link className="hover:text-brand" href="/shop?category=Tables">Tables</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-3">Company</p>
              <ul className="space-y-2 text-sm">
                <li><Link className="hover:text-brand" href="/about">About us</Link></li>
                <li><Link className="hover:text-brand" href="/contact">Contact</Link></li>
                <li><Link className="hover:text-brand" href="/collections">Collections</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-3">Visit us</p>
              <ul className="space-y-2 text-sm">
                {business.showrooms.map((s) => (
                  <li key={s.name}><span className="font-semibold">{s.name}</span><br /><span className="text-muted">{s.location}</span></li>
                ))}
                <li className="pt-2"><a className="hover:text-brand" href={`mailto:${business.email}`}>{business.email}</a></li>
                <li>{business.phone.join(" · ")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-peach-dark py-4 text-center text-xs text-muted px-4">
            © 2026 Modern Furniture Pacific Ltd. Premium rebuild — product data and photos from modernfurniturepacificltd.com, fetched 21 Nov 2026.
          </div>
        </footer>
        <SalesAssistant />
      </body>
    </html>
  );
}
