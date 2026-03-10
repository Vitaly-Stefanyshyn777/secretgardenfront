import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    const body = await req.json();
    const res = await fetch(`${API_BASE}/api/auth/validate-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Validate code error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
