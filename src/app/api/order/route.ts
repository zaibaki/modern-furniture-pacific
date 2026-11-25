import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_NUMBER = "254716335555";

interface OrderPayload {
  productTitle: string;
  productHandle: string;
  productPrice: string;
  option?: string;
  quantity?: number;
  customerName: string;
  phone: string;
  location: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<OrderPayload>;
    const name = body.customerName?.trim();
    const phone = body.phone?.trim();
    const location = body.location?.trim();
    const title = body.productTitle?.trim();

    if (!name || !phone || !location || !title) {
      return NextResponse.json(
        { error: "Name, phone, delivery location, and product are required." },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Number(body.quantity || 1));
    const reference = `MFP-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const lines = [
      `Hi Modern Furniture Pacific, I just submitted an order (${reference}):`,
      `• Item: ${title} (${body.productPrice || ""})`,
      body.option ? `• Option/Size: ${body.option}` : null,
      `• Quantity: ${qty}`,
      `• Name: ${name}`,
      `• Phone: ${phone}`,
      `• Delivery Location: ${location}`,
      body.notes?.trim() ? `• Notes: ${body.notes.trim()}` : null,
    ].filter(Boolean);

    const whatsapp_link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;

    const supabaseUrl = (
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      ""
    ).replace(/\/$/, "");
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    let persisted = false;
    if (supabaseUrl && supabaseKey) {
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          reference,
          product_handle: body.productHandle?.trim() || "unknown",
          product_title: title,
          product_price: body.productPrice?.trim() || null,
          option: body.option?.trim() || null,
          quantity: qty,
          customer_name: name,
          phone,
          location,
          notes: body.notes?.trim() || null,
          status: "new",
          whatsapp_link,
        }),
      });
      persisted = insertRes.ok;
      if (!insertRes.ok) {
        console.error("Supabase order insert failed:", await insertRes.text());
      }
    }

    return NextResponse.json({
      ok: true,
      reference,
      whatsapp_link,
      persisted,
    });
  } catch (err) {
    console.error("Order submission error:", err);
    return NextResponse.json(
      { error: "Could not submit order. Please try again." },
      { status: 500 }
    );
  }
}
