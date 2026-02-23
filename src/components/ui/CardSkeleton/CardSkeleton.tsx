"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./CardSkeleton.module.css";

interface CardSkeletonProps {
  showDescription?: boolean;
  showRating?: boolean;
  showRequirements?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showDescription = false,
  showRating = false,
  showRequirements = false,
}) => {
  return (
    <div className={styles.card}>
      {/* Зображення */}
      <div className={styles.imageContainer}>
        <Skeleton className={styles.imageSkeleton} />
        {/* Skeleton для бейджів */}
        <div className={styles.badgesContainer}>
          <Skeleton className={styles.badgeSkeleton} />
        </div>
        {/* Skeleton для favorite button */}
        <div className={styles.favoriteContainer}>
          <Skeleton className={styles.favoriteSkeleton} />
        </div>
      </div>

      {/* Контент */}
      <div className={styles.content}>
        {/* Назва */}
        <Skeleton className={styles.titleSkeleton} />

        {/* Опис (для курсів) */}
        {showDescription && (
          <Skeleton className={styles.descriptionSkeleton} count={2} />
        )}

        {/* Рейтинг (для курсів) */}
        {showRating && (
          <div className={styles.ratingContainer}>
            <Skeleton className={styles.ratingSkeleton} />
          </div>
        )}

        {/* Requirements badge (для курсів) */}
        {showRequirements && (
          <Skeleton className={styles.requirementsSkeleton} />
        )}

        {/* Футер з ціною та кнопкою */}
        <div className={styles.footer}>
          {/* Ціна */}
          <div className={styles.priceContainer}>
            <Skeleton className={styles.priceSkeleton} />
            <Skeleton className={styles.discountSkeleton} />
          </div>

          {/* Кнопка корзини */}
          <Skeleton className={styles.cartSkeleton} />
        </div>
      </div>
    </div>
  );
};

