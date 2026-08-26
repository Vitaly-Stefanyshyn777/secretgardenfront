"use client";

import React, { useState, useMemo, memo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { SwiperRef } from "swiper/react";
import ProductCard from "@/components/sections/ProductsSection/ProductCard/ProductCard";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { useRecentlyViewed } from "@/components/hooks/useRecentlyViewed";
import { useTranslation } from "@/hooks/useTranslation";
import styles from "./ProductPage.module.css";
import "swiper/css";
import "swiper/css/free-mode";

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
  const swiperRef = useRef<SwiperRef>(null);
  const itemsPerView = baseItemsPerView;

  const totalSlides = useMemo(
    () =>
      Math.max(
        1,
        items.length > itemsPerView ? items.length - itemsPerView + 1 : 1,
      ),
    [items.length, itemsPerView],
  );

  const mobileDots = Math.max(1, items.length - 1);

  const start = slideIdx;
  const visible = items.slice(start, start + itemsPerView);
  const onPrev = () =>
    setSlideIdx((idx) => (idx - 1 + totalSlides) % totalSlides);
  const onNext = () => setSlideIdx((idx) => (idx + 1) % totalSlides);

  const handleMobilePrev = () => swiperRef.current?.swiper.slidePrev();
  const handleMobileNext = () => swiperRef.current?.swiper.slideNext();
  const handleMobileDot = (i: number) =>
    swiperRef.current?.swiper.slideTo(i);

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
        <div className={styles.relatedSkeletonGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={styles.relatedCard}
              style={{
                width: "var(--related-slide-w, 164px)",
                flexShrink: 0,
                height: 278,
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
        <>
          <div className={styles.relatedSliderWrap}>
            <Swiper
              ref={swiperRef}
              modules={[A11y, FreeMode]}
              slidesPerView="auto"
              slidesPerGroup={1}
              spaceBetween={13}
              freeMode={{ enabled: true, momentum: true }}
              resistanceRatio={0.65}
              watchOverflow
              className={styles.relatedSwiper}
              onSlideChange={(swiper: SwiperType) =>
                setSlideIdx(swiper.activeIndex)
              }
            >
              {items.map((item) => (
                <SwiperSlide key={item.id} className={styles.relatedSlide}>
                  {renderCard(item)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          {items.length > 2 && (
            <SliderNav
              activeIndex={Math.min(slideIdx, mobileDots - 1)}
              dots={mobileDots}
              onPrev={handleMobilePrev}
              onNext={handleMobileNext}
              onDotClick={handleMobileDot}
              containerClassName={styles.relatedMobileNav}
            />
          )}
        </>
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
