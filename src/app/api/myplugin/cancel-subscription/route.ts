import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;

export async function POST(request: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json(
        { error: "Missing API_BASE" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as { user_id?: number };

    if (!Number.isFinite(body?.user_id) || (body.user_id as number) <= 0) {
      return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
    }

    // Ендпоінт може бути відкритим, але якщо в нас є Basic Auth — краще додати.
    const basicUser = process.env.WC_CONSUMER_KEY;
    const basicPass = process.env.WC_CONSUMER_SECRET;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (basicUser && basicPass) {
      headers.Authorization =
        "Basic " + Buffer.from(`${basicUser}:${basicPass}`).toString("base64");
    }

    const upstreamRes = await fetch(
      `${API_BASE}/wp-json/myplugin/v1/cancel-subscription`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const text = await upstreamRes.text();

    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

