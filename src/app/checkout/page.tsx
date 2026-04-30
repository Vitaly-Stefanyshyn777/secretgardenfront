import type { Metadata } from "next";
import CheckoutSection from "@/components/sections/CheckoutSection/CheckoutSection";

export const metadata: Metadata = {
  title: "Оформлення замовлення ",
  description: "Завершіть оформлення замовлення ",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutPage() {
  return <CheckoutSection />;
}
