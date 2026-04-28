"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./ProductsGrid.module.css";
import productCardStyles from "../ProductCard/ProductCard.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const ProductsGridSkeleton: React.FC = () => {
  const renderProductCardSkeleton = () => (
    <div className={productCardStyles.productCard}>
      <div className={productCardStyles.cardImage}>
        <Skeleton className={styles.skeletonCardImage} />
        <div
          className={`${productCardStyles.badges} ${styles.skeletonBadgesContainer}`}
        >
          <Skeleton className={styles.skeletonBadgesItem} />
        </div>
        <Skeleton
          className={`${productCardStyles.favoriteBtn} ${styles.skeletonFavoriteBtn} ${styles.skeletonFavoriteBtnSize}`}
        />
      </div>
      <div className={productCardStyles.cardContent}>
        <div className={productCardStyles.ratingRow}>
          <Skeleton className={styles.skeletonRatingRow} />
        </div>
        <div className={productCardStyles.namePricingBlock}>
          <Skeleton
            className={`${productCardStyles.productName} ${styles.skeletonProductName} ${styles.skeletonProductNameSize}`}
          />
          <div className={productCardStyles.pricing}>
            <Skeleton className={styles.skeletonPricingFirst} />
            <Skeleton className={styles.skeletonPricingSecond} />
          </div>
        </div>
        <div className={productCardStyles.subscriptionBlock}>
          <div className={productCardStyles.ratingPriceBlock}>
            <div className={productCardStyles.subscriptionPrice}>
              <div className={productCardStyles.subscriptionDiscount}>
                <Skeleton className={styles.skeletonSubscriptionDiscount} />
              </div>
            </div>
          </div>
          <Skeleton
            className={`${productCardStyles.cartBtn} ${styles.skeletonCartBtn}`}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.productsGrid}>
      {[...Array(16)].map((_, i) => (
        <React.Fragment key={i}>{renderProductCardSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};

export default ProductsGridSkeleton;
