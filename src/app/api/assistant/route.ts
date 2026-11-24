import { NextRequest, NextResponse } from "next/server";

const ASSISTANT_API_URL = (
  process.env.ASSISTANT_API_URL || "http://130.61.183.243"
).replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(`${ASSISTANT_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error("Assistant proxy error:", err);
    return NextResponse.json(
      {
        answer:
          "Sorry, I couldn't reach our sales assistant right now. Please chat with us directly on WhatsApp (0716 335555).",
        products: [],
        whatsapp_shortlist_link: "https://wa.me/254716335555",
      },
      { status: 502 }
    );
  }
}
