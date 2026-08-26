"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import s from "./OrderSuccessSection.module.css";
import type { OrderResponse } from "@/lib/bfbApi";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeDynamicText } from "@/lib/localizedContent";

interface OrderProductsProps {
  orderNumber: string;
  order?: OrderResponse | null;
}

interface ProductWithImage {
  id: string | number;
  name: string;
  quantity: number;
  image?: string;
}

export default function OrderProducts({
  orderNumber,
  order,
}: OrderProductsProps) {
  const { locale } = useTranslation();
  const items = useCartStore((st) => st.items);
  const cartItems = Object.values(items);
  const [productImages, setProductImages] = useState<Record<string, string>>(
    {}
  );

  const toKey = (v: string | number) => String(v ?? "");

  // Отримуємо товари: спочатку з order, якщо він є, інакше з кошика
  const productsToShow: ProductWithImage[] = React.useMemo(() => {
    if (order?.line_items && order.line_items.length > 0) {
      return order.line_items.map((item) => {
        const itemKey = toKey(item.product_id);
        const cartItem = cartItems.find(
          (c) => toKey(c.productId ?? c.id) === itemKey
        );
        const finalImage =
          (item as { image?: string }).image ||
          cartItem?.image ||
          productImages[itemKey];

        return {
          id: item.product_id,
          name: item.name || "Товар",
          quantity: item.quantity,
          image: finalImage,
        };
      });
    } else {
      // Fallback до товарів з кошика
      return cartItems.map((item) => {
        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          image: item.image,
        };
      });
    }
  }, [order?.line_items, cartItems, productImages]);

  // Отримуємо зображення для товарів з замовлення
  useEffect(() => {
    const lineItems = order?.line_items ?? [];
    if (lineItems.length === 0) return;

    const loadProductImages = async () => {
      const productsToFetch = lineItems.filter((item) => {
        const key = toKey(item.product_id);
        return !(item as { image?: string }).image && !productImages[key];
      });

      if (productsToFetch.length === 0) return;

      try {
        const imagesMap: Record<string, string> = {};

        await Promise.all(
          productsToFetch.map(async (item) => {
            const key = toKey(item.product_id);
            try {
              const base =
                process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
              const res = await fetch(
                `${base}/api/catalog/products/${encodeURIComponent(key)}`
              );
              if (res.ok) {
                const product = await res.json();
                const img =
                  product.mainImageUrl ||
                  product.images?.[0]?.src ||
                  product.images?.[0]?.url;
                if (img) imagesMap[key] = img;
              }
            } catch {
              // ignore
            }
          })
        );

        setProductImages((prev) => ({ ...prev, ...imagesMap }));
      } catch {
        // ignore
      }
    };

    loadProductImages();
  }, [order?.line_items, productImages]);

  return (
    <div className={s.CartItemsBlock}>
      <div className={s.numberOrdereBlock}>
        <p className={s.orderNumber}>Замовлення {orderNumber}</p>
      </div>

      <div className={s.productsBlock}>
        <div className={`${s.products} ${s.productsScrollable}`}>
          {productsToShow.map((product) => (
            <div key={product.id} className={s.productImage}>
              {product.image && (
                <Image
                  src={product.image}
                  alt={localizeDynamicText(product.name, locale)}
                  fill
                  sizes="80px"
                />
              )}
              {product.quantity > 1 && (
                <div className={s.quantityBadge}>x{product.quantity}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
