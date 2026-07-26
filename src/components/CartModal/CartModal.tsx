"use client";
import React, { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import s from "./CartModal.module.css";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import { BasketIcons } from "@/components/Icons/Icons";
import {
  calculatePrice,
  getPriceSellRegistry,
  normalizePriceParams,
} from "@/lib/priceUtils";
import CartHeader from "./CartHeader";
import CartSummary from "./CartSummary";

export default function CartModal() {
  const isOpen = useCartStore((st) => st.isOpen);
  const close = useCartStore((st) => st.close);
  const itemsMap = useCartStore((st) => st.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);
  const isLoggedIn = useAuthStore((st) => st.isLoggedIn);
  const token = useAuthStore((st) => st.token);
  const effectiveIsLoggedIn =
    isLoggedIn ||
    !!token ||
    (typeof window !== "undefined" &&
      (!!localStorage.getItem("bfb_token") ||
        !!localStorage.getItem("bfb_token_old")));

  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const normalizedPrices = normalizePriceParams({
        wcPrice: it.wcPrice,
        wcRegularPrice: it.wcRegularPrice,
        wcSalePrice: undefined,
        price: it.price,
        originalPrice: it.originalPrice,
        regularPrice: it.regularPrice,
        salePrice: it.salePrice,
      });
      const priceSellRegistry = getPriceSellRegistry({
        metaData: it.metaData,
      });
      const { finalPrice } = calculatePrice({
        price: normalizedPrices.price,
        regularPrice: normalizedPrices.regularPrice,
        salePrice: normalizedPrices.salePrice,
        isLoggedIn: effectiveIsLoggedIn,
        priceSellRegistry,
      });
      return acc + finalPrice * it.quantity;
    }, 0);
  }, [items, effectiveIsLoggedIn]);

  const totalWithoutDiscount = useMemo(() => {
    return items.reduce((acc, it) => {
      const regularPrice =
        it.wcRegularPrice || it.regularPrice || it.originalPrice || it.price;
      return acc + regularPrice * it.quantity;
    }, 0);
  }, [items]);

  const discount = useMemo(() => {
    return Math.max(0, totalWithoutDiscount - total);
  }, [total, totalWithoutDiscount]);

  const FREE_SHIPPING_LIMIT = 1999;
  const remainingToFree = Math.max(0, FREE_SHIPPING_LIMIT - total);
  const progressPct = Math.min(
    100,
    Math.round((total / FREE_SHIPPING_LIMIT) * 100),
  );

  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useScrollLock(isOpen);

  useEffect(() => {
    const trySync = () => {
      const store = useCartStore.getState();
      if (store.pendingCartSync && store.currentUserId && token) {
        store.syncCartToApi();
      }
    };

    const onBeforeUnload = () => trySync();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") trySync();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [token]);

  if (!isOpen || !isMounted) return null;

  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    close();
    window.location.href = "/checkout";
  };

  const goToCatalog = () => {
    close();
    window.location.href = "/products";
  };

  const emptyCartContent = (
    <div className={s.emptyCart}>
      <div className={s.emptyCartIcon}>
        <BasketIcons />
      </div>
      <div className={s.emptyCartTextCol}>
        <p className={s.emptyCartTitle}>Ваш кошик порожній</p>
        <p className={s.emptyCartSubtitle}>
          Сподіваємось, ви знайдете те, що вам до душі
        </p>
      </div>
    </div>
  );

  const modalContent = (
    <div className={s.backdrop} onClick={close}>
      <div
        className={`${s.modal} ${isEmpty ? s.modalEmpty : s.modalFilled}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${s.topbarListBlock} ${
            isEmpty ? s.topbarListBlockEmpty : ""
          }`}
        >
          <CartHeader onClose={close} showClose={!isMobile} />

          {isEmpty && isMobile ? (
            <div className={s.emptyCartWrap}>{emptyCartContent}</div>
          ) : (
            <div className={s.bodyTwoCols}>
              <CartSummary
                total={total}
                totalWithoutDiscount={totalWithoutDiscount}
                discount={discount}
                remainingToFree={remainingToFree}
                progressPct={progressPct}
                onCheckout={handleCheckout}
                onContinue={close}
                itemsCount={items.length}
                items={items}
              />
            </div>
          )}
        </div>

        {isEmpty && isMobile && (
          <button
            type="button"
            className={s.emptyCartButton}
            onClick={goToCatalog}
          >
            До каталогу
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
