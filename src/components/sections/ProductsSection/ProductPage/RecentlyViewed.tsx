"use client";

import React, { useState, useMemo, memo } from "react";
import ProductCard from "@/components/sections/ProductsSection/ProductCard/ProductCard";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { useRecentlyViewed } from "@/components/hooks/useRecentlyViewed";
import styles from "./ProductPage.module.css";

interface RecentlyViewedProps {
  currentProductSlug?: string;
  isMobile?: boolean;
}

const RecentlyViewed = memo(function RecentlyViewed({
  currentProductSlug,
}: RecentlyViewedProps) {
  const { items, isLoading } = useRecentlyViewed(currentProductSlug);
  const baseItemsPerView = 6;
  const [slideIdx, setSlideIdx] = useState(0);
  const itemsPerView = baseItemsPerView;

  const totalSlides = useMemo(
    () =>
      Math.max(
        1,
        items.length > itemsPerView ? items.length - itemsPerView + 1 : 1,
      ),
    [items.length, itemsPerView],
  );

  const start = slideIdx;
  const visible = items.slice(start, start + itemsPerView);
  const onPrev = () =>
    setSlideIdx((idx) => (idx - 1 + totalSlides) % totalSlides);
  const onNext = () => setSlideIdx((idx) => (idx + 1) % totalSlides);

  return (
    <div className={styles.relatedProducts}>
      <div className={styles.relatedProductsHeader}>
        <h2>Переглянуті</h2>
      </div>

      {isLoading ? (
        <div className={styles.relatedGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={styles.relatedCard}
              style={{
                height: 280,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 12,
              }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className={styles.reviewsEmpty} style={{ padding: "24px 0" }}>
          Перегляньте інші товари — вони з’являться тут.
        </p>
      ) : (
        <>
          <div className={styles.relatedGrid}>
            {visible.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                slug={item.slug}
                name={item.name}
                price={item.price}
                image={item.image}
                category={item.category}
                wcProduct={
                  (item.ratingAverage != null || (item.ratingCount ?? 0) > 0
                    ? {
                        average_rating: String(item.ratingAverage ?? 0),
                        rating_count: Number(item.ratingCount) || 0,
                      }
                    : undefined) as any
                }
                isFluid
              />
            ))}
          </div>
          {items.length > 6 && (
            <SliderNav
              activeIndex={slideIdx}
              dots={totalSlides}
              onPrev={onPrev}
              onNext={onNext}
              onDotClick={(i) => setSlideIdx(i)}
            />
          )}
        </>
      )}
    </div>
  );
});

RecentlyViewed.displayName = "RecentlyViewed";

export default RecentlyViewed;
