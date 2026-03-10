import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getWishlist,
  syncWishlist as syncWishlistApi,
  checkWishlistItem,
  type WishlistItemResponse,
  type WishlistApiItem,
} from "@/lib/bfbApi";
import { useAuthStore } from "./auth";

const isCuidLike = (v: string): boolean => /^c[a-z0-9]{10,}$/i.test(String(v).trim());

const getUserFavoritesKey = (userId?: string | null) =>
  userId ? `bfb-favorites-${userId}` : "bfb-favorites";

const loadUserFavorites = (
  userId?: string | null
): Record<string, FavoriteItem> => {
  if (!userId || typeof window === "undefined") return {};
  try {
    const key = getUserFavoritesKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored).items || {} : {};
  } catch {
    return {};
  }
};

const saveUserFavorites = (
  userId: string | null | undefined,
  items: Record<string, FavoriteItem>
) => {
  if (!userId || typeof window === "undefined") return;
  try {
    const key = getUserFavoritesKey(userId);
    localStorage.setItem(key, JSON.stringify({ items }));
  } catch {}
};

export interface FavoriteItem {
  id: string;
  slug?: string;
  name: string;
  price?: number;
  image?: string;
  originalPrice?: number;
  regularPrice?: number;
  salePrice?: number;
  discount?: number;
  isNew?: boolean;
  isHit?: boolean;
  variationId?: number;
  color?: string;
  size?: string;
  stockQuantity?: number | null;
  productType?: string;
  variations?: number[];
  metaData?: Array<{ key: string; value: string }>;
  wcProduct?: {
    prices?: {
      price: string;
      regular_price: string;
      sale_price: string;
    };
    on_sale?: boolean;
  };
}

const baseKey = (item: WishlistItemResponse | WishlistApiItem): string => {
  const api = item as WishlistApiItem;
  if (api.productId) return api.productId;
  if (api.product?.id) return api.product.id;
  if (api.product?.slug) return api.product.slug;
  const old = item as WishlistItemResponse;
  if (old.product_id != null) return String(old.product_id);
  return "unknown";
};

const mapWishlistItemResponseToFavoriteItem = (
  item: WishlistItemResponse | WishlistApiItem,
  existingItem?: FavoriteItem
): FavoriteItem => {
  const productId = (item as WishlistApiItem).productId ?? (item as WishlistItemResponse).product_id?.toString();
  const product = (item as WishlistApiItem).product;
  const id = productId ?? product?.id ?? product?.slug ?? "unknown";
  const name = product?.name ?? (item as WishlistItemResponse).product_name ?? "";
  const price = product?.price != null ? parseFloat(String(product.price)) : parseFloat((item as WishlistItemResponse).product_price ?? "0");
  const image = product?.mainImageUrl ?? (item as WishlistItemResponse).product_image;
  const slug = product?.slug ?? existingItem?.slug;
  return {
    id: String(id),
    name,
    price: Number.isFinite(price) ? price : 0,
    image,
    slug,
    originalPrice: existingItem?.originalPrice,
    discount: existingItem?.discount,
    isNew: existingItem?.isNew,
    isHit: existingItem?.isHit,
    variationId: existingItem?.variationId,
    color: existingItem?.color,
    size: existingItem?.size,
    stockQuantity: existingItem?.stockQuantity,
    productType: existingItem?.productType,
    variations: existingItem?.variations,
    wcProduct: existingItem?.wcProduct,
  };
};

interface FavoriteState {
  items: Record<string, FavoriteItem>;
  currentUserId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  pendingFavoritesSync: boolean;
  open: () => void;
  close: () => void;
  syncAndClose: () => Promise<void>;
  toggle: () => void;
  syncFavoritesToApi: () => Promise<void>;
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  removeAll: (ids: string[]) => Promise<void>;
  loadUserData: (userId: string | null) => Promise<void>;
  setUserId: (userId: string | null) => void;
  syncFromApi: () => Promise<void>;
  checkIsFavorite: (productId: number) => Promise<boolean>;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      items: {},
      currentUserId: null,
      isOpen: false,
      isLoading: false,
      pendingFavoritesSync: false,
      open: () => set({ isOpen: true }),
      close: () => {
        const state = get();
        if (
          state.pendingFavoritesSync &&
          state.currentUserId &&
          useAuthStore.getState().token
        ) {
          get().syncFavoritesToApi();
        }
        set({ isOpen: false });
      },
      syncAndClose: async () => {
        const state = get();
        const token =
          useAuthStore.getState().token ||
          (typeof window !== "undefined" &&
            (localStorage.getItem("bfb_token") ||
              localStorage.getItem("bfb_token_old")));
        if (!token) {
          console.warn("[Favorites syncAndClose] Немає токена — тільки закриття");
          set({ isOpen: false });
          return;
        }
        // Якщо змін не було — не робимо запит (користувач лише переглядав)
        if (!state.pendingFavoritesSync) {
          set({ isOpen: false });
          return;
        }
        try {
          console.log("[Favorites syncAndClose] Викликаю syncFavoritesToApi…");
          await get().syncFavoritesToApi();
        } catch (err) {
          const msg =
            err && typeof err === "object" && "response" in err
              ? (err as { response?: { data?: unknown } }).response?.data
              : err;
          console.error("[Favorites Sync] Помилка:", msg ?? err);
        } finally {
          set({ isOpen: false });
        }
      },
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      syncFavoritesToApi: async () => {
        const state = get();
        const authState = useAuthStore.getState();
        const token =
          authState.token ||
          (typeof window !== "undefined" &&
            (localStorage.getItem("bfb_token") ||
              localStorage.getItem("bfb_token_old")));
        if (!token) return;
        const favItems = Object.values(state.items);
        const syncItems = favItems
          .filter((f) => f.id || f.slug)
          .map((f) => {
            const idStr = String(f.id ?? "").trim();
            const slugStr = f.slug ? String(f.slug).trim() : undefined;
            if (isCuidLike(idStr) || /^\d+$/.test(idStr)) {
              return { productId: idStr, slug: slugStr };
            }
            if (slugStr) return { slug: slugStr };
            return { slug: idStr || undefined };
          })
          .filter((i) => i.productId || i.slug);
        try {
          set({ isLoading: true, pendingFavoritesSync: false });
          console.log("[Favorites syncFavoritesToApi] POST /api/wishlist/sync, items:", syncItems.length);
          const wishlistData = await syncWishlistApi(syncItems);
          const currentItems = get().items;
          const itemsMap: Record<string, FavoriteItem> = {};
          const apiItems = wishlistData.items || [];
          apiItems.forEach((apiItem: WishlistItemResponse | WishlistApiItem) => {
            const key = baseKey(apiItem);
            const base = mapWishlistItemResponseToFavoriteItem(
              apiItem,
              currentItems[key]
            );
            itemsMap[base.id] = base;
          });
          set({ items: itemsMap, isLoading: false });
        } catch {
          set({ pendingFavoritesSync: true, isLoading: false });
        }
      },
      setUserId: (userId: string | null) => {
        const state = get();
        if (state.currentUserId && state.currentUserId !== userId) {
          saveUserFavorites(state.currentUserId, state.items);
        }
        set({ currentUserId: userId });
      },
      loadUserData: async (userId: string | null) => {
        const state = get();
        // При логауті (userId === null) не зберігаємо дані, а очищуємо
        if (state.currentUserId && state.currentUserId !== userId && userId !== null) {
          saveUserFavorites(state.currentUserId, state.items);
        }

        const authState = useAuthStore.getState();
        const token =
          authState.token ||
          (typeof window !== "undefined" &&
            (localStorage.getItem("bfb_token") ||
              localStorage.getItem("bfb_token_old")));

        if (userId && token) {
          try {
            set({ isLoading: true });
            await new Promise((resolve) => setTimeout(resolve, 100));

            const wishlistData = await getWishlist();
            const apiItemsRaw = wishlistData.items || [];
            if (typeof window !== "undefined") {
              console.log("[Favorites loadUserData] GET /api/wishlist →", apiItemsRaw.length, "items");
            }
            const currentItems = state.items;
            const itemsMap: Record<string, FavoriteItem> = {};

            apiItemsRaw.forEach(
              (apiItem: WishlistItemResponse | WishlistApiItem) => {
                const key = baseKey(apiItem);
                const base = mapWishlistItemResponseToFavoriteItem(
                  apiItem,
                  currentItems[key]
                );
                itemsMap[base.id] = base;
              }
            );

            set({
              items: itemsMap,
              currentUserId: userId,
              isLoading: false,
            });
            if (typeof window !== "undefined") {
              console.log("[Favorites loadUserData] Завантажено з API:", Object.keys(itemsMap).length, "items");
            }
          } catch (error: any) {
            const is401 =
              error?.response?.status === 401 ||
              error?.message?.includes("401");
            console.warn("[Favorites loadUserData] Помилка API:", is401 ? "401" : error?.message, "→ fallback localStorage");
            const userItems = loadUserFavorites(userId);
            set({ items: userItems, currentUserId: userId, isLoading: false });
          }
        } else {
          if (typeof window !== "undefined" && userId) {
            console.warn("[Favorites loadUserData] Пропуск API: userId=", !!userId, "token=", !!token, "→ fallback localStorage");
          }
          // При логауті (userId === null) очищуємо улюблені повністю
          if (userId === null) {
            set({ items: {}, currentUserId: null });
            // Очищуємо всі дані з localStorage
            if (typeof window !== "undefined") {
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith("bfb-favorites")) {
                  localStorage.removeItem(key);
                }
              });
            }
          } else {
            const userItems = loadUserFavorites(userId);
            set({ items: userItems, currentUserId: userId });
          }
        }
      },
      syncFromApi: async () => {
        const { currentUserId } = get();
        const { token } = useAuthStore.getState();
        if (!currentUserId || !token) return;

        try {
          const wishlistData = await getWishlist();
          const currentItems = get().items;
          const itemsMap: Record<string, FavoriteItem> = {};

          (wishlistData.items || []).forEach(
            (apiItem: WishlistItemResponse | WishlistApiItem) => {
              const key = baseKey(apiItem);
              const base = mapWishlistItemResponseToFavoriteItem(
                apiItem,
                currentItems[key]
              );
              itemsMap[base.id] = base;
            }
          );

          set({ items: itemsMap });
        } catch (error) {
          // Fallback to local state on error
        }
      },
      checkIsFavorite: async (productId: number): Promise<boolean> => {
        const { currentUserId } = get();
        const { token } = useAuthStore.getState();
        if (!currentUserId || !token) {
          const state = get();
          return !!state.items[productId.toString()];
        }

        try {
          const result = await checkWishlistItem(productId);
          return result.in_wishlist;
        } catch (error) {
          const state = get();
          return !!state.items[productId.toString()];
        }
      },
      toggleFavorite: async (item: FavoriteItem) => {
        const state = get();
        const { token } = useAuthStore.getState();

        // Підтримуємо CUID, slug і числовий id
        const existing = state.items[item.id];
        const exists = !!existing;

        const next = { ...state.items };
        if (exists) {
          // Видаляємо існуючий товар (за знайденим ключем)
          delete next[item.id];
        } else {
          // Додаємо новий товар
          next[item.id] = item;
        }

        set({ items: next });

        if (state.currentUserId && token) {
          set((s) => ({ ...s, pendingFavoritesSync: true }));
        } else {
          if (state.currentUserId) {
            saveUserFavorites(state.currentUserId, next);
          }
          // Стан вже оновлений вище
        }
      },
      remove: async (id: string) => {
        const state = get();
        const { token } = useAuthStore.getState();

        // Негайне оновлення UI стану для кращого UX (підтримуємо CUID, slug, числовий id)
        const next = { ...state.items };
        delete next[id];
        set({ items: next });

        if (state.currentUserId && token) {
          set((s) => ({ ...s, pendingFavoritesSync: true }));
        }
        if (state.currentUserId) {
          saveUserFavorites(state.currentUserId, next);
        }
      },
      removeAll: async (ids: string[]) => {
        const state = get();
        const { token } = useAuthStore.getState();

        const next = { ...state.items };
        ids.forEach((id) => delete next[id]);
        set({ items: next });

        if (state.currentUserId && token) {
          set((s) => ({ ...s, pendingFavoritesSync: true }));
        }
        if (state.currentUserId) {
          saveUserFavorites(state.currentUserId, next);
        }
      },
      clear: async () => {
        const state = get();
        const { token } = useAuthStore.getState();

        set({ items: {} });

        if (state.currentUserId && token) {
          set((s) => ({ ...s, pendingFavoritesSync: true }));
        }
        if (state.currentUserId) {
          saveUserFavorites(state.currentUserId, {});
        }
      },
    }),
    {
      name: "bfb-favorites",
      partialize: (s) => ({
        items: s.items,
        currentUserId: s.currentUserId,
      }),
    }
  )
);

export const selectFavorites = (s: FavoriteState) => Object.values(s.items);
export const selectIsFavorite = (id: string) => (s: FavoriteState) =>
  !!s.items[id];
