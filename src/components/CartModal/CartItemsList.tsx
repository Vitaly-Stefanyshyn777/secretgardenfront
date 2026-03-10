"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCartStore, CartItem } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import {
  MinuswIcon,
  PlusIcon,
  CloseButtonIcon,
} from "@/components/Icons/Icons";
import { normalizeImageUrl } from "@/lib/imageUtils";
import {
  calculatePrice,
  getPriceSellRegistry,
  normalizePriceParams,
} from "@/lib/priceUtils";
import s from "./CartModal.module.css";

interface CartItemsListProps {
  items: CartItem[];
}

interface CartItemRowProps {
  item: CartItem;
}

function CartItemRow({ item }: CartItemRowProps) {
  const increment = useCartStore((st) => st.increment);
  const decrement = useCartStore((st) => st.decrement);
  const removeItem = useCartStore((st) => st.removeItem);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const token = useAuthStore((state) => state.token);
  const effectiveIsLoggedIn =
    isLoggedIn ||
    !!token ||
    (typeof window !== "undefined" &&
      (!!localStorage.getItem("bfb_token") ||
        !!localStorage.getItem("bfb_token_old")));

  const imageUrl = normalizeImageUrl(item.image);
  const [imageError, setImageError] = useState(false);
  const itemMetaData = item.metaData;
  const wcBasePrice = item.wcPrice ?? item.price;
  const wcBaseRegularPrice = item.wcRegularPrice ?? item.regularPrice ?? item.originalPrice;

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const baseImageUrl = imageUrl || "/placeholder.svg";
  const finalImageUrl = imageError ? "/placeholder.svg" : baseImageUrl;

  // Витягуємо колір з назви товару, якщо він там є
  // Шукаємо патерни: (Колір: назва), (Color: назва) або інші варіації
  // Використовуємо колір і розмір напряму з item
  const extractedColor = item.color;
  const extractedSize = item.size;

  // Використовуємо уніфіковану функцію для нормалізації цін
  const normalizedPrices = normalizePriceParams({
    wcPrice: wcBasePrice,
    wcRegularPrice: wcBaseRegularPrice,
    wcSalePrice: undefined, // Не використовуємо окремо, бо вже в wcPrice може бути sale_price
    price: item.price,
    originalPrice: item.originalPrice,
    regularPrice: item.regularPrice,
    salePrice: item.salePrice,
  });

  const priceSellRegistry = getPriceSellRegistry({
    metaData: itemMetaData,
  });

  const { finalPrice, originalPrice, shouldShowOldPrice } = calculatePrice({
    price: normalizedPrices.price,
    regularPrice: normalizedPrices.regularPrice,
    salePrice: normalizedPrices.salePrice,
    isLoggedIn: effectiveIsLoggedIn,
    priceSellRegistry,
  });

  // Додаткова перевірка: якщо shouldShowOldPrice false, але є різниця між originalPrice та finalPrice,
  // показуємо стару ціну (це може статися, якщо regularPrice не був переданий)
  const shouldDisplayOldPrice =
    shouldShowOldPrice || (originalPrice > finalPrice && originalPrice > 0);

  return (
    <div className={s.item} ref={rowRef}>
      <div className={s.itemMain}>
        <Image
          src={finalImageUrl}
          alt={item.name}
          className={s.thumb}
          width={144}
          height={115}
          style={{ objectFit: "cover" }}
          unoptimized={finalImageUrl.startsWith("http")}
          onError={handleImageError}
        />

        <div className={s.contentCol}>
          <div className={s.nameColorBlock}>
            <div className={s.titleBlock}>
              <div className={s.name}>{item.name}</div>
              <button
                className={s.removeBtn}
                onClick={() => removeItem(item.id)}
              >
                <CloseButtonIcon />
              </button>
            </div>

            {(extractedColor || extractedSize) && (
              <div className={s.color}>
                {extractedColor && `Колір: ${extractedColor}`}
                {extractedColor && extractedSize && ", "}
                {extractedSize && `Розмір: ${extractedSize}`}
              </div>
            )}
          </div>

          <div className={s.controlsBlock}>
            <div className={s.controls}>
              <button className={s.minus} onClick={() => decrement(item.id)}>
                <MinuswIcon />
              </button>

              <div className={s.qtyBlock}>
                <span className={s.qty}>{item.quantity}</span>
              </div>
              <button className={s.plus} onClick={() => increment(item.id)}>
                <PlusIcon />
              </button>
            </div>
            <div className={s.priceWrap}>
              <div className={s.prices}>
                <span className={s.currentPrice}>
                  <span className={s.currentPriceValue}>
                    {finalPrice.toLocaleString()}
                  </span>
                  <span className={s.priceCurrency}>₴</span>
                </span>
                {shouldDisplayOldPrice && originalPrice > finalPrice && (
                  <span className={s.oldPrice}>
                    <span className={s.originalPriceValue}>
                      {originalPrice.toLocaleString()}
                    </span>
                    <span className={s.originalPriceCurrency}>₴</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartItemsList({ items }: CartItemsListProps) {
  return (
    <div className={s.leftList}>
      {items.map((it) => (
        <CartItemRow key={it.id} item={it} />
      ))}
    </div>
  );
}
