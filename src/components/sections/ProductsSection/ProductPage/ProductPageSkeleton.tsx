"use client";
import React from "react";
import styles from "./ProductPage.module.css";

const ProductPageSkeleton: React.FC = () => {
  return (
    <div className={styles.productPage}>
      <div className={styles.breadcrumb}>
        <div className={`${styles.skeleton} ${styles.skeletonBreadcrumb}`} />
      </div>

      <div className={styles.productContainer}>
        <div className={styles.productLeftColumn}>
          <div className={styles.imageSection}>
            <div className={styles.thumbnails}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`${styles.skeleton} ${styles.skeletonThumbnail}`}
                />
              ))}
            </div>

            <div className={styles.mainImage}>
              <div
                className={`${styles.skeleton} ${styles.skeletonMainImage}`}
              />
            </div>
          </div>

          <div className={styles.productReviews}>
            <div className={styles.skeletonTabs}>
              <div
                className={`${styles.skeleton} ${styles.skeletonTab} ${styles.skeletonTabShort}`}
              />
              <div
                className={`${styles.skeleton} ${styles.skeletonTab} ${styles.skeletonTabLong}`}
              />
            </div>

            <div className={styles.reviewsList}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`${styles.skeletonReviewCard}`}>
                  <div className={styles.reviewHeader}>
                    <div
                      className={`${styles.skeleton} ${styles.skeletonReviewAuthor}`}
                    />
                    <div
                      className={`${styles.skeleton} ${styles.skeletonReviewStars}`}
                    />
                  </div>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonDescriptionLine}`}
                  />
                  <div
                    className={`${styles.skeleton} ${styles.skeletonDescriptionLine} ${styles.skeletonLineWide}`}
                  />
                  <div
                    className={`${styles.skeleton} ${styles.skeletonDescriptionLine} ${styles.skeletonLineNarrow}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.productInfo}>
          <div className={styles.productInfoBlock}>
            <div className={styles.categoryTagBlock}>
              <div className={styles.titleWithBadges}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonProductTitle} ${styles.skeletonTitleWide}`}
                />
              </div>

              <div className={styles.stockRatingBlock}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonStockInfo} ${styles.skeletonStockShort}`}
                />
                <div
                  className={`${styles.skeleton} ${styles.skeletonRatingRow} ${styles.skeletonRatingShort}`}
                />
              </div>

              <div className={styles.productDescriptionBlock}>
                <div className={`${styles.skeleton} ${styles.skeletonDescriptionLine} ${styles.skeletonLineMedium}`} />
                <div className={`${styles.skeleton} ${styles.skeletonDescriptionLine} ${styles.skeletonLineSmall}`} />
              </div>
            </div>

            <div className={styles.currenInfoBlock}>
              <div className={styles.priceSection}>
                <div className={`${styles.skeleton} ${styles.skeletonPriceBlock} ${styles.skeletonPriceShort}`} />
              </div>

              <div className={styles.actionButtons}>
                <div className={`${styles.skeleton} ${styles.skeletonQuantityIcon} ${styles.skeletonQuantityShort}`} />
                <div className={`${styles.skeleton} ${styles.skeletonQuantityIcon} ${styles.skeletonQuantityShort}`} />
                <div className={`${styles.skeleton} ${styles.skeletonAddToCartBtn} ${styles.skeletonAddToCartShort}`} />
                <div className={`${styles.skeleton} ${styles.skeletonFavoriteBtn} ${styles.skeletonFavoriteShort}`} />
              </div>
            </div>

            <div className={styles.expandableSections}>
              <div className={styles.characteristicsBlock}>
                <div className={`${styles.skeleton} ${styles.skeletonRelatedTitle} ${styles.skeletonSectionTitle}`} />
                <div className={styles.characteristicsTable}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={styles.characteristicRow}>
                      <div className={`${styles.skeleton} ${styles.skeletonCharacteristic} ${styles.skeletonCharacteristicName}`} />
                      <div className={`${styles.skeleton} ${styles.skeletonCharacteristic} ${i === 0 ? styles.skeletonCharacteristicValueShort : styles.skeletonCharacteristicValue}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.descriptionBlock}>
                <div className={`${styles.skeleton} ${styles.skeletonRelatedTitle} ${styles.skeletonSectionTitleSmall}`} />
                <div className={styles.descriptionContent}>
                  <div className={`${styles.skeleton} ${styles.skeletonDescriptionLine}`} />
                  <div className={`${styles.skeleton} ${styles.skeletonDescriptionLine} ${styles.skeletonLineXL}`} />
                  <div className={`${styles.skeleton} ${styles.skeletonDescriptionLine} ${styles.skeletonLineLarge}`} />
                  <div className={`${styles.skeleton} ${styles.skeletonDescriptionLine} ${styles.skeletonLineNarrow}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.relatedProducts}>
        <div className={styles.relatedProductsHeader}>
          <div className={`${styles.skeleton} ${styles.skeletonRelatedTitle} ${styles.skeletonRelatedTitleShort}`} />
        </div>
        <div className={styles.relatedGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.productLeftColumn}>
              <div
                className={`${styles.skeleton} ${styles.skeletonCardImage} ${styles.skeletonMarginBottom12}`}
              />
              <div
                className={`${styles.skeleton} ${styles.skeletonRelatedProductName} ${styles.skeletonMarginBottom8}`}
              />
              <div
                className={`${styles.skeleton} ${styles.skeletonRelatedProductPrice}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;
