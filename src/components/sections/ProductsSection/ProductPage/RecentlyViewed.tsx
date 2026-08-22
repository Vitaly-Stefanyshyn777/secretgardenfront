"use client";

import React, { useState, useMemo, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import ProductCard from "@/components/sections/ProductsSection/ProductCard/ProductCard";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { useRecentlyViewed } from "@/components/hooks/useRecentlyViewed";
import { useTranslation } from "@/hooks/useTranslation";
import styles from "./ProductPage.module.css";
import "swiper/css";

interface RecentlyViewedProps {
  currentProductSlug?: string;
  isMobile?: boolean;
}

const RecentlyViewed = memo(function RecentlyViewed({
  currentProductSlug,
  isMobile = false,
}: RecentlyViewedProps) {
  const { t } = useTranslation();
  const { items, isLoading } = useRecentlyViewed(currentProductSlug);
  const baseItemsPerView = isMobile ? 2 : 6;
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

  const renderCard = (item: (typeof items)[number]) => (
    <ProductCard
      key={item.id}
      id={item.id}
      slug={item.slug}
      name={item.name}
      price={item.price}
      image={item.image}
      category={item.category}
      wcProduct={
        {
          average_rating: String(item.ratingAverage ?? 0),
          rating_count: Number(item.ratingCount) || 0,
        } as any
      }
      isFluid
      showcaseDark={isMobile}
      compact={isMobile}
    />
  );

  return (
    <div
      className={`${styles.relatedProducts} ${
        isMobile ? styles.relatedProductsMobile : ""
      }`}
    >
      <div className={styles.relatedProductsHeader}>
        <h2>{t("product.recentlyViewed")}</h2>
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
        <p className={styles.relatedEmptyHint}>
          {t("product.recentlyViewedEmpty")}
        </p>
      ) : isMobile ? (
        <div className={styles.relatedSliderWrap}>
          <Swiper
            modules={[A11y]}
            slidesPerView="auto"
            slidesPerGroup={1}
            spaceBetween={13}
            className={styles.relatedSwiper}
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} className={styles.relatedSlide}>
                {renderCard(item)}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <>
          <div className={styles.relatedGrid}>
            {visible.map((item) => renderCard(item))}
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
