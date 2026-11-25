"use client";

import { useState } from "react";

export interface OrderProduct {
  handle: string;
  title: string;
  price: string;
  premium_image: string;
  variants?: { option: string; price: number; available: boolean }[];
}

export default function OrderStepperModal({
  product,
  onClose,
}: {
  product: OrderProduct;
  onClose: () => void;
}) {
  const availableVariants = (product.variants || []).filter((v) => v.available);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [option, setOption] = useState(
    availableVariants[0]?.option || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    reference: string;
    whatsapp_link: string;
  } | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: product.title,
          productHandle: product.handle,
          productPrice: product.price,
          option,
          quantity,
          customerName,
          phone,
          location,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not submit order.");
        return;
      }
      setResult({
        reference: data.reference,
        whatsapp_link: data.whatsapp_link,
      });
      setStep(4);
    } catch {
      setError("Network error while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canNextStep2 =
    customerName.trim().length > 1 &&
    phone.trim().length >= 7 &&
    location.trim().length > 1;

  return (
    <div className="absolute inset-0 z-20 bg-ink/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-3">
      <div className="w-full rounded-3xl bg-cream border border-peach-dark shadow-2xl overflow-hidden flex flex-col max-h-full">
        <div className="bg-brand text-white px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-sm leading-tight">
              {step === 4 ? "Order Submitted" : "Quick Order Request"}
            </p>
            {step < 4 && (
              <p className="text-[11px] text-white/85">Step {step} of 3</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order form"
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {step < 4 && (
          <div className="px-4 pt-3 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-brand" : "bg-peach-dark"
                }`}
              />
            ))}
          </div>
        )}

        <div className="p-4 overflow-y-auto space-y-3 text-sm">
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-white border border-peach-dark p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.premium_image}
                  alt={product.title}
                  className="w-16 h-12 rounded-xl object-cover bg-peach shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-ink text-xs truncate">
                    {product.title}
                  </p>
                  <p className="font-extrabold text-brand text-xs">
                    {product.price}
                  </p>
                </div>
              </div>

              {availableVariants.length > 0 ? (
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Select Size / Option
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableVariants.map((v) => (
                      <button
                        key={v.option}
                        type="button"
                        onClick={() => setOption(v.option)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors cursor-pointer ${
                          option === v.option
                            ? "bg-brand text-white border-brand"
                            : "bg-white text-ink border-peach-dark hover:border-brand"
                        }`}
                      >
                        {v.option} · KSh {v.price.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Preferred Size / Color (optional)
                  </label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => setOption(e.target.value)}
                    placeholder="e.g. 5-seater, beige, 5x6..."
                    className="w-full rounded-xl bg-white border border-peach-dark px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Quantity
                </label>
                <div className="inline-flex items-center gap-2 rounded-full bg-white border border-peach-dark px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded-full bg-peach hover:bg-peach-dark font-bold text-xs cursor-pointer"
                  >
                    −
                  </button>
                  <span className="text-xs font-bold w-5 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-6 h-6 rounded-full bg-peach hover:bg-peach-dark font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl bg-white border border-peach-dark px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0712 345 678"
                  className="w-full rounded-xl bg-white border border-peach-dark px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Delivery Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ruiru, Kilimani Nairobi, Nyeri..."
                  className="w-full rounded-xl bg-white border border-peach-dark px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fabric preference, delivery timing..."
                  className="w-full rounded-xl bg-white border border-peach-dark px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-2xl bg-white border border-peach-dark p-3 space-y-1.5 text-xs">
              <p className="font-extrabold text-brand text-sm">
                Review Your Order
              </p>
              <p>
                <span className="font-bold">Item:</span> {product.title} (
                {product.price})
              </p>
              {option && (
                <p>
                  <span className="font-bold">Option:</span> {option}
                </p>
              )}
              <p>
                <span className="font-bold">Quantity:</span> {quantity}
              </p>
              <p>
                <span className="font-bold">Name:</span> {customerName}
              </p>
              <p>
                <span className="font-bold">Phone:</span> {phone}
              </p>
              <p>
                <span className="font-bold">Location:</span> {location}
              </p>
              {notes.trim() && (
                <p>
                  <span className="font-bold">Notes:</span> {notes}
                </p>
              )}
              {error && (
                <p className="text-red-600 font-semibold pt-1">{error}</p>
              )}
            </div>
          )}

          {step === 4 && result && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-white border border-peach-dark p-3 space-y-1 text-xs">
                <p className="font-extrabold text-ink text-sm">
                  Order Reference: {result.reference}
                </p>
                <p className="text-muted">
                  Your details for <span className="font-semibold text-ink">{product.title}</span> are ready. Follow up on WhatsApp to confirm delivery &amp; payment, or click Complete to return to chat.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={result.whatsapp_link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center rounded-full bg-[#25D366] text-white px-4 py-2.5 text-xs font-bold shadow-xs hover:brightness-95 transition-all"
                >
                  Follow up on WhatsApp ↗
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-full border border-peach-dark bg-white text-ink px-4 py-2 text-xs font-bold hover:border-brand hover:text-brand transition-colors cursor-pointer"
                >
                  Complete
                </button>
              </div>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="p-3 bg-white border-t border-peach-dark flex items-center justify-between gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                className="rounded-full border border-peach-dark px-4 py-2 text-xs font-bold text-ink hover:border-brand cursor-pointer"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-peach-dark px-4 py-2 text-xs font-bold text-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full bg-brand text-white px-5 py-2 text-xs font-bold hover:bg-brand-dark transition-colors cursor-pointer"
              >
                Next: Your Details →
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                disabled={!canNextStep2}
                onClick={() => setStep(3)}
                className="rounded-full bg-brand text-white px-5 py-2 text-xs font-bold hover:bg-brand-dark disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next: Review →
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="rounded-full bg-brand text-white px-5 py-2 text-xs font-bold hover:bg-brand-dark disabled:opacity-40 transition-colors cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Order"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
