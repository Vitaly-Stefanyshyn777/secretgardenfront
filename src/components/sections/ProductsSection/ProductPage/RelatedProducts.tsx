"use client";
import React, { useState, useMemo, memo } from "react";
import ProductCard from "@/components/sections/ProductsSection/ProductCard/ProductCard";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { normalizeImageUrl } from "@/lib/imageUtils";
import type { Product } from "@/lib/products";
import type { RelatedProductsProps, RelatedProduct } from "./types";
import styles from "./ProductPage.module.css";

const RelatedProducts = memo(function RelatedProducts({
  relatedCategoryProducts,
  currentProductSlug,
}: RelatedProductsProps) {
  const baseItemsPerView = 6;
  const [slideIdx, setSlideIdx] = useState(0);
  const itemsPerView = baseItemsPerView;

  // Мапимо пов'язані продукти
  const mappedRelated: RelatedProduct[] = useMemo(() => {
    if (!Array.isArray(relatedCategoryProducts)) {
      return [];
    }

    const filtered = relatedCategoryProducts.filter(
      (p: any) =>
        (p.slug || "").toLowerCase() !==
        (currentProductSlug || "").toLowerCase(),
    );
    const mapped = filtered.slice(0, 12).map((p: any) => {
      const img = p.image || p.images?.[0]?.src;
      const ratingAvg = p.ratingAverage ?? p.averageRating;
      const ratingCnt = p.ratingCount ?? p.rating_count ?? 0;
      return {
        id: String(p.id),
        slug: p.slug || "",
        name: p.name,
        productType: p.type,
        variations: p.variations,
        price: Number(p.price) || 0,
        originalPrice: Number(p.regularPrice) || undefined,
        discount: p.onSale
          ? Math.max(
              0,
              Math.round(
                ((Number(p.regularPrice) - Number(p.price)) /
                  Number(p.regularPrice)) *
                  100,
              ),
            )
          : 0,
        isNew: !!p.isNew,
        isHit: !!p.isHit,
        image: normalizeImageUrl(img),
        category: p.categories?.[0]?.name || p.label || "",
        stockStatus: p.stockStatus || "instock",
        wcProduct:
          ratingAvg != null || ratingCnt > 0
            ? {
                average_rating: String(ratingAvg ?? 0),
                rating_count: Number(ratingCnt) || 0,
              }
            : undefined,
      };
    });
    return mapped;
  }, [relatedCategoryProducts, currentProductSlug]);

  // Показуємо 6 карток, але перелистуємо по 1
  const totalSlides = useMemo(() => {
    return Math.max(
      1,
      mappedRelated.length > itemsPerView
        ? mappedRelated.length - itemsPerView + 1
        : 1,
    );
  }, [mappedRelated.length, itemsPerView]);

  const start = slideIdx; // стартове вікно зрушується на 1 елемент
  const visible = mappedRelated.slice(start, start + itemsPerView);

  const onPrev = () =>
    setSlideIdx((idx) => (idx - 1 + totalSlides) % totalSlides);
  const onNext = () => setSlideIdx((idx) => (idx + 1) % totalSlides);

  // Тимчасово закоментовано для тестування
  // if (mappedRelated.length === 0) return null;

  return (
    <div className={styles.relatedProducts}>
      <div className={styles.relatedProductsHeader}>
        <h2>Вам може сподобатись</h2>
      </div>
      <div className={styles.relatedGrid}>
        {visible.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            slug={item.slug}
            name={item.name}
            productType={item.productType}
            variations={item.variations}
            price={item.price}
            originalPrice={item.originalPrice}
            discount={item.discount}
            isNew={item.isNew}
            isHit={item.isHit}
            image={item.image}
            category={item.category}
            stockStatus={item.stockStatus}
            wcProduct={(item as any).wcProduct}
            isFluid
          />
        ))}
      </div>
      {mappedRelated.length > 6 && (
        <SliderNav
          activeIndex={slideIdx}
          dots={totalSlides}
          onPrev={onPrev}
          onNext={onNext}
          onDotClick={(i) => setSlideIdx(i)}
        />
      )}
    </div>
  );
});

RelatedProducts.displayName = "RelatedProducts";

export default RelatedProducts;
