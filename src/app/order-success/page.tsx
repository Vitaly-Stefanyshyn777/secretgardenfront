import type { Metadata } from "next";
import OrderSuccessSection from "@/components/sections/OrderSuccessSection/OrderSuccessSection";

export const metadata: Metadata = {
  title: "Замовлення успішно оформлено - BFB",
  description: "Ваше замовлення успішно оформлено. Дякуємо за покупку!",
  robots: {
    index: false,
    follow: true,
  },
};

interface OrderSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;
  const orderId = typeof params.orderId === 'string' ? params.orderId : null;

  return <OrderSuccessSection initialOrderId={orderId} />;
}
