"use client";

import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./TrainersShowcase.module.css";
import "react-loading-skeleton/dist/skeleton.css";

interface TrainersShowcaseSkeletonProps {
  title?: string;
  subtitle?: string;
  itemsPerPage?: number; // десктоп кількість (за замовчуванням 4)
}

export default function TrainersShowcaseSkeleton({
  title,
  subtitle,
  itemsPerPage = 4,
}: TrainersShowcaseSkeletonProps) {
  // Рендеримо ОДНУ структуру з 4 карток.
  // На мобілці через CSS показуємо лише 2 (перша повна + друга частково видима).
  const skeletonCount = itemsPerPage;

  return (
    <section className={styles.trainersSection}>
      <div className={styles.container}>
        {(title || subtitle) && (
          <div className={styles.header}>
            {subtitle && (
              <Skeleton className={`${styles.badge} ${styles.skeletonHeaderBadge}`} />
            )}
            {title && (
              <Skeleton className={`${styles.title} ${styles.skeletonHeaderTitle}`} />
            )}
          </div>
        )}

        <div className={`${styles.trainersGrid} ${styles.skeletonGrid}`}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <article
              key={index}
              className={`${styles.trainerCard} ${
                index === 0
                  ? styles.skeletonFull
                  : index === 1
                  ? styles.skeletonPartial
                  : styles.skeletonHidden
              }`}
            >
              <div className={styles.imageContainer}>
                <Skeleton className={styles.skeletonImage} />
                <div className={styles.instagramBadge}>
                  <Skeleton className={styles.skeletonInstagramIcon} />
                  <Skeleton className={styles.skeletonInstagramText} />
                </div>
              </div>

              <div className={styles.trainerInfo}>
                <Skeleton
                  className={`${styles.trainerName} ${styles.skeletonTrainerName}`}
                />
                <div className={styles.skeletonDescription}>
                  {Array.from({ length: 5 }).map((__, i) => (
                    <Skeleton
                      key={i}
                      className={`${styles.trainerDescription} ${styles.skeletonDescriptionLine}`}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

