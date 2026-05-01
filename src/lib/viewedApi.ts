/**
 * API для історії переглянутих товарів.
 * Авторизовані: зберігається на бекенді.
 * Аноніми: localStorage (ключ recently_viewed).
 */

const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api`;
// Маршрути: /api/viewed, /api/viewed/sync
const VIEWED_BASE = `${BASE}/viewed`;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("bfb_token") ||
    localStorage.getItem("bfb_token_old") ||
    localStorage.getItem("accessToken")
  );
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface ViewedProductItem {
  id: string;
  name: string;
  slug: string;
  price: string;
  ratingAverage?: number;
  ratingCount?: number;
  mainImageUrl?: string;
  categories?: Array<{ id: string; name: string; slug: string }>;
  viewedAt?: string;
}

export interface GetViewedResponse {
  items: ViewedProductItem[];
}

/** Додати/оновити перегляд товару (тільки для авторизованих з валідним токеном) */
export async function addViewedProduct(productId: string): Promise<void> {
  if (!getToken()) return; // Не робити запит без токена
  const res = await fetch(VIEWED_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) {
    if (res.status === 401) return; // Токен недійсний — тихо ігноруємо
    const text = await res.text();
    throw new Error(text || `Failed to add viewed: ${res.status}`);
  }
}

/** Отримати список переглянутих товарів (тільки для авторизованих з токеном) */
export async function getViewedProducts(
  limit = 12
): Promise<ViewedProductItem[]> {
  if (!getToken()) return []; // Не робити запит без токена — використовувати localStorage
  const res = await fetch(`${VIEWED_BASE}?limit=${limit}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error(`Failed to get viewed: ${res.status}`);
  }
  const data = (await res.json()) as GetViewedResponse;
  return data?.items ?? [];
}

/** Синхронізувати масив ID з localStorage після логіну */
export async function syncViewedProducts(
  productIds: string[]
): Promise<void> {
  if (productIds.length === 0 || !getToken()) return;
  const res = await fetch(`${VIEWED_BASE}/sync`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ productIds }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to sync viewed: ${res.status}`);
  }
}
