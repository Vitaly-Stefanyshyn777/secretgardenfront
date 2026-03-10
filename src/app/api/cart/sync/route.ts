import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthToken(req: NextRequest): string | null {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const userCookie = req.cookies.get("bfb_user_jwt")?.value;
  return auth || userCookie || null;
}

/** POST /api/cart/sync — проксі до NestJS POST /api/cart/sync */
export async function POST(req: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "NEXT_PUBLIC_API_BASE_URL не задано в .env",
        },
        { status: 500 }
      );
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token provided" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    const toStr = (v: unknown): string | undefined => {
      if (v == null || v === "") return undefined;
      const s = String(v).trim();
      return s === "" ? undefined : s;
    };

    const nestItems = items
      .filter((it) => it && (it.quantity ?? 0) > 0)
      .map((it) => {
        const productId = toStr(it.productId ?? it.product_id);
        const slug = toStr(it.slug);
        if (!productId && !slug) return null;
        return {
          ...(productId ? { productId } : {}),
          ...(slug ? { slug } : {}),
          quantity: typeof it.quantity === "number" && it.quantity > 0 ? it.quantity : 1,
        };
      })
      .filter((i): i is { productId?: string; slug?: string; quantity: number } => i != null && (!!i.productId || !!i.slug));

    const nestUrl = `${API_BASE.replace(/\/$/, "")}/api/cart/sync`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };

    const res = await fetch(nestUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ items: nestItems }),
      cache: "no-store",
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Cart sync error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
