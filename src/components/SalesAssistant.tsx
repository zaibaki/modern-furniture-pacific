"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";

function renderInline(text: string) {
  const tokenRe =
    /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|https?:\/\/[^\s)]+)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let k = 0;

  while ((match = tokenRe.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<Fragment key={k++}>{text.slice(last, match.index)}</Fragment>);
    }
    const tok = match[0];
    if (tok.startsWith("**") && tok.endsWith("**")) {
      parts.push(
        <strong key={k++} className="font-bold">
          {tok.slice(2, -2)}
        </strong>
      );
    } else if (tok.startsWith("*") && tok.endsWith("*")) {
      parts.push(
        <em key={k++} className="italic">
          {tok.slice(1, -1)}
        </em>
      );
    } else if (tok.startsWith("[")) {
      const m = tok.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (m) {
        parts.push(
          <a
            key={k++}
            href={m[2]}
            target="_blank"
            rel="noreferrer"
            className="underline font-semibold hover:text-brand"
          >
            {m[1]}
          </a>
        );
      }
    } else {
      parts.push(
        <a
          key={k++}
          href={tok}
          target="_blank"
          rel="noreferrer"
          className="underline font-semibold break-all hover:text-brand"
        >
          {tok}
        </a>
      );
    }
    last = tokenRe.lastIndex;
  }

  if (last < text.length) {
    parts.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  }
  return parts;
}

function FormattedMessage({ content }: { content: string }) {
  const blocks = content.trim().split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {blocks.map((block, bIdx) => {
        const lines = block.split("\n");
        const isOrdered = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
        const isBullet = lines.every((l) => /^[-*•]\s+/.test(l.trim()));

        if (isOrdered) {
          return (
            <ol key={bIdx} className="list-decimal pl-4 space-y-1">
              {lines.map((l, i) => (
                <li key={i}>{renderInline(l.trim().replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        if (isBullet) {
          return (
            <ul key={bIdx} className="list-disc pl-4 space-y-1">
              {lines.map((l, i) => (
                <li key={i}>{renderInline(l.trim().replace(/^[-*•]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bIdx} className="leading-relaxed">
            {lines.map((l, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {renderInline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

interface AssistantProduct {
  handle: string;
  title: string;
  category: string;
  price: string;
  in_stock: boolean;
  premium_image: string;
  image_3d: string;
  product_url: string;
  whatsapp_link: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  products?: AssistantProduct[];
  whatsapp_shortlist_link?: string | null;
}

const STARTERS = [
  "Sofas under KSh 90,000",
  "Best-selling beds in stock",
  "Compare Nova & Benin sofas",
  "Showroom locations & hours",
];

function AssistantProductCard({ item }: { item: AssistantProduct }) {
  const [view3d, setView3d] = useState(false);
  const imgSrc = view3d ? item.image_3d : item.premium_image;

  return (
    <div className="rounded-2xl border border-peach-dark bg-white overflow-hidden shadow-xs">
      <div className="relative aspect-[4/3] bg-peach">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={`${item.title} (${view3d ? "3D view" : "Studio view"})`}
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={() => setView3d((v) => !v)}
          className="absolute bottom-2 right-2 rounded-full bg-ink/80 text-white text-[11px] font-semibold px-2.5 py-1 hover:bg-brand transition-colors cursor-pointer"
        >
          {view3d ? "Studio Photo" : "3D View"}
        </button>
        {!item.in_stock && (
          <span className="absolute top-2 left-2 rounded-full bg-black/80 text-white text-[10px] font-bold px-2 py-0.5">
            Sold out
          </span>
        )}
      </div>
      <div className="p-2.5 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={item.product_url}
            className="text-xs font-bold text-ink hover:text-brand leading-snug line-clamp-2"
          >
            {item.title}
          </Link>
        </div>
        <p className="text-xs font-extrabold text-brand">{item.price}</p>
        <div className="flex items-center gap-1.5 pt-0.5">
          <Link
            href={item.product_url}
            className="flex-1 text-center rounded-full border border-peach-dark px-2 py-1 text-[11px] font-semibold text-ink hover:border-brand hover:text-brand transition-colors"
          >
            Details
          </Link>
          {item.in_stock && (
            <a
              href={item.whatsapp_link}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center rounded-full bg-brand px-2 py-1 text-[11px] font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              Order
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SalesAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Karibu to Modern Furniture Pacific! Tell me what piece you're looking for (or your budget in KSh) and I'll look up live prices and in-stock options.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMsg[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.answer ||
            "I couldn't process that. Please reach us on WhatsApp (0716 335555).",
          products: Array.isArray(data.products) ? data.products : [],
          whatsapp_shortlist_link: data.whatsapp_shortlist_link || null,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection issue. Please chat with our team on WhatsApp (0716 335555).",
          whatsapp_shortlist_link: "https://wa.me/254716335555",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[80vh] rounded-3xl bg-cream border border-peach-dark shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-brand text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-sm leading-tight">
                Pacific Sales Assistant
              </p>
              <p className="text-[11px] text-white/85">
                Live prices · 3D &amp; studio views · WhatsApp order
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand text-white rounded-br-sm"
                      : "bg-white border border-peach-dark text-ink rounded-bl-sm"
                  }`}
                >
                  {m.role === "user" ? (
                    m.content
                  ) : (
                    <FormattedMessage content={m.content} />
                  )}
                </div>

                {m.products && m.products.length > 0 && (
                  <div className="mt-2 w-full grid grid-cols-2 gap-2">
                    {m.products.map((p) => (
                      <AssistantProductCard key={p.handle} item={p} />
                    ))}
                  </div>
                )}

                {m.whatsapp_shortlist_link && (
                  <a
                    href={m.whatsapp_shortlist_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:brightness-95 transition-all"
                  >
                    Send shortlist on WhatsApp ↗
                  </a>
                )}
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full bg-peach hover:bg-peach-dark text-ink text-xs font-medium px-3 py-1.5 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="inline-block rounded-2xl bg-white border border-peach-dark px-3.5 py-2 text-xs text-muted">
                Checking live catalogue...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-2.5 bg-white border-t border-peach-dark flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sofas, beds, budget..."
              className="flex-1 rounded-full bg-cream border border-peach-dark px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full bg-brand text-white px-4 py-2 text-sm font-bold hover:bg-brand-dark disabled:opacity-40 transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-brand text-white px-5 py-3 text-sm font-bold shadow-xl hover:bg-brand-dark transition-all flex items-center gap-2 cursor-pointer"
      >
        <span aria-hidden>💬</span>
        <span>{open ? "Hide Assistant" : "Ask Sales Assistant"}</span>
      </button>
    </div>
  );
}
