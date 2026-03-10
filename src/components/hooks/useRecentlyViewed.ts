"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addViewedProduct,
  getViewedProducts,
  syncViewedProducts,
  type ViewedProductItem,
} from "@/lib/viewedApi";
import { useAuthStore } from "@/store/auth";
import { normalizeImageUrl } from "@/lib/imageUtils";

const STORAGE_KEY = "recently_viewed";
const MAX_LOCAL_ITEMS = 12;
const SYNCED_KEY = "recently_viewed_synced";

export interface LocalViewedItem {
  id: string;
  slug: string;
  name: string;
  price: string;
  mainImageUrl?: string;
  ratingAverage?: number;
  ratingCount?: number;
  categories?: Array<{ id: string; name: string; slug: string }>;
  viewedAt: string;
}

function loadFromStorage(): LocalViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalViewedItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: LocalViewedItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function clearStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SYNCED_KEY);
  } catch {}
}

/** Очистити прапорець синхронізації (викликати при виході) */
export function clearSyncFlag() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SYNCED_KEY);
  } catch {}
}

/** Додати поточний товар до списку переглянутих (викликати при відкритті сторінки товару) */
export function trackView(
  productId: string,
  productSnapshot?: {
    slug: string;
    name: string;
    price?: string | number;
    images?: Array<{ src?: string }>;
    mainImageUrl?: string;
    ratingAverage?: number;
    ratingCount?: number;
    categories?: Array<{ id: string; name: string; slug: string }>;
  }
) {
  const token = useAuthStore.getState().token;

  // Для авторизованих (з токеном) — надсилаємо на бекенд
  if (token) {
    addViewedProduct(productId).catch(() => {});
  }

  // Завжди зберігаємо в localStorage (аноніми — основний джерело, авторизовані — кеш/резерв)
  if (!productSnapshot) return;
  const slug = productSnapshot.slug;
  if (!slug) return;

  const items = loadFromStorage();
  const now = new Date().toISOString();
  const newItem: LocalViewedItem = {
    id: productId,
    slug,
    name: productSnapshot.name,
    price: String(productSnapshot.price ?? 0),
    mainImageUrl:
      productSnapshot.mainImageUrl ??
      normalizeImageUrl(productSnapshot.images?.[0]?.src),
    ratingAverage: productSnapshot.ratingAverage,
    ratingCount: productSnapshot.ratingCount,
    categories: productSnapshot.categories?.map((c) => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
    })),
    viewedAt: now,
  };

  const filtered = items.filter((x) => x.id !== productId);
  const updated = [newItem, ...filtered].slice(0, MAX_LOCAL_ITEMS);
  saveToStorage(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("recently-viewed-updated"));
  }
}

/** Синхронізувати localStorage з бекендом після логіну (викликати один раз) */
export async function syncWithServer(): Promise<void> {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SYNCED_KEY) === "1") return;

  const items = loadFromStorage();
  if (items.length === 0) {
    localStorage.setItem(SYNCED_KEY, "1");
    return;
  }

  try {
    await syncViewedProducts(items.map((x) => x.id));
    clearStorage();
    localStorage.setItem(SYNCED_KEY, "1");
  } catch {
    // Якщо помилка - не очищаємо, спробуємо пізніше
  }
}

function toDisplayItem(
  p: ViewedProductItem | LocalViewedItem
): {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  ratingAverage?: number;
  ratingCount?: number;
  category?: string;
} {
  const img =
    "mainImageUrl" in p ? p.mainImageUrl : (p as LocalViewedItem).mainImageUrl;
  const cats = "categories" in p ? p.categories : (p as LocalViewedItem).categories;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(typeof p.price === "string" ? p.price : p.price) || 0,
    image: normalizeImageUrl(img),
    ratingAverage:
      "ratingAverage" in p ? p.ratingAverage : (p as LocalViewedItem).ratingAverage,
    ratingCount:
      "ratingCount" in p ? p.ratingCount : (p as LocalViewedItem).ratingCount,
    category: cats?.[0]?.name,
  };
}

export function useRecentlyViewed(currentProductSlug?: string) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const queryClient = useQueryClient();
  const [localItems, setLocalItems] = useState<LocalViewedItem[]>([]);

  const token = useAuthStore((s) => s.token);
  const hasValidAuth = !!(isLoggedIn && token);

  const apiQuery = useQuery({
    queryKey: ["viewed", "products"],
    queryFn: () => getViewedProducts(MAX_LOCAL_ITEMS),
    enabled: hasValidAuth, // Запит тільки якщо є токен
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!hasValidAuth) {
      setLocalItems(loadFromStorage());
    }
  }, [hasValidAuth]);

  const items: Array<ReturnType<typeof toDisplayItem>> = hasValidAuth
    ? (apiQuery.data ?? []).map(toDisplayItem)
    : localItems.map(toDisplayItem);

  const filtered = items.filter(
    (x) =>
      (currentProductSlug || "").toLowerCase() !== (x.slug || "").toLowerCase()
  );

  useEffect(() => {
    const handler = () => setLocalItems(loadFromStorage());
    window.addEventListener("recently-viewed-updated", handler);
    return () => window.removeEventListener("recently-viewed-updated", handler);
  }, []);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["viewed", "products"] });
    if (!hasValidAuth) setLocalItems(loadFromStorage());
  }, [hasValidAuth, queryClient]);

  return {
    items: filtered.slice(0, 12),
    isLoading: hasValidAuth ? apiQuery.isLoading : false,
    invalidate,
  };
}
