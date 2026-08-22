"use client";
import {
  FormData,
  CheckoutErrors,
} from "@/components/sections/CheckoutSection/types";
import { CartItem } from "@/store/cart";
import { translate } from "@/i18n";
import { getCurrentLocale } from "@/store/language";

export function useCheckoutValidation() {
  const parseWcValidationErrors = (errorData: any): CheckoutErrors => {
    const wcErrors: CheckoutErrors = {};

    if (errorData?.data?.params) {
      const params = errorData.data.params;

      if (params.billing) {
        if (typeof params.billing === "string") {
          wcErrors.email = params.billing;
        } else if (typeof params.billing === "object") {
          if (params.billing.email) {
            wcErrors.email = params.billing.email;
          }
          if (params.billing.phone) {
            wcErrors.phone = params.billing.phone;
          }
          if (params.billing.first_name) {
            wcErrors.firstName = params.billing.first_name;
          }
          if (params.billing.last_name) {
            wcErrors.lastName = params.billing.last_name;
          }
        }
      }

      if (params.shipping) {
        if (typeof params.shipping === "object") {
          if (params.shipping.city) {
            wcErrors.city = params.shipping.city;
          }
          if (params.shipping.address_1) {
            wcErrors.branch = params.shipping.address_1;
            wcErrors.house = params.shipping.address_1;
          }
        }
      }
    }

    if (errorData?.data?.details && !errorData?.data?.params) {
      const details = errorData.data.details;

      if (details.billing) {
        if (typeof details.billing === "object") {
          if (details.billing.email) {
            wcErrors.email = Array.isArray(details.billing.email)
              ? details.billing.email.join(", ")
              : details.billing.email;
          }
          if (details.billing.phone) {
            wcErrors.phone = Array.isArray(details.billing.phone)
              ? details.billing.phone.join(", ")
              : details.billing.phone;
          }
        }
      }
    }

    return wcErrors;
  };

  const validateForm = (
    formData: FormData,
    hasDifferentRecipient: boolean,
    deliveryType: string,
  ): CheckoutErrors => {
    const locale = getCurrentLocale();
    const t = (
      key: Parameters<typeof translate>[1],
      params?: Record<string, string | number>,
    ) => translate(locale, key, params);
    const newErrors: CheckoutErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("common.requiredField");
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("common.requiredField");
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t("common.requiredField");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t("common.requiredField");
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t("checkout.invalidEmail");
    }

    if (hasDifferentRecipient) {
      if (!formData.recipientFirstName.trim()) {
        newErrors.recipientFirstName = t("common.requiredField");
      }
      if (!formData.recipientLastName.trim()) {
        newErrors.recipientLastName = t("common.requiredField");
      }
      if (!formData.recipientPhone.trim()) {
        newErrors.recipientPhone = t("common.requiredField");
      }
    }

    if (!deliveryType) {
      newErrors.deliveryType = t("common.requiredField");
    }
    if (!formData.city.trim()) {
      newErrors.city = t("common.requiredField");
    }
    if (deliveryType === "courier") {
      if (!formData.house.trim()) {
        newErrors.house = t("common.requiredField");
      }
      if (!formData.branch.trim()) {
        newErrors.branch = t("common.requiredField");
      }
    } else {
      if (!formData.branch.trim()) {
        newErrors.branch = t("common.requiredField");
      }
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t("checkout.acceptOfferRequired");
    }

    return newErrors;
  };

  const validateCartAndTotal = (
    items: CartItem[],
    safeTotal: number,
  ): string | null => {
    const locale = getCurrentLocale();
    const t = (
      key: Parameters<typeof translate>[1],
      params?: Record<string, string | number>,
    ) => translate(locale, key, params);

    if (items.length === 0) {
      return t("checkout.cartEmptyCheckout");
    }

    if (safeTotal <= 0) {
      return t("checkout.zeroTotalCheck");
    }

    const outOfStockItems = items.filter((item) => {
      const stockQuantity = item.stockQuantity;
      return (
        stockQuantity !== null &&
        stockQuantity !== undefined &&
        stockQuantity <= 0
      );
    });

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map((item) => item.name).join(", ");
      return `${t("checkout.itemsUnavailable")} ${itemNames}. ${t("checkout.removeFromCart")}`;
    }

    const insufficientStockItems = items.filter((item) => {
      const stockQuantity = item.stockQuantity;
      return (
        stockQuantity !== null &&
        stockQuantity !== undefined &&
        item.quantity > stockQuantity
      );
    });

    if (insufficientStockItems.length > 0) {
      const messages = insufficientStockItems.map((item) =>
        t("checkout.stockDetail", {
          name: item.name,
          qty: item.quantity,
          stock: item.stockQuantity ?? 0,
        }),
      );
      return `${t("checkout.insufficientStock")}\n${messages.join("\n")}`;
    }

    return null;
  };

  return {
    validateForm,
    parseWcValidationErrors,
    validateCartAndTotal,
  };
}
