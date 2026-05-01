import React, { Suspense } from "react";
import type { Metadata } from "next";
import ProductsCatalog from "@/components/sections/ProductsSection/ProductsCatalog/ProductsCatalog";

export const metadata: Metadata = {
  title: "Каталог товарів",
  description:
    "Широкий вибір товарів для спорту та інвентарю. Купуйте якісні товари для тренувань у BFB.",
  openGraph: {
    title: "Каталог товарів",
    description:
      "Широкий вибір товарів для спорту та інвентарю. Купуйте якісні товари для тренувань у BFB.",
    type: "website",
    locale: "uk_UA",
    siteName: "",
  },
  twitter: {
    card: "summary_large_image",
    title: "Каталог товарів",
    description: "Широкий вибір товарів для спорту та інвентарю",
  },
};

export default function ProductsCatalogPage() {
  return (
    <Suspense fallback={<div>Завантаження…</div>}>
      <ProductsCatalog />
    </Suspense>
  );
}
