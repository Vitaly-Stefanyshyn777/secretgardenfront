import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE;

async function getUserIdFromToken(token: string): Promise<number | null> {
  try {
    const response = await fetch(`${UPSTREAM_BASE}/wp-json/wp/v2/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (response.ok) {
      const userData = await response.json();
      return userData?.id || null;
    }
    return null;
  } catch {
    return null;
  }
}

function getAuthToken(req: NextRequest): string | null {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const userCookie = req.cookies.get("bfb_user_jwt")?.value;
  return auth || userCookie || null;
}

function buildHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return headers;
}

export interface SyncCartItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
}

/** POST /api/cart/sync — синхронізація всього кошика одним запитом */
export async function POST(req: NextRequest) {
  try {
    if (!UPSTREAM_BASE) {
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

    const body = (await req.json()) as {
      items?: Array<{
        product_id?: number;
        productId?: string | number;
        variation_id?: number;
        variationId?: number;
        quantity: number;
      }>;
    };
    const raw = Array.isArray(body?.items) ? body.items : [];
    const items: SyncCartItem[] = raw
      .filter((it) => it && typeof it.quantity === "number" && it.quantity > 0)
      .map((it) => {
        const pid = it.product_id ?? it.productId;
        const id = typeof pid === "string" ? parseInt(pid, 10) : pid;
        return {
          product_id: Number(id) || 0,
          variation_id: it.variation_id ?? it.variationId ?? 0,
          quantity: it.quantity,
        };
      })
      .filter((it) => it.product_id > 0);

    const headers = buildHeaders(token);
    const tokenToValidate = token.replace(/^Bearer\s+/i, "");
    const userId = await getUserIdFromToken(tokenToValidate);

    if (userId) {
      headers["X-User-ID"] = String(userId);
    }

    const baseUrl = `${UPSTREAM_BASE}/wp-json/wp/v2/sl_cart`;
    const query = userId ? `?user_id=${userId}` : "";

    // 1. Очистити кошик
    const clearRes = await fetch(`${UPSTREAM_BASE}/wp-json/wp/v2/sl_cart/clear${query}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });
    if (!clearRes.ok) {
      const text = await clearRes.text();
      return NextResponse.json(
        { error: "Failed to clear cart", details: text },
        { status: 500 }
      );
    }

    // 2. Додати кожен товар
    for (const item of items) {
      if (item.quantity <= 0 || !item.product_id) continue;
      const addRes = await fetch(`${baseUrl}${query}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_id: item.product_id,
          quantity: item.quantity,
          variation_id: item.variation_id ?? 0,
          user_id: userId,
        }),
        cache: "no-store",
      });
      if (!addRes.ok) {
        const text = await addRes.text();
        console.warn("Cart sync add item failed:", item, text);
      }
    }

    // 3. Отримати оновлений кошик
    const getRes = await fetch(`${baseUrl}${userId ? `?user_id=${userId}` : ""}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    if (!getRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch cart after sync" },
        { status: 500 }
      );
    }

    const cartData = await getRes.json();
    return NextResponse.json(cartData);
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
