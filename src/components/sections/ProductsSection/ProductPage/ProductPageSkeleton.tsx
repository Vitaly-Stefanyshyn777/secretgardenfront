"use client";
import React from "react";
import styles from "./ProductPage.module.css";

const ProductPageSkeleton: React.FC = () => {
  return (
    <div className={styles.productPage}>
      <div className={styles.productContainer}>
        {/* Left Column: Gallery and Reviews */}
        <div className={styles.productLeftColumn}>
          {/* Gallery Skeleton */}
          <div className={styles.imageSection}>
            <div className={styles.thumbnails}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`${styles.skeletonThumbnail} ${styles.skeleton}`}
                />
              ))}
            </div>
            <div className={styles.mainImage}>
              <div
                className={`${styles.skeletonMainImage} ${styles.skeleton}`}
              />
            </div>
          </div>

          {/* Reviews Skeleton */}
          <div className={styles.productReviews}>
            <div className={styles.skeletonTabs}>
              <div className={`${styles.skeletonTab} ${styles.skeleton}`} />
              <div className={`${styles.skeletonTab} ${styles.skeleton}`} />
            </div>
            <div className={styles.reviewsList}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className={styles.skeletonReviewCard}>
                  <div className={styles.reviewHeader}>
                    <div
                      className={`${styles.skeletonReviewAuthor} ${styles.skeleton}`}
                    />
                    <div
                      className={`${styles.skeletonReviewStars} ${styles.skeleton}`}
                    />
                  </div>
                  <div
                    className={`${styles.skeletonReviewText} ${styles.skeleton}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className={styles.productInfo}>
          <div className={styles.productInfoBlock}>
            {/* Category, Title, Stock, Rating */}
            <div className={styles.categoryTagBlock}>
              <div className={styles.titleWithBadges}>
                <div
                  className={`${styles.skeletonProductTitle} ${styles.skeleton}`}
                />
              </div>
              <div className={styles.stockRatingBlock}>
                <div
                  className={`${styles.skeletonStockInfo} ${styles.skeleton}`}
                />
                <div
                  className={`${styles.skeletonRatingRow} ${styles.skeleton}`}
                />
              </div>
              <div className={styles.productDescriptionBlock}>
                <div
                  className={`${styles.skeletonDescriptionLine} ${styles.skeleton}`}
                  style={{ width: "100%" }}
                />
                <div
                  className={`${styles.skeletonDescriptionLine} ${styles.skeleton}`}
                  style={{ width: "90%" }}
                />
              </div>
            </div>

            {/* Variations */}
            <div className={styles.productDescriptionBlock}>
              {/* Color Section */}
              <div className={styles.colorSection}>
                <div
                  className={`${styles.skeletonColorSectionTitle} ${styles.skeleton}`}
                />
                <div className={styles.colorOptions}>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.skeletonColorOption} ${styles.skeleton}`}
                    />
                  ))}
                </div>
              </div>

              {/* Size Section */}
              <div className={styles.sizeSection}>
                <div
                  className={`${styles.skeletonSizeSectionTitle} ${styles.skeleton}`}
                />
                <div className={styles.sizeOptions}>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.skeletonSizeButton} ${styles.skeleton}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Price and Actions */}
            <div className={styles.currenInfoBlock}>
              <div className={styles.priceSection}>
                <div
                  className={`${styles.skeletonPriceBlock} ${styles.skeleton}`}
                />
              </div>

              <div className={styles.actionButtons}>
                <div
                  className={`${styles.skeletonAddToCartBtn} ${styles.skeleton}`}
                />
                <div
                  className={`${styles.skeletonFavoriteBtn} ${styles.skeleton}`}
                />
              </div>
            </div>

            {/* Expandable Sections */}
            <div className={styles.expandableSections}>
              {/* Characteristics Block */}
              <div className={styles.characteristicsBlock}>
                <div
                  className={`${styles.skeletonRelatedTitle} ${styles.skeleton} ${styles.skeletonMarginBottom16}`}
                  style={{ height: "40px", width: "300px" }}
                />
                <div className={styles.characteristicsTable}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={styles.characteristicRow}>
                      <div
                        className={`${styles.skeletonCharacteristic} ${styles.skeleton}`}
                        style={{ width: "40%" }}
                      />
                      <div
                        className={`${styles.skeletonCharacteristic} ${styles.skeleton}`}
                        style={{ width: "30%" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Block */}
              <div className={styles.descriptionBlock}>
                <div
                  className={`${styles.skeletonRelatedTitle} ${styles.skeleton} ${styles.skeletonMarginBottom16}`}
                  style={{ height: "40px", width: "150px" }}
                />
                <div className={styles.descriptionContent}>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.skeletonDescriptionLine} ${styles.skeleton}`}
                      style={{ width: i === 2 ? "70%" : "100%" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className={styles.relatedProducts}>
        <div className={styles.relatedProductsHeader}>
          <div
            className={`${styles.skeletonRelatedTitle} ${styles.skeleton} ${styles.skeletonMarginBottom16}`}
            style={{ width: "250px", height: "40px" }}
          />
        </div>
        <div className={styles.relatedGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.productLeftColumn}>
              <div
                className={`${styles.skeletonCardImage} ${styles.skeleton} ${styles.skeletonMarginBottom12}`}
              />
              <div
                className={`${styles.skeletonRelatedProductName} ${styles.skeleton} ${styles.skeletonMarginBottom8}`}
              />
              <div
                className={`${styles.skeletonRelatedProductPrice} ${styles.skeleton}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recently Viewed Section */}
      <div className={styles.relatedProducts}>
        <div className={styles.relatedProductsHeader}>
          <div
            className={`${styles.skeletonRelatedTitle} ${styles.skeleton} ${styles.skeletonMarginBottom16}`}
            style={{ width: "250px", height: "40px" }}
          />
        </div>
        <div className={styles.relatedGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.productLeftColumn}>
              <div
                className={`${styles.skeletonCardImage} ${styles.skeleton} ${styles.skeletonMarginBottom12}`}
              />
              <div
                className={`${styles.skeletonRelatedProductName} ${styles.skeleton} ${styles.skeletonMarginBottom8}`}
              />
              <div
                className={`${styles.skeletonRelatedProductPrice} ${styles.skeleton}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;
