import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

function getAuthToken(req: NextRequest): string | null {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const userCookie = req.cookies.get("bfb_user_jwt")?.value;
  return auth || userCookie || null;
}

/** POST /api/wishlist/sync — проксі до NestJS POST /api/wishlist/sync */
export async function POST(req: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json(
        { error: "Server configuration error" },
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
    const rawItems = body?.items ?? body?.productIds ?? body?.product_ids;
    const toStr = (v: unknown): string | undefined =>
      v != null && v !== "" ? String(v).trim() : undefined;

    const items: Array<{ productId?: string; slug?: string }> = [];
    if (Array.isArray(rawItems)) {
      for (const it of rawItems) {
        if (it && typeof it === "object") {
          const productId = toStr(it.productId ?? it.product_id);
          const slug = toStr(it.slug);
          if (productId || slug) {
            items.push({
              ...(productId ? { productId } : {}),
              ...(slug ? { slug } : {}),
            });
          }
        } else if (it != null) {
          const s = toStr(it);
          if (s) items.push(/^c[a-z0-9]{10,}$/i.test(s) || /^\d+$/.test(s) ? { productId: s } : { slug: s });
        }
      }
    } else if (Array.isArray(body?.productIds ?? body?.product_ids)) {
      const ids = (body.productIds ?? body.product_ids) as unknown[];
      for (const id of ids) {
        const s = toStr(id);
        if (s) items.push({ productId: s });
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };

    const res = await fetch(`${API_BASE}/api/wishlist/sync`, {
      method: "POST",
      headers,
      body: JSON.stringify({ items }),
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
        error: "Wishlist sync error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
