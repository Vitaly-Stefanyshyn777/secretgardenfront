import { useState, useEffect } from "react";
import { fetchProductVariation } from "./products";

export interface ProductPrices {
  currentPrice: number;
  originalPrice?: number;
  isLoading: boolean;
}

export interface WooCommerceProductBasic {
  id: number;
  type: string;
  variations: number[];
  price: string;
  regular_price: string;
  sale_price: string;
}

// Функція для отримання ціни товару — використовує catalog API
export const getProductPriceAsync = async (
  productId: string
): Promise<{ currentPrice: number; originalPrice?: number }> => {
  try {
    let actualProductId = productId;
    if (productId.startsWith("course-")) {
      actualProductId = productId.replace("course-", "");
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/catalog/products/${actualProductId}`
    );
    if (!res.ok) return { currentPrice: 0 };
    const data = await res.json();
    const d = data?.data ?? data;
    const price = parseFloat(d?.price ?? "0") || 0;
    return { currentPrice: price, originalPrice: price };
  } catch {
    return { currentPrice: 0 };
  }
};

// Хук для отримання цін товару (з урахуванням варіацій)
export const useProductPrices = (
  productId: string,
  wcProduct?: WooCommerceProductBasic
): ProductPrices => {
  const [prices, setPrices] = useState<ProductPrices>({
    currentPrice: 0,
    originalPrice: undefined,
    isLoading: true,
  });

  useEffect(() => {
    const loadPrices = async () => {
      try {
        setPrices((prev) => ({ ...prev, isLoading: true }));

        // Якщо у нас є wcProduct, використовуємо його
        if (wcProduct) {
          // Якщо це не варіативний товар, повертаємо звичайні ціни
          if (wcProduct.type !== "variable") {
            const currentPrice = parseFloat(wcProduct.price || "0");
            const originalPrice = wcProduct.regular_price
              ? parseFloat(wcProduct.regular_price)
              : undefined;

            setPrices({
              currentPrice,
              originalPrice:
                originalPrice && originalPrice > currentPrice
                  ? originalPrice
                  : undefined,
              isLoading: false,
            });
            return;
          }

          // Для варіативних товарів отримуємо дані першої варіації
          if (wcProduct.variations?.[0]) {
            const firstVariationId = wcProduct.variations[0];
            const variation = await fetchProductVariation(
              firstVariationId,
              wcProduct.id
            );

            const currentPrice = parseFloat(
              variation.price ||
                variation.sale_price ||
                variation.regular_price ||
                "0"
            );
            const regularPrice = variation.regular_price
              ? parseFloat(variation.regular_price)
              : undefined;

            setPrices({
              currentPrice,
              originalPrice:
                regularPrice && regularPrice > currentPrice
                  ? regularPrice
                  : undefined,
              isLoading: false,
            });
            return;
          }

          // Fallback для варіативних товарів без варіацій
          setPrices({
            currentPrice: parseFloat(wcProduct.price || "0"),
            originalPrice: undefined,
            isLoading: false,
          });
        } else {
          const result = await getProductPriceAsync(productId);
          setPrices({
            currentPrice: result.currentPrice,
            originalPrice: result.originalPrice,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching product prices:", error);
        setPrices({
          currentPrice: 0,
          originalPrice: undefined,
          isLoading: false,
        });
      }
    };

    loadPrices();
  }, [productId, wcProduct]);

  return prices;
};
