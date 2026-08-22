"use client";
import React, { useEffect, useState } from "react";
import s from "./CartModal.module.css";
import type { CartItem } from "@/store/cart";
import { useCartStore } from "@/store/cart";
import CartItemsList from "./CartItemsList";
import InputField from "@/components/ui/FormFields/InputField";
import { BasketIcons } from "@/components/Icons/Icons";
import { validatePromoCode } from "@/lib/bfbApi";
import { useTranslation } from "@/hooks/useTranslation";

interface CartSummaryProps {
  total: number;
  totalWithoutDiscount: number;
  discount: number;
  remainingToFree: number;
  progressPct: number;
  onCheckout: () => void;
  onContinue: () => void;
  itemsCount: number;
  items: CartItem[];
}

export default function CartSummary({
  total,
  totalWithoutDiscount,
  discount,
  remainingToFree,
  progressPct,
  onCheckout,
  onContinue,
  itemsCount,
  items,
}: CartSummaryProps) {
  const { t } = useTranslation();
  const hasItems = itemsCount > 0;
  const promoCode = useCartStore((st) => st.promoCode);
  const setPromo = useCartStore((st) => st.setPromo);
  const clearPromo = useCartStore((st) => st.clearPromo);
  const [promoInput, setPromoInput] = useState(promoCode ?? "");
  const [promoError, setPromoError] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);

  useEffect(() => {
    setPromoInput(promoCode ?? "");
  }, [promoCode]);

  const discountPercent =
    totalWithoutDiscount > 0
      ? Math.round((discount / totalWithoutDiscount) * 100)
      : 0;

  const handleCheckoutClick = () => {
    if (hasItems) {
      onCheckout();
    }
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) {
      setPromoError(t("cart.promoPlaceholder"));
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
        message?: string;
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
    <div className={s.rightSummary}>
      {hasItems ? (
        <>
          <div className={s.itemsScroll}>
            <CartItemsList items={items} />
          </div>

          <div className={s.summaryFooter}>
            <div className={s.summaryPromoBlock}>
              <div className={s.promoRow}>
                <InputField
                  id="cart-promo-code"
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

              <div className={s.summaryRows}>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabelPrimary}>{t("cart.total")}</span>
                  <span className={s.value}>
                    <span className={s.summaryAmountPrimary}>
                      {totalWithoutDiscount.toLocaleString()}
                    </span>{" "}
                    <span className={s.summaryCurrencyPrimary}>
                      {t("common.currency")}
                    </span>
                  </span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.label}>{t("cart.discount")}</span>
                  <span className={s.value}>
                    <span className={s.amountDiscount}>{discountPercent}%</span>
                  </span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.labelStrong}>{t("cart.toPay")}</span>
                  <span className={s.totalValue}>
                    <span className={s.amountTogether}>
                      {total.toLocaleString()}
                    </span>{" "}
                    <span className={s.currencyTogether}>
                      {t("common.currency")}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className={s.summaryButtons}>
              <button
                className={s.primary}
                onClick={handleCheckoutClick}
                disabled={!hasItems}
              >
                {t("cart.checkout")}
              </button>
              <button className={s.secondary} onClick={onContinue}>
                {t("cart.addMore")}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={s.summaryBlock}>
            <div className={s.emptyCart}>
              <div className={s.emptyCartIcon}>
                <BasketIcons />
              </div>
              <div className={s.emptyCartTextCol}>
                <p className={s.emptyCartTitle}>{t("cart.emptyTitle")}</p>
                <p className={s.emptyCartSubtitle}>{t("cart.emptySubtitle")}</p>
              </div>
            </div>
          </div>

          <div className={s.summaryBlock}>
            <div className={s.summaryButtons}>
              <button
                type="button"
                className={s.emptyCartButton}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/products";
                  }
                }}
              >
                {t("common.toCatalog")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
