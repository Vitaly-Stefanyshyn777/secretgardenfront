import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getUserIdFromToken(token: string): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE}/wp-json/wp/v2/users/me`, {
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

/** Резолвить slug товару в product_id через каталог API */
async function resolveSlugToProductId(_slug: string, _token: string): Promise<number | null> {
  const catalogBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL;
  if (!catalogBase) return null;
  try {
    const base = catalogBase.replace(/\/$/, "");
    const url = `${base}/api/catalog/products/${encodeURIComponent(_slug)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const raw = await res.json();
    const data = raw?.data ?? raw;
    const id = data?.id ?? data?.wooProductId ?? data?.woo_product_id;
    if (id != null && !isNaN(Number(id))) return Number(id);
    if (typeof id === "string" && /^\d+$/.test(id)) return parseInt(id, 10);
    return null;
  } catch {
    return null;
  }
}

export interface SyncCartItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
}

const LOG = "[Cart Sync API Route]";

/** POST /api/cart/sync — синхронізація всього кошика одним запитом */
export async function POST(req: NextRequest) {
  try {
    console.log(LOG, "Запит отримано");
    if (!API_BASE) {
      console.error(LOG, "NEXT_PUBLIC_API_BASE_URL не налаштовано в .env");
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "Додайте NEXT_PUBLIC_API_BASE_URL=http://ваш-бекенд в .env і перезапустіть сервер",
        },
        { status: 500 }
      );
    }

    const token = getAuthToken(req);
    if (!token) {
      console.warn(LOG, "Пропуск: немає токена");
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token provided" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      items?: Array<{
        product_id?: number;
        productId?: string | number;
        slug?: string;
        variation_id?: number;
        variationId?: number;
        quantity: number;
      }>;
    };
    const raw = Array.isArray(body?.items) ? body.items : [];
    console.log(LOG, "Тіло запиту:", { rawCount: raw.length, raw });

    const pendingItems: SyncCartItem[] = [];

    for (const it of raw) {
      if (!it || typeof it.quantity !== "number" || it.quantity <= 0) continue;
      const qty = it.quantity;
      const variationId = it.variation_id ?? it.variationId ?? 0;
      const pid = it.product_id ?? it.productId;
      const numPid = typeof pid === "string" ? parseInt(pid, 10) : pid;
      if (numPid && !isNaN(numPid)) {
        pendingItems.push({ product_id: numPid, variation_id: variationId, quantity: qty });
      } else if (it.slug && String(it.slug).trim()) {
        const productId = await resolveSlugToProductId(it.slug.trim(), token);
        if (productId) {
          pendingItems.push({ product_id: productId, variation_id: variationId, quantity: qty });
          console.log(LOG, "Резолв slug", it.slug, "-> product_id", productId);
        } else {
          console.warn(LOG, "Не вдалося резолвити slug:", it.slug);
        }
      }
    }

    const items = pendingItems.filter((it) => it.product_id > 0);
    console.log(LOG, "Items для sync:", { count: items.length, items });

    const headers = buildHeaders(token);
    const tokenToValidate = token.replace(/^Bearer\s+/i, "");
    const userId = await getUserIdFromToken(tokenToValidate);

    if (userId) {
      headers["X-User-ID"] = String(userId);
    }

    const baseUrl = `${API_BASE}/wp-json/wp/v2/sl_cart`;
    const query = userId ? `?user_id=${userId}` : "";

    // 1. Очистити кошик
    const clearRes = await fetch(`${API_BASE}/wp-json/wp/v2/sl_cart/clear${query}`, {
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
    console.log(LOG, "Успішно", { itemsInResponse: cartData?.items?.length ?? 0 });
    return NextResponse.json(cartData);
  } catch (error) {
    console.error(LOG, "Помилка:", error);
    return NextResponse.json(
      {
        error: "Cart sync error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
