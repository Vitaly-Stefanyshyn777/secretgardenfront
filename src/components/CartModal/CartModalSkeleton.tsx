"use client";
import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import s from "./CartModal.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CartModalSkeleton: React.FC = () => {
  return (
    <SkeletonTheme
      baseColor="rgba(255, 255, 255, 0.12)"
      highlightColor="rgba(255, 255, 255, 0.18)"
    >
      <div className={s.backdrop}>
        <div className={s.modal}>
          <div className={s.topbarListBlock}>
            <div className={s.header}>
              <Skeleton className={s.skeletonHeaderTitle} />
              <Skeleton className={s.skeletonCloseButton} />
            </div>

            <div className={s.rightSummary}>
              <div className={s.summaryBlock}>
                <div className={s.leftList}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={s.skeletonItem}>
                      <Skeleton className={s.skeletonThumb} />

                      <div className={s.skeletonItemContent}>
                        <div className={s.skeletonItemTopRow}>
                          <Skeleton className={s.skeletonItemName} />
                          <Skeleton className={s.skeletonRemoveButton} />
                        </div>

                        <Skeleton className={s.skeletonItemMeta} />

                        <div className={s.skeletonItemBottomRow}>
                          <div className={s.skeletonControls}>
                            <Skeleton className={s.skeletonControlButton} />
                            <Skeleton className={s.skeletonQtyInput} />
                            <Skeleton className={s.skeletonControlButton} />
                          </div>
                          <Skeleton className={s.skeletonPrice} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={s.summaryPromoBlock}>
                  <Skeleton className={s.skeletonPromoLabel} />
                  <Skeleton className={s.skeletonPromoInput} />
                </div>

                <div className={s.summaryRows}>
                  <div className={s.summaryRow}>
                    <Skeleton className={s.skeletonSummaryLabel} />
                    <Skeleton className={s.skeletonSummaryValue} />
                  </div>
                  <div className={s.summaryRow}>
                    <Skeleton className={s.skeletonSummaryLabelShort} />
                    <Skeleton className={s.skeletonSummaryValueShort} />
                  </div>
                  <div className={s.summaryRow}>
                    <Skeleton className={s.skeletonSummaryLabelMedium} />
                    <Skeleton className={s.skeletonSummaryNote} />
                  </div>
                </div>
              </div>

              <div className={s.summaryBlock}>
                <div className={s.totalRow}>
                  <Skeleton className={s.skeletonTotalLabel} />
                  <Skeleton className={s.skeletonTotalValue} />
                </div>

                <div className={s.summaryButtons}>
                  <Skeleton className={s.skeletonPrimaryButton} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default CartModalSkeleton;
