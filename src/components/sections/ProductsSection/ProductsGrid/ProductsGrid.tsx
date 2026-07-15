"use client";
import React, { useEffect, useState } from "react";
import styles from "./ProductsGrid.module.css";
import ProductCard from "../ProductCard/ProductCard";
import { normalizeImageUrl } from "@/lib/imageUtils";
import EmptyState from "@/components/ui/EmptyState";

interface Product {
  id: string | number;
  slug?: string;
  name: string;
  type?: string;
  variations?: number[];
  price: string;
  regular_price?: string;
  sale_price?: string;
  sku?: string;
  images: Array<{ src: string; alt: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{ name: string; options: string[] }>;
  on_sale?: boolean;
  featured?: boolean;
  stock_status?: string;
  date?: string;
  date_created?: string;
  average_rating?: string;
  review_count?: number;
  is_purchasable?: boolean;
  wcProduct?: {
    type?: string;
    variations?: number[];
    prices?: { price?: string; regular_price?: string; sale_price?: string };
    on_sale?: boolean;
  };
}

interface ProductsGridProps {
  products: Product[];
  isNoCertificationFilter?: boolean;
  selectedCertificationFilter?: string;
  catalogDarkCards?: boolean;
}

export default function ProductsGrid({
  products,
  isNoCertificationFilter = false,
  selectedCertificationFilter,
  catalogDarkCards = false,
}: ProductsGridProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  const useDarkCards = catalogDarkCards && isMobile;

  if (products.length === 0) {
    return <EmptyState variant="products" />;
  }

  return (
    <div
      className={`${styles.productsGrid} ${
        useDarkCards ? styles.productsGridDark : ""
      }`}
    >
      {products.map((p, index) => {
        const id = String(p.id);
        const priceNum = Number(p.price) || 0;
        const original = p.regular_price ? Number(p.regular_price) : undefined;
        const image = normalizeImageUrl(p.images?.[0]?.src);
        const storeProduct = p.wcProduct;

        return (
          <ProductCard
            key={`${p.id}-${index}`}
            id={id}
            slug={p.slug}
            name={p.name}
            productType={p.type ?? p.wcProduct?.type}
            variations={p.variations ?? p.wcProduct?.variations}
            price={priceNum}
            originalPrice={original}
            metaData={(p as any).metaData ?? (p as any).meta_data ?? []}
            image={image}
            sku={p.sku}
            categories={p.categories}
            stockStatus={p.stock_status}
            dateCreated={p.date_created}
            isFluid={useDarkCards}
            showcaseDark={useDarkCards}
            wcProduct={{
              id:
                typeof p.id === "number"
                  ? p.id
                  : /^\d+$/.test(String(p.id))
                    ? parseInt(String(p.id), 10)
                    : 0,
              name: p.name,
              type: p.type ?? storeProduct?.type ?? "simple",
              variations: p.variations ?? storeProduct?.variations ?? [],
              average_rating: p.average_rating || "0",
              rating_count: p.review_count || 0,
              total_sales: 0,
              featured: p.featured || false,
              on_sale: p.on_sale ?? storeProduct?.on_sale ?? false,
              price: p.price,
              regular_price: p.regular_price || p.price,
              sale_price: p.sale_price || "",
              images: p.images,
              sku: p.sku,
              meta_data:
                (storeProduct as any)?.meta_data ??
                (p as any)?.meta_data ??
                (p as any)?.metaData ??
                [],
            }}
            allProducts={products.map((prod) => ({
              id: prod.id,
              name: prod.name,
              type: prod.type || "simple",
              variations: prod.variations || [],
              average_rating: prod.average_rating || "0",
              rating_count: prod.review_count || 0,
              total_sales: 0,
              featured: prod.featured || false,
              on_sale: prod.on_sale || false,
              price: prod.price,
              regular_price: prod.regular_price || prod.price,
              sale_price: prod.sale_price || "",
              images: prod.images,
              sku: prod.sku,
              meta_data: [],
            }))}
            isNoCertificationFilter={isNoCertificationFilter}
          />
        );
      })}
    </div>
  );
}
