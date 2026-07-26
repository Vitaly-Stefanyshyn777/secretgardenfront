"use client";
import React from "react";
import s from "./ProductsShowcase.module.css";

const ProductsShowcaseSkeleton = () => {
  const renderProductCardSkeleton = (key: number) => (
    <div key={key} className={`${s.slide} ${s.skeletonCardWrapper}`}>
      <div className={s.skeletonCard}>
        <div className={s.skeletonCardImageWrap}>
          <span className={s.skeletonCardImage} aria-hidden="true" />
          <span className={s.skeletonFavoriteBtn} aria-hidden="true" />
        </div>
        <div className={s.skeletonCardContent}>
          <span className={s.skeletonRatingRow} aria-hidden="true" />
          <span className={s.skeletonProductName} aria-hidden="true" />
          <div className={s.skeletonPriceRow}>
            <span className={s.skeletonPricingFirst} aria-hidden="true" />
            <span className={s.skeletonPricingSecond} aria-hidden="true" />
          </div>
          <span className={s.skeletonCartBtn} aria-hidden="true" />
        </div>
      </div>
    </div>
  );

  return (
    <section className={`${s.section} ${s.sectionMobile}`}>
      <div className={s.container}>
        <div className={s.header}>
          <div className={s.headerLeft}>
            <span className={s.skeletonTitle} aria-hidden="true" />
          </div>
          <div className={s.skeletonHeaderRight}>
            <span className={s.skeletonNavBtn} aria-hidden="true" />
            <div className={s.skeletonDotNavigation}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`${s.skeletonDot} ${i === 1 ? s.skeletonDotActive : ""}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className={s.skeletonNavBtn} aria-hidden="true" />
          </div>
        </div>

        <div className={s.coursesSlider}>
          <div className={s.skeletonSlider}>
            {[1, 2, 3].map((i) => renderProductCardSkeleton(i))}
          </div>
          <div className={`${s.grid} ${s.skeletonGridDesktop}`}>
            {[1, 2, 3, 4, 5, 6].map((i) =>
              i === 6 ? (
                <div key={i} className={s.slideDesktopOnly}>
                  {renderProductCardSkeleton(i)}
                </div>
              ) : (
                renderProductCardSkeleton(i)
              ),
            )}
          </div>
        </div>

        <div className={s.footer}>
          <span className={s.skeletonAllCoursesBtn} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default ProductsShowcaseSkeleton;
