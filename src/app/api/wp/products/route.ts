import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(`${API_BASE}/api/catalog/products`);
    const incoming = new URL(req.url);
    incoming.searchParams.forEach((v, k) => {
      url.searchParams.set(k, v);
    });


    const upstreamRes = await fetch(url.toString(), {
      cache: "no-store",
    });
    const text = await upstreamRes.text();


    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "wp products error" }, { status: 500 });
  }
}
