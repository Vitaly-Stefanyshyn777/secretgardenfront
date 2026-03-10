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

/** POST /api/wishlist/sync — синхронізація улюбленого одним запитом */
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

    const body = (await req.json()) as {
      product_ids?: (number | string)[];
      productIds?: (number | string)[];
    };
    const raw =
      body?.productIds ?? body?.product_ids ?? [];
    const productIds: number[] = (Array.isArray(raw) ? raw : [])
      .map((id) => (typeof id === "string" ? parseInt(id, 10) : Number(id)))
      .filter((id) => !isNaN(id) && id > 0);

    const headers = buildHeaders(token);
    const tokenToValidate = token.replace(/^Bearer\s+/i, "");
    const userId = await getUserIdFromToken(tokenToValidate);

    if (userId) {
      headers["X-User-ID"] = String(userId);
    }

    const baseUrl = `${API_BASE}/wp-json/wp/v2/sl_wish_list`;
    const query = userId ? `?user_id=${userId}` : "";

    // 1. Отримати поточний wishlist
    const getRes = await fetch(`${baseUrl}${query}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const currentData = getRes.ok ? await getRes.json() : { items: [] };
    const currentIds = new Set<number>(
      (currentData.items || []).map(
        (i: { product_id?: number }) => Number(i?.product_id ?? 0)
      )
    );
    const desiredIds = new Set(productIds);

    const toAdd = [...desiredIds].filter((id: number) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id: number) => !desiredIds.has(id));

    // 2. Видалити зайві
    for (const productId of toRemove) {
      const deleteUrl = `${API_BASE}/wp-json/wp/v2/sl_wish_list/${productId}${userId ? `?user_id=${userId}` : ""}`;
      await fetch(deleteUrl, {
        method: "DELETE",
        headers,
        cache: "no-store",
      });
    }

    // 3. Додати нові
    for (const productId of toAdd) {
      await fetch(`${baseUrl}${query}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_id: productId,
          variation_id: 0,
          user_id: userId,
        }),
        cache: "no-store",
      });
    }

    // 4. Повернути оновлений wishlist
    const finalRes = await fetch(`${baseUrl}${query}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    if (!finalRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch wishlist after sync" },
        { status: 500 }
      );
    }

    const wishlistData = await finalRes.json();
    return NextResponse.json(wishlistData);
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
