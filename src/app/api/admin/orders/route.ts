import { NextRequest, NextResponse } from "next/server";

const ALLOWED_STATUSES = new Set([
  "new",
  "contacted",
  "confirmed",
  "dispatched",
  "completed",
  "cancelled",
]);

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSCODE || "mfp-admin-2026";
  const provided = req.headers.get("x-admin-key") || "";
  return provided.length > 0 && provided === expected;
}

function supabaseConfig() {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { url, key };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url, key } = supabaseConfig();
  if (!url || !key) {
    return NextResponse.json(
      { error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 500 }
    );
  }

  const res = await fetch(`${url}/rest/v1/orders?select=*&order=created_at.desc`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: await res.text() },
      { status: res.status }
    );
  }

  const orders = await res.json();
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url, key } = supabaseConfig();
  if (!url || !key) {
    return NextResponse.json(
      { error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 500 }
    );
  }

  const body = (await req.json()) as { id?: string; status?: string };
  if (!body.id || !body.status || !ALLOWED_STATUSES.has(body.status)) {
    return NextResponse.json(
      { error: "Valid order id and status are required." },
      { status: 400 }
    );
  }

  const res = await fetch(
    `${url}/rest/v1/orders?id=eq.${encodeURIComponent(body.id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: body.status,
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: await res.text() },
      { status: res.status }
    );
  }

  const updated = await res.json();
  return NextResponse.json({ order: updated?.[0] || null });
}
