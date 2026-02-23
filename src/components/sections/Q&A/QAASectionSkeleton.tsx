"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./QAASection.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const QAASectionSkeleton: React.FC = () => {
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.contentBlock}>
          <div className={styles.contentTextBlock}>
            <Skeleton
              className={`${styles.title} ${styles.skeletonTitle}`}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.rightColumn}>
              <div className={styles.faqList}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={styles.faqItem}>
                    <div
                      className={`${styles.faqButton} ${styles.faqButtonSkeleton}`}
                    >
                      <Skeleton
                        className={`${styles.question} ${styles.skeletonQuestion}`}
                      />
                      <Skeleton
                        borderRadius="50%"
                        className={styles.skeletonChevron}
                      />
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

export default QAASectionSkeleton;

