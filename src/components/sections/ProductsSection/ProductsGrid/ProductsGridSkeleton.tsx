"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./ProductsGrid.module.css";
import productCardStyles from "../ProductCard/ProductCard.module.css";
import "react-loading-skeleton/dist/skeleton.css";

interface ProductsGridSkeletonProps {
  catalogDarkCards?: boolean;
}

const ProductsGridSkeleton: React.FC<ProductsGridSkeletonProps> = ({
  catalogDarkCards = false,
}) => {
  const renderProductCardSkeleton = () => (
    <div
      className={`${productCardStyles.productCard} ${
        catalogDarkCards
          ? `${productCardStyles.productCardShowcaseDark} ${productCardStyles.productCardFluid}`
          : ""
      }`}
    >
      <div className={productCardStyles.cardImage}>
        <Skeleton className={styles.skeletonCardImage} />
        {!catalogDarkCards && (
          <>
            <div
              className={`${productCardStyles.badges} ${styles.skeletonBadgesContainer}`}
            >
              <Skeleton className={styles.skeletonBadgesItem} />
            </div>
            <Skeleton
              className={`${productCardStyles.favoriteBtn} ${styles.skeletonFavoriteBtn} ${styles.skeletonFavoriteBtnSize}`}
            />
          </>
        )}
      </div>
      <div className={productCardStyles.cardContent}>
        <div className={productCardStyles.ratingRow}>
          <Skeleton
            className={`${styles.skeletonRatingRow} ${
              catalogDarkCards ? styles.skeletonRatingRowDark : ""
            }`}
          />
        </div>
        <div className={productCardStyles.namePricingBlock}>
          <Skeleton
            className={`${productCardStyles.productName} ${styles.skeletonProductName} ${styles.skeletonProductNameSize}`}
          />
          <div className={productCardStyles.pricing}>
            <Skeleton className={styles.skeletonPricingFirst} />
            {!catalogDarkCards && (
              <Skeleton className={styles.skeletonPricingSecond} />
            )}
          </div>
        </div>
        <div className={productCardStyles.subscriptionBlock}>
          {!catalogDarkCards && (
            <div className={productCardStyles.ratingPriceBlock}>
              <div className={productCardStyles.subscriptionPrice}>
                <div className={productCardStyles.subscriptionDiscount}>
                  <Skeleton className={styles.skeletonSubscriptionDiscount} />
                </div>
              </div>
            </div>
          )}
          <Skeleton
            className={`${productCardStyles.cartBtn} ${styles.skeletonCartBtn} ${
              catalogDarkCards ? styles.skeletonCartBtnDark : ""
            }`}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`${styles.productsGrid} ${
        catalogDarkCards ? styles.productsGridDark : ""
      }`}
    >
      {[...Array(8)].map((_, i) => (
        <React.Fragment key={i}>{renderProductCardSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};

export default ProductsGridSkeleton;
