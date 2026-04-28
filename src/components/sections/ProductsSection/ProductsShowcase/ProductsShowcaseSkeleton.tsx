"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import productCardStyles from "../ProductCard/ProductCard.module.css";
import s from "./ProductsShowcase.module.css";

const ProductsShowcaseSkeleton = () => {
  const renderProductCardSkeleton = (key: number) => (
    <div key={key} className={`${s.slide} ${s.skeletonCardWrapper}`}>
      <div className={productCardStyles.productCard}>
        <div className={productCardStyles.cardImage}>
          <Skeleton className={s.skeletonCardImage} />
          <div className={productCardStyles.badges}>
            <Skeleton className={s.skeletonBadgesItem} />
          </div>
          <Skeleton
            className={`${productCardStyles.favoriteBtn} ${s.skeletonFavoriteBtn}`}
          />
        </div>
        <div className={productCardStyles.cardContent}>
          <div className={productCardStyles.ratingRow}>
            <Skeleton className={s.skeletonRatingRow} />
          </div>
          <div className={productCardStyles.namePricingBlock}>
            <Skeleton
              className={`${productCardStyles.productName} ${s.skeletonProductName}`}
            />
            <div className={productCardStyles.pricing}>
              <Skeleton className={s.skeletonPricingFirst} />
              <Skeleton className={s.skeletonPricingSecond} />
            </div>
          </div>
          <div className={productCardStyles.subscriptionBlock}>
            <div className={productCardStyles.ratingPriceBlock}>
              <div className={productCardStyles.subscriptionPrice}>
                <div className={productCardStyles.subscriptionDiscount}>
                  <Skeleton className={s.skeletonSubscriptionDiscount} />
                </div>
              </div>
            </div>
            <Skeleton className={`${productCardStyles.cartBtn} ${s.skeletonCartBtn}`} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className={s.section}>
      <div className={s.container}>
        {/* Skeleton для заголовка */}
        <div className={s.header}>
          <div className={s.headerLeft}>
            <span className={s.skeletonTitle} aria-hidden="true" />
          </div>
          <div className={s.headerRight}>
            {/* Skeleton для навігації */}
            <div className={s.skeletonHeaderRight}>
              <span className={s.skeletonNavBtn} aria-hidden="true" />
              <div className={s.skeletonDotNavigation}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`${s.skeletonDot} ${
                      i === 1 ? s.skeletonDotActive : ""
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className={s.skeletonNavBtn} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Skeleton для карток */}
        <div className={s.coursesSlider}>
          <div className={s.grid}>
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

        {/* Skeleton для футера */}
        <div className={s.footer}>
          <span className={s.skeletonAllCoursesBtn} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default ProductsShowcaseSkeleton;
