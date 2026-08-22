"use client";

import React, { useMemo, useRef } from "react";
import { FormData } from "./types";
import { useWcPaymentGatewaysQuery } from "@/components/hooks/useWpQueries";
import { useCartStore } from "@/store/cart";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./CheckoutSection.module.css";

interface PaymentFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export default function PaymentForm({
  formData,
  setFormData,
}: PaymentFormProps) {
  const { t } = useTranslation();
  const { data: paymentGateways = [], isLoading } = useWcPaymentGatewaysQuery();

  const itemsMap = useCartStore((st) => st.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);

  const hasSetWayForPay = useRef(false);

  const hasCourses = useMemo(() => {
    return items.some((item) => {
      if (item.id.startsWith("course-")) {
        return true;
      }
      const itemName = item.name?.toLowerCase() || "";
      const isCourseByName =
        itemName.includes("курс") ||
        itemName.includes("workshop") ||
        itemName.includes("тренування") ||
        itemName.includes("менеджмент") ||
        itemName.includes("афірмації");
      return (
        isCourseByName &&
        !item.variationId &&
        !item.color &&
        !item.size &&
        item.stockQuantity === null
      );
    });
  }, [items]);

  const paymentMethodMap: Record<string, string> = useMemo(
    () => ({
      cod: t("checkout.cod"),
      wayforpay: t("checkout.wayforpay"),
      bacs: t("checkout.payOnReceive"),
    }),
    [t],
  );

  type Gateway = { id: string; title: string; enabled?: boolean };

  const defaultGateways: Gateway[] = useMemo(
    () => [
      { id: "cod", title: t("checkout.cod"), enabled: true },
      { id: "wayforpay", title: t("checkout.wayforpay"), enabled: true },
      { id: "bacs", title: t("checkout.payOnReceive"), enabled: true },
    ],
    [t],
  );

  const activePaymentGateways = useMemo(() => {
    const allGateways =
      (paymentGateways as Gateway[])?.filter((g) => g.enabled !== false)
        ?.length > 0
        ? (paymentGateways as Gateway[]).filter((g) => g.enabled !== false)
        : defaultGateways;

    if (hasCourses) {
      return allGateways.filter((g) => g.id === "wayforpay");
    }
    return allGateways;
  }, [paymentGateways, hasCourses, defaultGateways]);

  React.useEffect(() => {
    if (hasCourses) {
      if (formData.paymentMethod !== "wayforpay" && !hasSetWayForPay.current) {
        setFormData({
          ...formData,
          paymentMethod: "wayforpay",
        });
        hasSetWayForPay.current = true;
      }
    } else {
      hasSetWayForPay.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCourses]);

  return (
    <div className={s.paymentBlock}>
      <h2 className={s.sectionTitle}>{t("checkout.payment")}</h2>
      {isLoading ? (
        <div>{t("checkout.loadingPaymentMethods")}</div>
      ) : (
        <div className={s.radioRow}>
          {activePaymentGateways.map((gateway) => {
            const displayName = paymentMethodMap[gateway.id] || gateway.title;
            return (
              <div key={gateway.id} className={s.radioBlock}>
                <label className={s.radio}>
                  <input
                    className={s.radioInput}
                    type="radio"
                    name="pay"
                    value={gateway.id}
                    checked={formData.paymentMethod === gateway.id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                  />{" "}
                  {displayName}
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
