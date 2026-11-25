"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface OrderRow {
  id: string;
  reference: string;
  product_handle: string;
  product_title: string;
  product_price: string | null;
  option: string | null;
  quantity: number;
  customer_name: string;
  phone: string;
  location: string;
  notes: string | null;
  status: string;
  whatsapp_link: string | null;
  created_at: string;
}

const STATUSES = [
  "new",
  "contacted",
  "confirmed",
  "dispatched",
  "completed",
  "cancelled",
] as const;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-brand/15 text-brand border-brand/30",
  contacted: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  dispatched: "bg-purple-100 text-purple-800 border-purple-300",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-neutral-200 text-neutral-700 border-neutral-300",
};

export default function AdminOrdersPage() {
  const [passcode, setPasscode] = useState("");
  const [authKey, setAuthKey] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-key": key },
      });
      if (res.status === 401) {
        sessionStorage.removeItem("mfp_admin_key");
        setAuthKey(null);
        setError("Invalid passcode.");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load orders.");
        return;
      }
      setAuthKey(key);
      sessionStorage.setItem("mfp_admin_key", key);
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setError("Network error while loading orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("mfp_admin_key");
    if (!saved) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/orders", {
          headers: { "x-admin-key": saved },
        });
        if (!active) return;
        if (res.status === 401) {
          sessionStorage.removeItem("mfp_admin_key");
          return;
        }
        const data = await res.json();
        if (res.ok && active) {
          setAuthKey(saved);
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch {
        // ignore initial auto-login network error
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleStatusChange(id: string, status: string) {
    if (!authKey) return;
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": authKey,
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filterStatus !== "all" && o.status !== filterStatus) return false;
      if (!q) return true;
      return (
        o.reference.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        o.product_title.toLowerCase().includes(q)
      );
    });
  }, [orders, filterStatus, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of STATUSES) c[s] = 0;
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [orders]);

  if (!authKey) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="rounded-3xl bg-white border border-peach-dark p-6 shadow-sm space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Modern Furniture Pacific
            </p>
            <h1 className="text-2xl font-extrabold text-ink mt-1">
              Admin Order Portal
            </h1>
            <p className="text-sm text-muted mt-1">
              Enter the admin passcode to view and manage customer orders.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadOrders(passcode.trim());
            }}
            className="space-y-3"
          >
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Admin passcode"
              className="w-full rounded-xl bg-cream border border-peach-dark px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
            />
            {error && (
              <p className="text-xs font-semibold text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !passcode.trim()}
              className="w-full rounded-full bg-brand text-white py-2.5 text-sm font-bold hover:bg-brand-dark disabled:opacity-40 transition-colors cursor-pointer"
            >
              {loading ? "Checking..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Live Supabase Orders
          </p>
          <h1 className="text-3xl font-extrabold text-ink">
            Order Management Portal
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadOrders(authKey)}
            disabled={loading}
            className="rounded-full bg-white border border-peach-dark px-4 py-2 text-sm font-semibold hover:border-brand hover:text-brand transition-colors cursor-pointer"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("mfp_admin_key");
              setAuthKey(null);
              setOrders([]);
            }}
            className="rounded-full border border-peach-dark px-4 py-2 text-sm font-semibold text-muted hover:text-ink cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-peach-dark p-4">
          <p className="text-xs text-muted font-semibold">Total Orders</p>
          <p className="text-2xl font-extrabold text-ink mt-1">{counts.all}</p>
        </div>
        <div className="rounded-2xl bg-white border border-peach-dark p-4">
          <p className="text-xs text-muted font-semibold">New</p>
          <p className="text-2xl font-extrabold text-brand mt-1">{counts.new}</p>
        </div>
        <div className="rounded-2xl bg-white border border-peach-dark p-4">
          <p className="text-xs text-muted font-semibold">Confirmed</p>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">
            {counts.confirmed}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-peach-dark p-4">
          <p className="text-xs text-muted font-semibold">Completed</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {counts.completed}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize border transition-colors cursor-pointer ${
                filterStatus === s
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-ink border-peach-dark hover:border-brand"
              }`}
            >
              {s} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ref, customer, phone, product..."
          className="w-full sm:w-72 rounded-full bg-white border border-peach-dark px-4 py-2 text-sm focus:outline-none focus:border-brand"
        />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-peach-dark p-10 text-center text-muted text-sm">
          No orders match your filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white border border-peach-dark shadow-xs">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-peach/60 text-xs uppercase text-muted border-b border-peach-dark">
              <tr>
                <th className="px-4 py-3 font-bold">Ref &amp; Date</th>
                <th className="px-4 py-3 font-bold">Product</th>
                <th className="px-4 py-3 font-bold">Customer</th>
                <th className="px-4 py-3 font-bold">Location &amp; Notes</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-peach-dark/60">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-cream/60">
                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                    <p className="font-mono font-bold text-ink">{o.reference}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <Link
                      href={`/products/${o.product_handle}`}
                      target="_blank"
                      className="font-bold text-ink hover:text-brand"
                    >
                      {o.product_title}
                    </Link>
                    <p className="text-xs text-brand font-bold mt-0.5">
                      {o.product_price || ""} · Qty {o.quantity}
                    </p>
                    {o.option && (
                      <p className="text-xs text-muted mt-0.5">
                        Option: {o.option}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                    <p className="font-bold text-ink">{o.customer_name}</p>
                    <a
                      href={`tel:${o.phone.replace(/[\s-]/g, "")}`}
                      className="text-xs text-brand font-semibold hover:underline"
                    >
                      {o.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3.5 align-top max-w-xs">
                    <p className="font-medium text-ink">{o.location}</p>
                    {o.notes && (
                      <p className="text-xs text-muted mt-0.5">{o.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-bold capitalize cursor-pointer focus:outline-none ${
                        STATUS_STYLES[o.status] || "bg-white border-peach-dark"
                      }`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                    {o.whatsapp_link && (
                      <a
                        href={o.whatsapp_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-[#25D366] text-white px-3 py-1.5 text-xs font-bold hover:brightness-95"
                      >
                        WhatsApp ↗
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
