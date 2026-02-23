import type { Metadata } from "next";
import CheckoutSection from "@/components/sections/CheckoutSection/CheckoutSection";

export const metadata: Metadata = {
  title: "Оформлення замовлення - BFB",
  description: "Завершіть оформлення замовлення на BFB. Безпечна оплата та швидка доставка.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutPage() {
  return <CheckoutSection />;
}
