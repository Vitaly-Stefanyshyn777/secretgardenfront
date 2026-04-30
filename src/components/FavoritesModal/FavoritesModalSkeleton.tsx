"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./FavoritesModal.module.css";
import "react-loading-skeleton/dist/skeleton.css";
import productCardStyles from "@/components/sections/ProductsSection/ProductCard/ProductCard.module.css";

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
    <div className={s.backdrop}>
      <div className={s.modal}>
        <div className={s.topbarListBlock}>
          <div className={s.topbar}>
            <Skeleton
              width={180}
              height={32}
              baseColor="rgba(217, 186, 136, 0.1)"
              highlightColor="rgba(217, 186, 136, 0.2)"
            />
            <Skeleton
              width={46}
              height={46}
              borderRadius={10}
              baseColor="rgba(217, 186, 136, 0.1)"
              highlightColor="rgba(217, 186, 136, 0.2)"
            />
          </div>

          <div className={s.list}>
            {[1, 2, 3, 4, 5].map((i) => renderProductCardSkeleton(i))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesModalSkeleton;
