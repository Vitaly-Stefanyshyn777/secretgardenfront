"use client";
import React from "react";
import styles from "./OrdersHistory.module.css";

const OrdersHistorySkeleton: React.FC = () => (
  <div className={styles.ordersList}>
    {[...Array(2)].map((_, index) => (
      <div key={index} className={styles.orderCard}>
        <div className={styles.cardProducts}>
          {[...Array(2)].map((_, pIdx) => (
            <div key={pIdx} className={styles.productItem}>
              <div className={`${styles.skeletonImage} ${styles.skeleton}`}></div>
              <div className={styles.productInfo}>
                <div className={styles.productNameGroup}>
                  <div className={`${styles.skeletonTitle} ${styles.skeleton}`}></div>
                  <div className={`${styles.skeletonQty} ${styles.skeleton}`}></div>
                </div>
                <div className={`${styles.skeletonPrice} ${styles.skeleton}`}></div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cardInfo}>
          <div className={styles.infoContent}>
            <div className={styles.infoRows}>
              {[...Array(3)].map((_, iIdx) => (
                <div key={iIdx} className={styles.infoRow}>
                  <div className={`${styles.skeletonLabel} ${styles.skeleton}`}></div>
                  <div className={`${styles.skeletonValue} ${styles.skeleton}`}></div>
                </div>
              ))}
            </div>

            <div className={styles.statusSection}>
              <div className={`${styles.skeletonLabel} ${styles.skeleton}`}></div>
              <div className={`${styles.skeletonStatus} ${styles.skeleton}`}></div>
            </div>
          </div>

          <div className={styles.cardActions}>
            <div className={`${styles.skeletonButton} ${styles.skeleton}`}></div>
            <div className={`${styles.skeletonButton} ${styles.skeleton}`}></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default OrdersHistorySkeleton;
