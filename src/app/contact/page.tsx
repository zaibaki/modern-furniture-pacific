import { business, whatsappLink } from "@/lib/data";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-4xl font-extrabold">Contact Us</h1>
      <p className="text-muted mt-2">Call, WhatsApp or email — or visit a showroom in person.</p>
      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-peach p-6 sm:p-8 space-y-5">
          <div>
            <p className="font-bold">Live help</p>
            <p className="text-muted text-sm mt-1">Hotline / WhatsApp: {business.phone.join(" · ")}</p>
            <p className="text-muted text-sm">Email: <a className="text-brand font-semibold" href={`mailto:${business.email}`}>{business.email}</a></p>
            <p className="text-muted text-sm">Hours: {business.hours}</p>
          </div>
          <a href={whatsappLink()} target="_blank" rel="noreferrer"
            className="inline-block rounded-full bg-brand text-white px-6 py-3 font-bold hover:bg-brand-dark">Chat on WhatsApp →</a>
          <form action={`mailto:${business.email}`} method="get" className="space-y-3 pt-4 border-t border-peach">
            <p className="font-bold">Send an email</p>
            <input name="subject" placeholder="Subject — e.g. Celine Chester sofa" required
              className="w-full rounded-2xl border border-peach-dark px-4 py-3 outline-none focus:border-brand" />
            <textarea name="body" placeholder="Your message…" rows={5} required
              className="w-full rounded-2xl border border-peach-dark px-4 py-3 outline-none focus:border-brand" />
            <button className="rounded-full bg-ink text-white px-6 py-3 font-bold">Open email app</button>
            <p className="text-xs text-muted">This opens your own email app addressed to {business.email}. Nothing is sent from this site itself.</p>
          </form>
        </div>
        <div className="space-y-5">
          {business.showrooms.map((s) => (
            <div key={s.name} className="bg-white rounded-3xl border border-peach p-6">
              <p className="font-extrabold">{s.name}</p>
              <p className="text-muted text-sm mt-1">{s.location}</p>
              <p className="text-sm mt-3">{business.hours}</p>
            </div>
          ))}
          <div className="bg-peach rounded-3xl p-6">
            <p className="font-bold">Finding a showroom</p>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              The original site&apos;s map is zoomed out to the whole country, so it does not help you find a branch.
              Ask on WhatsApp for the exact pin / directions to the branch nearest you before you travel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
