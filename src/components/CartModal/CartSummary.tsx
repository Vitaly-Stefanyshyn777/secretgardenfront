"use client";
import React from "react";
import s from "./CartModal.module.css";
import type { CartItem } from "@/store/cart";
import CartItemsList from "./CartItemsList";
import InputField from "@/components/ui/FormFields/InputField";
import { BasketIcons } from "@/components/Icons/Icons";

interface CartSummaryProps {
  total: number;
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
  discount,
  remainingToFree,
  progressPct,
  onCheckout,
  onContinue,
  itemsCount,
  items,
}: CartSummaryProps) {
  const hasItems = itemsCount > 0;

  const handleCheckoutClick = () => {
    if (hasItems) {
      onCheckout();
    }
  };
  return (
    <div className={s.rightSummary}>
      <div className={s.summaryBlock}>
        {/* <div className={s.freeShipping}>
          <span className={s.badgeIcon}>
            <Image
              src="/images/fi_2630085.png"
              alt="Free shipping badge"
              width={24}
              height={24}
            />
          </span>
          <span className={s.freeShippingText}>
            {remainingToFree <= 0 ? (
              "Доставка безкоштовна"
            ) : (
              <>
            До безкоштовної доставки залишилось
            <span className={s.amount}>
              {" "}
              {remainingToFree.toLocaleString()}
            </span>
            <span className={s.currency}> грн.</span>
              </>
            )}
          </span>
        </div> */}
        {/* <div className={s.progressWrap}>
          <div className={s.progressTrack}>
            <div
              className={s.progressBar}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div> */}

        {hasItems ? (
          <>
            <CartItemsList items={items} />

            <div className={s.summaryPromoBlock}>
              <div className={s.promoRow}>
                <InputField
                  label="Промокод"
                  wrapperClassName={s.promoWrapper}
                  inputClassName={s.promoInput}
                />
              </div>

              <div className={s.summaryRows}>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabelPrimary}>Сума замовлення</span>
                  <span className={s.value}>
                    <span className={s.summaryAmountPrimary}>
                      {total.toLocaleString()}
                    </span>{" "}
                    <span className={s.summaryCurrencyPrimary}>₴</span>
                  </span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.label}>Сума знижки</span>
                  <span className={s.value}>
                    <span className={s.amountDiscount}>
                      {discount.toLocaleString()}
                    </span>{" "}
                    <span className={s.currencyDiscount}>₴</span>
                  </span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.label}>Вартість доставки</span>
                  <span className={s.valueNote}>
                    За тарифами &quot;Нової Пошти&quot;
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
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
        )}
      </div>

      <div className={s.summaryBlock}>
        {hasItems ? (
          <>
            <div className={s.totalRow}>
              <span className={s.labelStrong}>Разом</span>
              <span className={s.totalValue}>
                <span className={s.amountTogether}>
                  {total.toLocaleString()}
                </span>{" "}
                <span className={s.currencyTogether}>₴</span>
              </span>
            </div>
            <div className={s.summaryButtons}>
              <button
                className={s.primary}
                onClick={handleCheckoutClick}
                disabled={!hasItems}
              >
                Оформити замовлення
              </button>
              <button className={s.secondary} onClick={onContinue}>
                Продовжити покупки
              </button>
            </div>
          </>
        ) : (
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
              До каталогу
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
