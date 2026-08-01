"use client";
import React, { useState, useMemo, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import ProductCard from "@/components/sections/ProductsSection/ProductCard/ProductCard";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { normalizeImageUrl } from "@/lib/imageUtils";
import type { RelatedProductsProps, RelatedProduct } from "./types";
import styles from "./ProductPage.module.css";
import "swiper/css";

const RelatedProducts = memo(function RelatedProducts({
  relatedCategoryProducts,
  currentProductSlug,
  isMobile = false,
}: RelatedProductsProps) {
  const baseItemsPerView = isMobile ? 2 : 6;
  const [slideIdx, setSlideIdx] = useState(0);
  const itemsPerView = baseItemsPerView;

  const mappedRelated: RelatedProduct[] = useMemo(() => {
    if (!Array.isArray(relatedCategoryProducts)) {
      return [];
    }

    const filtered = relatedCategoryProducts.filter(
      (p: any) =>
        (p.slug || "").toLowerCase() !==
        (currentProductSlug || "").toLowerCase(),
    );
    return filtered.slice(0, 12).map((p: any) => {
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
        wcProduct: {
          average_rating: String(ratingAvg ?? 0),
          rating_count: Number(ratingCnt) || 0,
        },
      };
    });
  }, [relatedCategoryProducts, currentProductSlug]);

  const totalSlides = useMemo(() => {
    return Math.max(
      1,
      mappedRelated.length > itemsPerView
        ? mappedRelated.length - itemsPerView + 1
        : 1,
    );
  }, [mappedRelated.length, itemsPerView]);

  const start = slideIdx;
  const visible = mappedRelated.slice(start, start + itemsPerView);

  const onPrev = () =>
    setSlideIdx((idx) => (idx - 1 + totalSlides) % totalSlides);
  const onNext = () => setSlideIdx((idx) => (idx + 1) % totalSlides);

  const renderCard = (item: RelatedProduct) => (
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
      showcaseDark={isMobile}
    />
  );

  return (
    <div
      className={`${styles.relatedProducts} ${
        isMobile ? styles.relatedProductsMobile : ""
      }`}
    >
      <div className={styles.relatedProductsHeader}>
        <h2>Вам може сподобатись</h2>
      </div>
      {isMobile ? (
        <div className={styles.relatedSliderWrap}>
          <Swiper
            modules={[A11y]}
            slidesPerView="auto"
            slidesPerGroup={1}
            spaceBetween={13}
            className={styles.relatedSwiper}
          >
            {mappedRelated.map((item) => (
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
          {mappedRelated.length > 6 && (
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

RelatedProducts.displayName = "RelatedProducts";

export default RelatedProducts;
