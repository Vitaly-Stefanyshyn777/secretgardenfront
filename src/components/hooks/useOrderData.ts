"use client";
import { calculatePrice, getPriceSellRegistry, normalizePriceParams } from "@/lib/priceUtils";
import { type CartItem } from "@/store/cart";
import { FormData } from "@/components/sections/CheckoutSection/types";
import type { CreateOrderPayload } from "@/lib/bfbApi";

const isCuidLike = (v: string): boolean => /^c[a-z0-9]{10,}$/i.test(String(v).trim());

interface CreateOrderDataProps {
  formData: FormData;
  hasDifferentRecipient: boolean;
  deliveryType: string;
  items: CartItem[];
  isLoggedIn: boolean;
  /** Сума замовлення з урахуванням знижки (без доставки) */
  subtotal: number;
  /** Сума знижки в грн */
  discountAmount: number;
  /** Вартість доставки в грн (0 = за тарифами НП) */
  deliveryCost: number;
}

function mapDeliveryTypeToMethod(deliveryType: string): string {
  if (deliveryType === "branch" || deliveryType === "postomat" || deliveryType === "courier") {
    return "nova_poshta";
  }
  return "nova_poshta";
}

function toProductId(item: CartItem): string | null {
  const raw = item.productId ?? item.id;
  if (raw == null || String(raw).trim() === "") return null;
  const str = String(raw).trim();
  if (isCuidLike(str)) return str;
  if (/^\d+$/.test(str)) return str;
  return str;
}

export function useOrderData() {
  const createOrderPayload = ({
    formData,
    hasDifferentRecipient,
    deliveryType,
    items,
    subtotal,
    discountAmount,
    deliveryCost,
  }: CreateOrderDataProps): CreateOrderPayload => {
    const itemsPayload = items
      .filter((it) => it.quantity > 0)
      .map((it) => {
        const productId = toProductId(it);
        return productId ? { productId, quantity: it.quantity } : null;
      })
      .filter((i): i is { productId: string; quantity: number } => i != null);

    const deliveryMethod = mapDeliveryTypeToMethod(deliveryType);
    const deliveryAddress =
      deliveryType === "courier"
        ? [formData.branch, formData.house, formData.building, formData.apartment]
            .filter(Boolean)
            .join(", ")
        : formData.branch || "";

    const payload: CreateOrderPayload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      deliveryToAnother: hasDifferentRecipient,
      deliveryMethod,
      deliveryCity: formData.city?.trim() || undefined,
      deliveryAddress: deliveryAddress.trim() || undefined,
      comment: formData.comment?.trim() || undefined,
      newsletterConsent: formData.mailSend ?? false,
      termsAccepted: formData.acceptTerms ?? false,
      discountAmount: Math.round(discountAmount) || 0,
      deliveryCost: Math.round(deliveryCost) || 0,
    };

    if (hasDifferentRecipient) {
      payload.recipientFirstName = formData.recipientFirstName?.trim() || undefined;
      payload.recipientLastName = formData.recipientLastName?.trim() || undefined;
      payload.recipientPhone = formData.recipientPhone?.trim() || undefined;
    }

    // items опційні — якщо не передати, бекенд візьме з кошика. Але передаємо для прозорості.
    if (itemsPayload.length > 0) {
      payload.items = itemsPayload;
    }

    return payload;
  };

  return {
    createOrderPayload,
  };
}
