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

    return NextResponse.json({
      ok: true,
      reference,
      whatsapp_link,
    });
  } catch (err) {
    console.error("Order submission error:", err);
    return NextResponse.json(
      { error: "Could not submit order. Please try again." },
      { status: 500 }
    );
  }
}
