"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import productCardStyles from "../ProductCard/ProductCard.module.css";
import s from "./ProductsShowcase.module.css";

const ProductsShowcaseSkeleton = () => {
  const renderProductCardSkeleton = (key: number) => (
    <div
      key={key}
      className={`${s.slide} ${s.skeletonCardWrapper} ${s.skeletonCard}`}
    >
      <div
        className={`${productCardStyles.productCard} ${productCardStyles.productCardShowcaseDark} ${productCardStyles.productCardFluid}`}
      >
        <div className={productCardStyles.cardImage}>
          <Skeleton className={s.skeletonCardImage} />
        </div>
        <div className={productCardStyles.cardContent}>
          <div className={productCardStyles.ratingRow}>
            <Skeleton className={s.skeletonRatingRow} />
          </div>
          <div className={productCardStyles.namePricingBlock}>
            <Skeleton className={s.skeletonProductName} />
            <div className={productCardStyles.pricing}>
              <Skeleton className={s.skeletonPricingFirst} />
            </div>
          </div>
          <div className={productCardStyles.subscriptionBlock}>
            <Skeleton className={s.skeletonCartBtn} />
          </div>
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
