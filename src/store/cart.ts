import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getCart,
  syncCart as syncCartApi,
  type CartItemResponse,
} from "@/lib/bfbApi";
import { useAuthStore } from "./auth";
import { normalizeImageUrl } from "@/lib/imageUtils";
const getUserCartKey = (userId?: string | null) =>
  userId ? `bfb-cart-${userId}` : "bfb-cart";

const productImageCache = new Map<number, string>();

const isUsableImage = (url?: string) => {
  const u = (url || "").trim();
  return u !== "" && u !== "/placeholder.svg";
};

async function hydrateCartItemImages(
  cartItems: CartItemResponse[],
  currentItems: Record<string, CartItem>
) {
  const missingProductIds: number[] = [];

  for (const cartItem of cartItems) {
    const itemId =
      cartItem.variation_id && cartItem.variation_id > 0
        ? cartItem.variation_id.toString()
        : cartItem.product_id.toString();

    const existing = currentItems[itemId];

    if (isUsableImage(cartItem.product_image)) {
      productImageCache.set(
        cartItem.product_id,
        normalizeImageUrl(cartItem.product_image!)
      );
      continue;
    }

    const fromExisting = isUsableImage(existing?.image)
      ? normalizeImageUrl(existing!.image!)
      : undefined;
    const fromCache = productImageCache.get(cartItem.product_id);

    const candidate = fromExisting || fromCache;
    if (candidate) {
      cartItem.product_image = candidate;
      productImageCache.set(cartItem.product_id, candidate);
    } else {
      missingProductIds.push(cartItem.product_id);
    }
  }

  const uniqueMissing = Array.from(new Set(missingProductIds));
  if (uniqueMissing.length === 0) return;

  try {
    const { getProductById } = await import("@/lib/products");
    await Promise.all(
      uniqueMissing.map(async (productId) => {
        try {
          const product = await getProductById(productId.toString());
          const src = product.images?.[0]?.src;
          if (isUsableImage(src)) {
            productImageCache.set(productId, normalizeImageUrl(src));
          }
        } catch {
          // ignore
        }
      })
    );
  } catch {
    // ignore
  }

  for (const cartItem of cartItems) {
    if (!isUsableImage(cartItem.product_image)) {
      const cached = productImageCache.get(cartItem.product_id);
      if (cached) cartItem.product_image = cached;
    }
  }
}

const loadUserCart = (userId?: string | null): Record<string, CartItem> => {
  if (!userId || typeof window === "undefined") return {};
  try {
    const key = getUserCartKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return parsed.items || parsed.state?.items || {};
  } catch {
    return {};
  }
};

const saveUserCart = (
  userId: string | null | undefined,
  items: Record<string, CartItem>
) => {
  if (!userId || typeof window === "undefined") return;
  try {
    const key = getUserCartKey(userId);
    localStorage.setItem(key, JSON.stringify({ items }));
  } catch {}
};

export interface CartItem {
  id: string;
  /**
   * WooCommerce product_id (parent product). Потрібно, щоб коректно тягнути meta_data
   * навіть коли в кошику лежить варіація.
   */
  productId?: number;
  /**
   * Актуальна WooCommerce ціна (price) для відображення/розрахунків у кошику.
   * Для варіативних товарів — ціна обраної варіації.
   */
  wcPrice?: number;
  /**
   * WooCommerce regular_price для відображення/розрахунків у кошику.
   * Для варіативних товарів — regular_price обраної варіації.
   */
  wcRegularPrice?: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  color?: string;
  size?: string;
  originalPrice?: number;
  regularPrice?: number;
  salePrice?: number;
  sku?: string;
  cart_item_key?: string;
  stockQuantity?: number | null;
  variationId?: number;
  metaData?: Array<{ key: string; value: string }>;
}

export interface AddItemData {
  id: string;
  productId?: number;
  wcPrice?: number;
  wcRegularPrice?: number;
  name: string;
  price: number;
  image?: string;
  color?: string;
  size?: string;
  originalPrice?: number;
  regularPrice?: number;
  salePrice?: number;
  sku?: string;
  stockQuantity?: number | null;
  variationId?: number;
  metaData?: Array<{ key: string; value: string }>;
}

interface CartState {
  items: Record<string, CartItem>;
  currentUserId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  pendingCartSync: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  syncCartToApi: () => Promise<void>;
  addItem: (item: AddItemData, qty?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  increment: (id: string, step?: number) => Promise<void>;
  decrement: (id: string, step?: number) => Promise<void>;
  setItemMetaData: (
    id: string,
    metaData: Array<{ key: string; value: string }>
  ) => void;
  setItemWcPrices: (
    id: string,
    prices: { wcPrice?: number; wcRegularPrice?: number }
  ) => void;
  loadUserData: (userId: string | null) => Promise<void>;
  setUserId: (userId: string | null) => void;
  syncFromApi: () => Promise<void>;
  clear: () => Promise<void>;
}

const parsePrice = (priceStr: string | undefined | null): number | undefined => {
  if (!priceStr || priceStr.trim() === "") return undefined;
  const parsed = parseFloat(priceStr);
  return isNaN(parsed) ? undefined : parsed;
};

const mapCartItemResponseToCartItem = (
  item: CartItemResponse,
  existingItem?: CartItem
): CartItem => {
  let finalImage = "";

  if (item.product_image && item.product_image.trim() !== "") {
    finalImage = item.product_image;
  } else if (
    existingItem?.image &&
    existingItem.image.trim() !== "" &&
    existingItem.image !== "/placeholder.svg"
  ) {
    finalImage = existingItem.image;
  } else {
    finalImage = existingItem?.image || "";
  }

  const itemId = item.variation_id && item.variation_id > 0
    ? item.variation_id.toString()
    : item.product_id.toString();

  const priceValue = item.price || item.product_price || "0";
  const productName = item.name || item.product_name || "";
  const productImage = item.image || item.product_image || "";

  return {
    id: itemId,
    productId: item.product_id,
    wcPrice: existingItem?.wcPrice,
    wcRegularPrice: existingItem?.wcRegularPrice,
    name: productName,
    price: parseFloat(priceValue),
    image: finalImage || productImage,
    quantity: item.quantity,
    cart_item_key: item.cart_item_key,
    color: existingItem?.color,
    size: existingItem?.size,
    originalPrice: existingItem?.originalPrice,
    regularPrice:
      parsePrice(item.regular_price ?? item.product_regular_price) ??
      existingItem?.regularPrice,
    salePrice:
      parsePrice(item.sale_price ?? item.product_sale_price) ??
      existingItem?.salePrice,
    sku: existingItem?.sku,
    variationId: item.variation_id && item.variation_id > 0 ? item.variation_id : existingItem?.variationId,
    metaData: existingItem?.metaData,
  };
};

function extractProductId(id: string): number | null {
  if (/^\d+$/.test(id)) {
    return parseInt(id, 10);
  }
  const match = id.match(/(?:course|product)-(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  const numberMatch = id.match(/\d+/);
  if (numberMatch) {
    return parseInt(numberMatch[0], 10);
  }
  return null;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      currentUserId: null,
      isOpen: false,
      isLoading: false,
      pendingCartSync: false,
      open: () => set({ isOpen: true }),
      close: () => {
        const state = get();
        if (state.pendingCartSync && state.currentUserId && useAuthStore.getState().token) {
          get().syncCartToApi();
        }
        set({ isOpen: false });
      },
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      syncCartToApi: async () => {
        const state = get();
        const { token } = useAuthStore.getState();
        if (!state.currentUserId || !token) return;
        const items = Object.values(state.items);
        const syncItems = items.length === 0
          ? []
          : items
              .filter((it) => it.productId && it.quantity > 0)
              .map((it) => ({
                product_id: it.productId!,
                variation_id: it.variationId ?? 0,
                quantity: it.quantity,
              }));
        try {
          set({ isLoading: true, pendingCartSync: false });
          const cartData = await syncCartApi(syncItems);
          const currentItems = get().items;
          const itemsMap: Record<string, CartItem> = {};
          await hydrateCartItemImages(cartData.items, currentItems);
          cartData.items.forEach((item) => {
            const itemId =
              item.variation_id && item.variation_id > 0
                ? item.variation_id.toString()
                : item.product_id.toString();
            const existing = currentItems[itemId];
            const cartItem = mapCartItemResponseToCartItem(item, existing);
            itemsMap[cartItem.id] = cartItem;
          });
          set({ items: itemsMap, isLoading: false });
        } catch {
          set({ pendingCartSync: true, isLoading: false });
        }
      },
      setItemMetaData: (id, metaData) => {
        const state = get();
        const existing = state.items[id];
        if (!existing) return;
        set({
          items: {
            ...state.items,
            [id]: {
              ...existing,
              metaData,
            },
          },
        });
      },
      setItemWcPrices: (id, prices) => {
        const state = get();
        const existing = state.items[id];
        if (!existing) return;
        set({
          items: {
            ...state.items,
            [id]: {
              ...existing,
              wcPrice:
                typeof prices.wcPrice === "number"
                  ? prices.wcPrice
                  : existing.wcPrice,
              wcRegularPrice:
                typeof prices.wcRegularPrice === "number"
                  ? prices.wcRegularPrice
                  : existing.wcRegularPrice,
            },
          },
        });
      },
      setUserId: (userId: string | null) => {
        const state = get();
        if (state.currentUserId && state.currentUserId !== userId) {
          saveUserCart(state.currentUserId, state.items);
        }
        set({ currentUserId: userId });
      },
      loadUserData: async (userId: string | null) => {
        const state = get();
        // При логауті (userId === null) не зберігаємо дані, а очищуємо
        if (
          state.currentUserId &&
          state.currentUserId !== userId &&
          userId !== null
        ) {
          saveUserCart(state.currentUserId, state.items);
        }

        const { token } = useAuthStore.getState();
        const hasTokenInStore = !!token;
        const hasTokenInStorage =
          typeof window !== "undefined" &&
          (!!localStorage.getItem("bfb_token") ||
            !!localStorage.getItem("bfb_token_old"));

        if (userId && hasTokenInStore && hasTokenInStorage) {
          try {
            set({ isLoading: true });
            // Завжди синхронізуємо з API при вході користувача, щоб уникнути застарілих даних
            const cartData = await getCart();
            const currentItems = get().items; // Отримуємо поточні товари
            const itemsMap: Record<string, CartItem> = {};

            await hydrateCartItemImages(cartData.items, currentItems);

            cartData.items.forEach((item) => {
              const itemId = item.variation_id && item.variation_id > 0
                ? item.variation_id.toString()
                : item.product_id.toString();
              const existing = currentItems[itemId];

              const cartItem = mapCartItemResponseToCartItem(item, existing);
              itemsMap[cartItem.id] = cartItem;
            });
            set({ items: itemsMap, currentUserId: userId, isLoading: false });
          } catch (error) {
            const userItems = loadUserCart(userId);
            set({ items: userItems, currentUserId: userId, isLoading: false });
          }
        } else {
          // При логауті (userId === null) очищуємо кошик повністю
          if (userId === null) {
            set({ items: {}, currentUserId: null });
            // Очищуємо всі дані з localStorage
            if (typeof window !== "undefined") {
              Object.keys(localStorage).forEach((key) => {
                if (key.startsWith("bfb-cart")) {
                  localStorage.removeItem(key);
                }
              });
            }
          } else {
            const userItems = loadUserCart(userId);
            set({ items: userItems, currentUserId: userId });
          }
        }
      },
      syncFromApi: async () => {
        const { currentUserId } = get();
        const { token } = useAuthStore.getState();
        if (!currentUserId || !token) return;

        try {
          const cartData = await getCart();
          const currentItems = get().items;
          const itemsMap: Record<string, CartItem> = {};

          await hydrateCartItemImages(cartData.items, currentItems);

          cartData.items.forEach((item) => {
            const existing = currentItems[item.product_id.toString()];

            const cartItem = mapCartItemResponseToCartItem(item, existing);
            itemsMap[cartItem.id] = cartItem;
          });
          set({ items: itemsMap });
        } catch (error) {
          // Fallback to local state on error
        }
      },
      addItem: async (item, qty = 1) => {
        const state = get();
        const { token } = useAuthStore.getState();
        
        // Для варіацій: item.id може бути variation_id, тому НЕ використовуємо extractProductId
        // якщо є variationId, бо це дасть неправильний productId
        let productId: number | null = null;
        if (item.productId) {
          productId = item.productId;
        } else if (!item.variationId) {
          // Тільки для не-варіацій використовуємо extractProductId
          productId = extractProductId(item.id);
        }

        if (productId === null) return;

        const isLoggedIn = !!token && !!state.currentUserId;
        
        // Для варіацій: шукаємо за variationId, а не за item.id
        // бо item.id для варіації = variation_id, і різні варіації мають різні id
        let existing: CartItem | undefined = undefined;
        
        if (item.variationId) {
          // Для варіацій: шукаємо за variationId
          existing = Object.values(state.items).find(
            (cartItem) => cartItem.variationId === item.variationId
          );
        } else {
          // Для звичайних товарів: шукаємо за item.id
          existing = state.items[item.id];
        }
        
        const nextQty = (existing?.quantity || 0) + qty;

        // Перевірка наявності товару
        if (
          item.stockQuantity !== null &&
          item.stockQuantity !== undefined &&
          item.stockQuantity <= 0
        ) {
          throw new Error("Цей товар відсутній в наявності");
        }

        if (
          item.stockQuantity !== null &&
          item.stockQuantity !== undefined &&
          nextQty > item.stockQuantity
        ) {
          throw new Error(
            `Недостатньо товару в наявності. Доступно: ${item.stockQuantity} шт.`
          );
        }

        // Зберігаємо зображення з item.image, якщо воно є і не є placeholder, інакше використовуємо існуюче
        const finalImage =
          item.image && item.image !== "/placeholder.svg"
            ? item.image
            : existing?.image && existing.image !== "/placeholder.svg"
            ? existing.image
            : "/placeholder.svg";

        const newItem: CartItem = {
          id: item.id,
          productId: item.productId ?? productId ?? undefined,
          wcPrice: item.wcPrice,
          wcRegularPrice: item.wcRegularPrice,
          name: item.name,
          price: item.price,
          image: finalImage,
          color: item.color,
          size: item.size,
          originalPrice: item.originalPrice,
          regularPrice: item.regularPrice,
          salePrice: item.salePrice,
          sku: item.sku,
          quantity: nextQty,
          stockQuantity: item.stockQuantity,
          variationId: item.variationId,
          metaData: item.metaData,
        };

        if (isLoggedIn) {
          set({
            items: { ...state.items, [item.id]: newItem },
            pendingCartSync: true,
          });
        } else {
          const newItems = { ...state.items, [item.id]: newItem };
          if (state.currentUserId) {
            saveUserCart(state.currentUserId, newItems);
          }
          set({ items: newItems });
        }
      },
      removeItem: async (id: string) => {
        const state = get();
        const { token } = useAuthStore.getState();

        // Шукаємо товар за різними можливими ключами
        let item = state.items[id];
        let actualKey = id;

        if (!item) {
          // Спробуємо знайти за нормалізованим ключем
          const normalizedKey = extractProductId(id)?.toString();
          if (normalizedKey && state.items[normalizedKey]) {
            item = state.items[normalizedKey];
            actualKey = normalizedKey;
          }
        }

        if (!item) return; // Товар не знайдено

        const next = { ...state.items };
        delete next[actualKey];
        set({ items: next });

        if (state.currentUserId && token) {
          set((s) => ({ ...s, pendingCartSync: true }));
        }
        if (state.currentUserId) {
          saveUserCart(state.currentUserId, next);
        }
      },
      increment: async (id: string, step = 1) => {
        const state = get();
        const { token } = useAuthStore.getState();
        const item = state.items[id];
        if (!item) return;

        const newQuantity = item.quantity + step;
        const newItem = { ...item, quantity: newQuantity };

        set({ items: { ...state.items, [id]: newItem } });

        if (state.currentUserId && token) {
          set((s) => ({ ...s, pendingCartSync: true }));
        }
        if (state.currentUserId) {
          saveUserCart(state.currentUserId, {
            ...state.items,
            [id]: newItem,
          });
        }
      },
      decrement: async (id: string, step = 1) => {
        const state = get();
        const { token } = useAuthStore.getState();
        const item = state.items[id];
        if (!item) return;

        const newQuantity = Math.max(0, item.quantity - step);
        const next = { ...state.items };

        if (newQuantity <= 0) {
          delete next[id];
        } else {
          next[id] = { ...item, quantity: newQuantity };
        }

        set({ items: next });

        if (state.currentUserId && token) {
          set((s) => ({ ...s, pendingCartSync: true }));
        }
        if (state.currentUserId) {
          saveUserCart(state.currentUserId, next);
        }
      },
      clear: async () => {
        const state = get();
        const { token } = useAuthStore.getState();

        set({ items: {} });

        if (state.currentUserId && token) {
          set((s) => ({ ...s, pendingCartSync: true }));
        }
        if (state.currentUserId) {
          saveUserCart(state.currentUserId, {});
        }
      },
    }),
    {
      name: "bfb-cart",
      partialize: (s: CartState) => ({
        items: s.items,
        currentUserId: s.currentUserId,
      }),
    }
  )
);

export const selectCartList = (state: CartState) => Object.values(state.items);
export const selectCartCount = (state: CartState) =>
  Object.values(state.items).reduce((acc, it) => acc + it.quantity, 0);
export const selectCartTotal = (state: CartState) =>
  Object.values(state.items).reduce(
    (acc, it) => acc + it.price * it.quantity,
    0
  );
