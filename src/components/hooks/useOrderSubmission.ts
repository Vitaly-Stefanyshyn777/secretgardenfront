"use client";
import React from "react";
import { createOrder } from "@/lib/bfbApi";
import { useCartStore, type CartItem } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import {
  FormData,
  CheckoutErrors,
} from "@/components/sections/CheckoutSection/types";
import { useOrderData } from "./useOrderData";
import { useWayForPay } from "./useWayForPay";
import { translate } from "@/i18n";
import { getCurrentLocale } from "@/store/language";

interface UseOrderSubmissionProps {
  formData: FormData;
  hasDifferentRecipient: boolean;
  deliveryType: string;
  items: CartItem[];
  safeTotal: number;
  subtotal: number;
  discountAmount: number;
  deliveryCost: number;
  promoCode?: string | null;
  setErrors: (errors: CheckoutErrors) => void;
  parseWcValidationErrors: (errorData: unknown) => CheckoutErrors;
}

export function useOrderSubmission({
  formData,
  hasDifferentRecipient,
  deliveryType,
  items,
  safeTotal,
  subtotal,
  discountAmount,
  deliveryCost,
  promoCode,
  setErrors,
  parseWcValidationErrors,
}: UseOrderSubmissionProps) {
  const cartStore = useCartStore();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { createOrderPayload } = useOrderData();
  const { handleWayForPayPayment } = useWayForPay({ safeTotal, setErrors });
  const isSubmittingRef = React.useRef(false);
  const [isPending, setIsPending] = React.useState(false);

  const submitOrder = async () => {
    if (isSubmittingRef.current || isPending) {
      return;
    }

    const locale = getCurrentLocale();
    const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
      translate(locale, key, params);

    try {
      isSubmittingRef.current = true;
      setIsPending(true);

      const payload = createOrderPayload({
        formData,
        hasDifferentRecipient,
        deliveryType,
        items,
        isLoggedIn,
        subtotal,
        discountAmount,
        deliveryCost,
        promoCode,
      });

      const result = await createOrder(payload);

      await cartStore.clear();

      const orderId = result?.id;

      if (formData.paymentMethod === "wayforpay" && orderId) {
        const paymentHandled = await handleWayForPayPayment(orderId);
        if (paymentHandled) return;
      }

      localStorage.setItem(
        "orderData",
        JSON.stringify({
          formData,
          hasDifferentRecipient,
          deliveryType,
          orderId,
          orderStatus: result?.status,
        }),
      );

      window.location.href = `/order-success?orderId=${orderId}`;
    } catch (error) {
      let errorMessage = t("checkout.orderCreateError");
      let showAlert = true;

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; params?: unknown; data?: unknown };
          };
        };
        const responseData = axiosError.response?.data;

        if (responseData?.message) {
          errorMessage = responseData.message;
        }

        if (responseData && (responseData.params || responseData.data)) {
          const fieldErrors = parseWcValidationErrors(responseData);
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            showAlert = false;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = t("checkout.orderError", { message: error.message });
      }

      if (showAlert) {
        alert(errorMessage);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsPending(false);
    }
  };

  return {
    submitOrder,
    isPending,
  };
}
