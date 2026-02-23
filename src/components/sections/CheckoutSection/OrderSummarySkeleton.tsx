"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./CheckoutSection.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const OrderSummarySkeleton: React.FC = () => {
  return (
    <div className={s.summaryCard}>
      <div className={s.summaryHeader}>
        <Skeleton className={s.skeletonTitle} />
        <div className={s.skeletonHeaderControls}>
          <Skeleton className={s.skeletonHeaderButton} />
          <Skeleton className={s.skeletonHeaderIcon} />
        </div>
      </div>
      <div className={s.summaryDivider}></div>

      <div className={s.summaryList}>
        {[...Array(3)].slice(1).map((_, idx) => (
          <div key={idx + 1} className={s.item}>
            <div className={s.itemMain}>
              <Skeleton className={s.skeletonImage} />
              <div className={s.contentCol}>
                <Skeleton className={s.skeletonProductName} />
                <Skeleton className={s.skeletonProductDescription} />
                <div className={s.controlsBlock}>
                  <div className={s.skeletonControls}>
                    <Skeleton className={s.skeletonControlButton} />
                    <Skeleton className={s.skeletonControlIcon} />
                    <Skeleton className={s.skeletonControlButton} />
                  </div>
                  <div className={s.priceWrap}>
                    <Skeleton className={s.skeletonPrice} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.summaryDivider}></div>
      <div className={s.totals}>
        <div className={s.row}>
          <Skeleton className={s.skeletonRowLabel} />
          <Skeleton className={s.skeletonRowAmount} />
        </div>
        <div className={s.row}>
          <Skeleton className={s.skeletonRowLabel} />
          <Skeleton className={s.skeletonRowAmount} />
        </div>
        <div className={s.row}>
          <Skeleton className={s.skeletonRowLabelLarge} />
          <Skeleton className={s.skeletonRowNote} />
        </div>
      </div>

      <div className={s.summaryDivider}></div>
      <div className={s.rowStrong}>
        <Skeleton className={s.skeletonTotalLabel} />
        <Skeleton className={s.skeletonTotalAmount} />
      </div>
    </div>
  );
};

export default OrderSummarySkeleton;


