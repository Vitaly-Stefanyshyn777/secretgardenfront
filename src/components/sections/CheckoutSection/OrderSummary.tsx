"use client";

import React, { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import {
  calculatePrice,
  getPriceSellRegistry,
  normalizePriceParams,
} from "@/lib/priceUtils";
import { getProductPriceAsync } from "@/lib/useProductPrices";
import {
  MinuswIcon,
  PlusIcon,
  CloseButtonIcon,
} from "@/components/Icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeDynamicText } from "@/lib/localizedContent";
import { validatePromoCode } from "@/lib/bfbApi";
import InputField from "@/components/ui/FormFields/InputField";
import s from "./CheckoutSection.module.css";

interface OrderSummaryProps {
  total: number;
  updateItem?: (
    id: string,
    updates: Partial<{ price: number; originalPrice?: number }>,
  ) => void;
}

export default function OrderSummary({ total, updateItem }: OrderSummaryProps) {
  const { t, locale } = useTranslation();
  const itemsMap = useCartStore((st) => st.items);
  const items = Object.values(itemsMap);
  const increment = useCartStore((st) => st.increment);
  const decrement = useCartStore((st) => st.decrement);
  const removeItem = useCartStore((st) => st.removeItem);
  const promoCode = useCartStore((st) => st.promoCode);
  const promoPercent = useCartStore((st) => st.promoPercent);
  const setPromo = useCartStore((st) => st.setPromo);
  const clearPromo = useCartStore((st) => st.clearPromo);
  const [promoInput, setPromoInput] = useState(promoCode ?? "");
  const [promoError, setPromoError] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const token = useAuthStore((state) => state.token);
  const effectiveIsLoggedIn =
    isLoggedIn ||
    !!token ||
    (typeof window !== "undefined" &&
      (!!localStorage.getItem("bfb_token") ||
        !!localStorage.getItem("bfb_token_old")));

  useEffect(() => {
    setPromoInput(promoCode ?? "");
  }, [promoCode]);

  useEffect(() => {
    const checkAndUpdateAllPrices = async () => {
      if (!updateItem) return;

      for (const item of items) {
        try {
          const freshPrices = await getProductPriceAsync(item.id);

          if (
            freshPrices.currentPrice !== item.price ||
            freshPrices.originalPrice !== item.originalPrice
          ) {
            updateItem(item.id, {
              price: freshPrices.currentPrice,
              originalPrice: freshPrices.originalPrice,
            });
          }
        } catch {
          // ignore
        }
      }
    };

    const itemsToCheck = items.filter((item) => /\d/.test(item.id));
    if (itemsToCheck.length > 0) {
      checkAndUpdateAllPrices();
    }
  }, [items, updateItem]);

  const safeTotal = total || 0;

  const totalWithoutDiscount = useMemo(() => {
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
      const regularPrice =
        normalizedPrices.regularPrice || normalizedPrices.price;
      return acc + regularPrice * it.quantity;
    }, 0);
  }, [items]);

  const totalDiscount = useMemo(() => {
    return Math.max(0, totalWithoutDiscount - safeTotal);
  }, [safeTotal, totalWithoutDiscount]);

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) {
      setPromoError(t("cart.promoPlaceholder"));
      return;
    }
    if (!effectiveIsLoggedIn) {
      setPromoError(t("checkout.loginRequired"));
      return;
    }
    setPromoBusy(true);
    setPromoError("");
    try {
      const data = await validatePromoCode(code);
      setPromo(data.code, data.discountPercent);
      setPromoInput(data.code);
    } catch (e) {
      clearPromo();
      const err = e as {
        response?: { data?: { message?: string | string[] } };
      };
      const raw = err.response?.data?.message;
      setPromoError(
        Array.isArray(raw)
          ? raw.join(", ")
          : raw || t("cart.promoInvalid"),
      );
    } finally {
      setPromoBusy(false);
    }
  };

  return (
    <div className={s.summaryCard}>
      <div className={s.summaryHeader}>
        <h3 className={s.summaryTotal}>{t("checkout.total")}</h3>
        <span className={s.summaryTotal}>
          <p className={s.summaryTotalAmount}>{safeTotal.toLocaleString()}</p>
          <span className={s.summaryCurrency}>₴</span>
        </span>
      </div>
      <div className={s.promoBlock}>
        <div className={s.promoRow}>
          <InputField
            id="checkout-promo-code"
            label={t("cart.promoLabel")}
            value={promoInput}
            onChange={(e) => {
              setPromoInput(e.target.value);
              setPromoError("");
            }}
            wrapperClassName={s.promoWrapper}
            inputClassName={s.promoInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleApplyPromo();
              }
            }}
          />
          <button
            type="button"
            className={s.promoApply}
            onClick={() => void handleApplyPromo()}
            disabled={promoBusy}
          >
            {promoBusy ? t("cart.promoChecking") : t("cart.promoApply")}
          </button>
        </div>
        {promoCode ? (
          <p className={s.promoOk}>
            {t("cart.promoApplied", { code: promoCode })}
            {promoPercent ? ` (−${promoPercent}%)` : ""}
            {" · "}
            <button
              type="button"
              className={s.promoClear}
              onClick={() => {
                clearPromo();
                setPromoInput("");
                setPromoError("");
              }}
            >
              {t("cart.promoCancel")}
            </button>
          </p>
        ) : null}
        {promoError ? <p className={s.promoErr}>{promoError}</p> : null}
      </div>
      <div className={s.summaryDivider}></div>
      <div className={s.summaryList}>
        {items.map((it) => (
          <div key={it.id} className={s.item}>
            <div className={s.itemMain}>
              {it.image && (
                <Image
                  src={it.image}
                  alt={localizeDynamicText(it.name, locale)}
                  className={s.thumb}
                  width={144}
                  height={115}
                  unoptimized={it.image.startsWith("http")}
                />
              )}
              <div className={s.contentCol}>
                <div className={s.nameColorBlock}>
                  <div className={s.titleBlock}>
                    <div className={s.name}>
                      {localizeDynamicText(it.name, locale)}
                    </div>
                    <button
                      className={s.removeBtn}
                      onClick={() => removeItem(it.id)}
                    >
                      <CloseButtonIcon />
                    </button>
                  </div>
                  {(it.color || it.size || it.sku || it.id) && (
                    <div className={s.color}>
                      {it.color && it.color}
                      {it.color && it.size && " | "}
                      {it.size && it.size}
                      {(it.color || it.size) && (it.sku || it.id) && " | "}
                      {(it.sku || it.id) && (
                        <span className={s.colorCode}>
                          {t("checkout.productCode")} {it.sku || it.id}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className={s.controlsBlock}>
                  <div className={s.controls}>
                    <button
                      className={s.minus}
                      onClick={() => decrement(it.id)}
                    >
                      <MinuswIcon />
                    </button>
                    <div className={s.qtyBlock}>
                      <span className={s.qty}>{it.quantity}</span>
                    </div>
                    <button className={s.plus} onClick={() => increment(it.id)}>
                      <PlusIcon />
                    </button>
                  </div>
                  <div className={s.priceWrap}>
                    <div className={s.prices}>
                      {(() => {
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
                        const {
                          finalPrice,
                          originalPrice,
                          shouldShowOldPrice,
                        } = calculatePrice({
                          price: normalizedPrices.price,
                          regularPrice: normalizedPrices.regularPrice,
                          salePrice: normalizedPrices.salePrice,
                          isLoggedIn: effectiveIsLoggedIn,
                          priceSellRegistry,
                        });

                        return (
                          <>
                            <span className={s.currentPrice}>
                              <span className={s.currentPriceValue}>
                                {finalPrice.toLocaleString()}
                              </span>
                              <span className={s.priceCurrency}>₴</span>
                            </span>
                            {shouldShowOldPrice && (
                              <span className={s.oldPrice}>
                                <span className={s.originalPriceValue}>
                                  {originalPrice.toLocaleString()}
                                </span>
                                <span className={s.originalPriceCurrency}>
                                  ₴
                                </span>
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={s.summaryDivider}></div>
      <div className={s.totals}>
        <div className={s.row}>
          <span className={s.rowLabel}>{t("checkout.orderSum")}</span>
          <span className={s.rowAmount}>
            <p className={s.rowAmountNumber}>{safeTotal.toLocaleString()}</p>
            <p className={s.rowAmountCurrency}>₴</p>
          </span>
        </div>
        <div className={s.row}>
          <span className={s.rowLabel}>{t("checkout.discountSum")}</span>
          <span className={s.rowAmount}>
            <p className={s.rowAmountAmount}>
              {Math.round(totalDiscount).toLocaleString()}
            </p>
            <p className={s.rowNumberCurrency}>₴</p>
          </span>
        </div>
        <div className={s.row}>
          <span className={s.rowLabel}>{t("checkout.deliveryCost")}</span>
          <span className={s.muted}>{t("checkout.novaPoshtaRates")}</span>
        </div>
      </div>
      <div className={s.summaryDivider}></div>
      <div className={s.rowStrong}>
        <span className={s.titleTotal}>{t("checkout.grandTotal")}</span>
        <span className={s.costValuePrice}>
          <span className={s.costValueNumber}>
            {safeTotal.toLocaleString()}
          </span>
          <span className={s.costValueCurrency}>₴</span>
        </span>
      </div>
    </div>
  );
}
