"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./FAQSection.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const FAQSectionSkeleton: React.FC = () => {
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.contentBlock}>
          <div className={styles.contentTextBlock}>
            <Skeleton className={styles.skeletonSubtitle} />
            <Skeleton className={styles.skeletonTitle} />
          </div>

          <div className={styles.content}>
            <div className={styles.leftColumn}>
              <div className={styles.imageContainer}>
                <Skeleton
                  className={`${styles.heroImage} ${styles.skeletonHeroImage}`}
                />
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.faqList}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={styles.faqItem}>
                    <div
                      className={`${styles.faqButton} ${styles.skeletonFaqButton}`}
                    >
                      <Skeleton className={styles.skeletonQuestion} />
                      <Skeleton className={styles.skeletonChevron} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSectionSkeleton;

