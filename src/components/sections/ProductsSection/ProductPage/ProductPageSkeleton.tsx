"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./ProductPage.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const ProductPageSkeleton: React.FC = () => {
  return (
    <div className={styles.productPage}>
      <div className={styles.productContainer}>
        {/* Image Section Skeleton */}
        <div className={styles.imageSection}>
          <div className={styles.thumbnails}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className={styles.skeletonThumbnail} />
            ))}
          </div>
          <div className={`${styles.mainImage} ${styles.skeletonPositionRelative}`}>
            <Skeleton
              className={`${styles.skeletonMainImage} ${styles.skeletonCardImage}`}
            />
            <div className={styles.skeletonBadgesAbsolute}>
              <Skeleton className={styles.skeletonBadge} />
              <Skeleton className={styles.skeletonBadge} />
            </div>
          </div>
        </div>

        {/* Product Info Section Skeleton */}
        <div className={styles.productInfo}>
          <div className={styles.productInfoBlock}>
            <div className={styles.categoryTagBlock}>
              <Skeleton
                className={`${styles.skeletonCategoryTag} ${styles.skeletonMarginBottom16}`}
              />
              <div className={styles.titleWithBadges}>
                <Skeleton
                  className={`${styles.skeletonProductTitle} ${styles.productTitle}`}
                />
                <Skeleton className={styles.skeletonAdditionalBlock1} />
                <Skeleton className={styles.skeletonAdditionalBlock2} />
              </div>
            </div>

            <div className={styles.productDescriptionBlock}>
              {/* Color Section Skeleton */}
              <div className={styles.colorSection}>
                <Skeleton
                  className={`${styles.skeletonColorSectionTitle} ${styles.skeletonMarginBottom12}`}
                />
                <div className={styles.colorOptions}>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className={styles.skeletonColorOption} />
                  ))}
                </div>
              </div>

              {/* Size Section Skeleton */}
              <div className={styles.sizeSection}>
                <Skeleton
                  className={`${styles.skeletonSizeSectionTitle} ${styles.skeletonMarginBottom12}`}
                />
                <div className={styles.sizeOptions}>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className={styles.skeletonSizeButton}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.currenInfoBlock}>
              {/* Price Section Skeleton */}
              <div className={styles.priceSection}>
                <Skeleton
                  className={`${styles.skeletonPriceBlock} ${styles.skeletonMarginBottom8}`}
                />
                <Skeleton className={styles.skeletonDescriptionLine} />
              </div>

              {/* Mobile only description block */}
              <Skeleton
                count={2}
                width="100%"
                className={`${styles.skeletonMarginBottom24} ${styles.mobileOnlyDescription}`}
              />

              {/* Subscription Offer Skeleton */}
              <div className={styles.subscriptionOffer}>
                <Skeleton
                  className={`${styles.skeletonSubscriptionIcon} ${styles.skeletonMarginRight8}`}
                />
                <Skeleton className={styles.skeletonSubscriptionText} count={2} />
              </div>

              {/* Action Buttons Skeleton */}
              <div className={styles.actionButtons}>
                <div className={styles.quantitySection}>
                  <Skeleton className={styles.skeletonAddToCartBtn} />
                </div>
                <div className={styles.addToCartBtnWrapper}>
                  <Skeleton className={styles.skeletonFavoriteBtn} />
                  <Skeleton className={styles.skeletonBuyNowBtn} />
                </div>
              </div>

              {/* Details Row Skeleton */}
              <div className={styles.detailsRow}>
                <Skeleton className={styles.skeletonDescriptionLine} />
                <Skeleton className={styles.skeletonCharacteristicsLine} />
              </div>
            </div>
          </div>

          {/* Expandable Sections Skeleton */}
          <div className={styles.expandableSections}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Skeleton className={styles.skeletonCharacteristic} />
                </div>
                <div className={styles.sectionContent}>
                  <Skeleton count={3} width="100%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className={styles.relatedProducts}>
        <div className={styles.relatedProductsHeader}>
          <Skeleton className={`${styles.skeletonRelatedTitle} ${styles.skeletonMarginBottom8}`} />
          <Skeleton className={styles.skeletonRelatedSubtitle} />
        </div>
        <div className={styles.relatedGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonFlexColumn}>
              <Skeleton
                className={`${styles.skeletonCardImage} ${styles.skeletonMarginBottom12}`}
              />
              <Skeleton
                className={`${styles.skeletonRelatedProductName} ${styles.skeletonMarginBottom8}`}
              />
              <Skeleton className={styles.skeletonRelatedProductPrice} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;
