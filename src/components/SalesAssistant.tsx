"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import OrderStepperModal, { type OrderProduct } from "./OrderStepperModal";

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
    } else if (tok.startsWith("https://wa.me/")) {
      parts.push(
        <a
          key={k++}
          href={tok}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-[#25D366] text-white px-2.5 py-0.5 text-xs font-bold hover:brightness-95 align-baseline"
        >
          Chat on WhatsApp ↗
        </a>
      );
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

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|?(\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?$/.test(line.trim());
}

function FormattedMessage({ content }: { content: string }) {
  const blocks = content.trim().split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {blocks.map((block, bIdx) => {
        const lines = block.split("\n");
        const isOrdered = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
        const isBullet = lines.every((l) => /^[-*•]\s+/.test(l.trim()));
        const isTable =
          lines.length >= 2 &&
          lines[0].includes("|") &&
          isTableSeparator(lines[1]) &&
          lines.slice(2).every((l) => l.includes("|"));

        if (isTable) {
          const headers = parseTableRow(lines[0]);
          const rows = lines.slice(2).map(parseTableRow);
          return (
            <div
              key={bIdx}
              className="overflow-x-auto rounded-xl border border-peach-dark bg-cream/50"
            >
              <table className="w-full text-xs border-collapse text-left">
                <thead className="bg-peach/70 text-ink">
                  <tr>
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="px-2.5 py-1.5 font-bold border-b border-peach-dark whitespace-nowrap"
                      >
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-peach-dark/60">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="bg-white/80">
                      {headers.map((_, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-2.5 py-1.5 align-top ${
                            cIdx === 0 ? "font-semibold text-ink" : ""
                          }`}
                        >
                          {renderInline(row[cIdx] || "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

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
  variants?: { option: string; price: number; available: boolean }[];
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

function AssistantProductCard({
  item,
  onOrder,
}: {
  item: AssistantProduct;
  onOrder: (product: OrderProduct) => void;
}) {
  const [view3d, setView3d] = useState(false);

  return (
    <div className="rounded-2xl border border-peach-dark bg-white overflow-hidden shadow-xs">
      <div className="relative aspect-[4/3] bg-peach overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.premium_image}
          alt={`${item.title} (Studio view)`}
          className="w-full h-full object-cover"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_3d}
          alt={`${item.title} (3D view)`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
            view3d ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
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
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-ink hover:text-brand leading-snug line-clamp-2"
          >
            {item.title}
          </Link>
        </div>
        <p className="text-xs font-extrabold text-brand">{item.price}</p>
        <div className="flex items-center gap-1.5 pt-0.5">
          <Link
            href={item.product_url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center rounded-full border border-peach-dark px-2 py-1 text-[11px] font-semibold text-ink hover:border-brand hover:text-brand transition-colors"
          >
            Details
          </Link>
          {item.in_stock && (
            <button
              type="button"
              onClick={() => onOrder(item)}
              className="flex-1 text-center rounded-full bg-brand px-2 py-1 text-[11px] font-semibold text-white hover:bg-brand-dark transition-colors cursor-pointer"
            >
              Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageActions({
  message,
  onSend,
  disabled,
}: {
  message: ChatMsg;
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  if (message.role !== "assistant") return null;

  const text = message.content;
  const lower = text.toLowerCase();
  const waMatch = text.match(/https:\/\/wa\.me\/[^\s)]+/);
  const mentionsWa =
    Boolean(message.whatsapp_shortlist_link) ||
    Boolean(waMatch) ||
    lower.includes("whatsapp") ||
    /(\+?254|0)716\s*335\s*555/.test(text);

  const whatsappHref =
    message.whatsapp_shortlist_link ||
    (waMatch ? waMatch[0] : "https://wa.me/254716335555");
  const whatsappLabel = message.whatsapp_shortlist_link
    ? "Send shortlist on WhatsApp ↗"
    : "Chat on WhatsApp ↗";

  const phoneMatch = text.match(/(?:\+?254|0)7\d{2}[\s-]?\d{6}/);
  const phoneHref = phoneMatch
    ? `tel:${phoneMatch[0].replace(/[\s-]/g, "").replace(/^0/, "+254")}`
    : null;
  const phoneLabel = phoneMatch ? `Call ${phoneMatch[0]}` : null;

  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  const mentionsShowroom = /\b(showroom|ruiru|kihunguro|nyeri)\b/i.test(text);

  const inStockProducts = (message.products || []).filter((p) => p.in_stock);

  const hasAny =
    mentionsWa ||
    phoneHref ||
    emailMatch ||
    mentionsShowroom ||
    inStockProducts.length >= 1;

  if (!hasAny) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {mentionsWa && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:brightness-95 transition-all"
        >
          {whatsappLabel}
        </a>
      )}
      {phoneHref && phoneLabel && (
        <a
          href={phoneHref}
          className="inline-flex items-center gap-1 rounded-full border border-brand text-brand bg-white px-3 py-1.5 text-xs font-bold hover:bg-brand hover:text-white transition-colors"
        >
          {phoneLabel}
        </a>
      )}
      {emailMatch && (
        <a
          href={`mailto:${emailMatch[0]}`}
          className="inline-flex items-center gap-1 rounded-full border border-peach-dark bg-white text-ink px-3 py-1.5 text-xs font-semibold hover:border-brand hover:text-brand transition-colors"
        >
          Email {emailMatch[0]}
        </a>
      )}
      {mentionsShowroom && (
        <Link
          href="/contact"
          className="inline-flex items-center gap-1 rounded-full border border-peach-dark bg-white text-ink px-3 py-1.5 text-xs font-semibold hover:border-brand hover:text-brand transition-colors"
        >
          Showrooms &amp; Map →
        </Link>
      )}
      {inStockProducts.length >= 2 && (
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onSend(
              `Compare ${inStockProducts[0].title} and ${inStockProducts[1].title}`
            )
          }
          className="inline-flex items-center gap-1 rounded-full bg-peach hover:bg-peach-dark text-ink px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
        >
          Compare top 2
        </button>
      )}
      {inStockProducts.length === 1 && (
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onSend(`Show full details and variants for ${inStockProducts[0].title}`)
          }
          className="inline-flex items-center gap-1 rounded-full bg-peach hover:bg-peach-dark text-ink px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
        >
          Full details &amp; variants
        </button>
      )}
    </div>
  );
}

export default function SalesAssistant() {
  const [open, setOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState<OrderProduct | null>(null);
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
        <div className="relative w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[80vh] rounded-3xl bg-cream border border-peach-dark shadow-2xl flex flex-col overflow-hidden">
          {orderProduct && (
            <OrderStepperModal
              product={orderProduct}
              onClose={() => setOrderProduct(null)}
            />
          )}
          <div className="bg-brand text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-sm leading-tight">
                Pacific Sales Assistant
              </p>
              <p className="text-[11px] text-white/85">
                Live prices · 3D &amp; studio views · WhatsApp order
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <a
                href="https://wa.me/254716335555?text=Hi%20Modern%20Furniture%20Pacific%2C%20I%20would%20like%20to%20speak%20with%20a%20human%20sales%20representative."
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white transition-colors"
              >
                Talk to human ↗
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
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
                      <AssistantProductCard
                        key={p.handle}
                        item={p}
                        onOrder={setOrderProduct}
                      />
                    ))}
                  </div>
                )}

                <MessageActions
                  message={m}
                  onSend={send}
                  disabled={loading}
                />
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
