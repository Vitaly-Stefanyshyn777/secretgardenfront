"use client";
import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import s from "./FavoritesModal.module.css";
import "react-loading-skeleton/dist/skeleton.css";
import productCardStyles from "@/components/sections/ProductsSection/ProductCard/ProductCard.module.css";

const skeletonBaseColor = "rgba(255, 255, 255, 0.82)";
const skeletonHighlightColor = "rgba(255, 255, 255, 0.96)";

const FavoritesModalSkeleton: React.FC = () => {
  const renderProductCardSkeleton = (key: number) => (
    <div key={key} className={s.skeletonCardWrapper}>
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
        <div
          className={`${productCardStyles.cardContent} ${s.skeletonCardContent}`}
        >
          <div className={productCardStyles.ratingRow}>
            <Skeleton
              className={s.skeletonRatingRow}
              width={160}
              height={20}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
          </div>
          <div
            className={`${productCardStyles.namePricingBlock} ${s.skeletonNamePricingBlock}`}
          >
            <Skeleton
              className={`${productCardStyles.productName} ${s.skeletonProductName}`}
              width={210}
              height={25}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
            <div
              className={`${productCardStyles.pricing} ${s.skeletonPricingRow}`}
            >
              <Skeleton
                className={s.skeletonPricingFirst}
                width={96}
                height={35}
                baseColor={skeletonBaseColor}
                highlightColor={skeletonHighlightColor}
              />
              <Skeleton
                className={s.skeletonPricingSecond}
                width={96}
                height={35}
                baseColor={skeletonBaseColor}
                highlightColor={skeletonHighlightColor}
              />
            </div>
          </div>
          <div
            className={`${productCardStyles.subscriptionBlock} ${s.skeletonSubscriptionBlock}`}
          >
            <div className={productCardStyles.ratingPriceBlock}>
              <div className={productCardStyles.subscriptionPrice}></div>
            </div>
            <Skeleton
              className={`${productCardStyles.cartBtn} ${s.skeletonCartBtn}`}
              height={50}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SkeletonTheme
      baseColor={skeletonBaseColor}
      highlightColor={skeletonHighlightColor}
    >
      <div className={s.backdrop}>
        <div className={s.modal}>
          <div className={s.topbarListBlock}>
            <div className={s.topbar}>
              <Skeleton width={180} height={32} />
              <Skeleton width={46} height={46} borderRadius={10} />
            </div>

            <div className={s.list}>
              {[1, 2, 3, 4, 5].map((i) => renderProductCardSkeleton(i))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default FavoritesModalSkeleton;
