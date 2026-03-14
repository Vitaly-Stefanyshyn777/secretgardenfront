"use client";
import React from "react";
import styles from "./TrainerProfile.module.css";

const TrainerProfileSkeleton: React.FC = () => {
  const renderInputSkeleton = () => (
    <div className={`${styles.skeletonInput} ${styles.skeleton}`}>
      <div
        className={`${styles.skeletonInputIcon} ${styles.skeleton}`}
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div
        className={`${styles.skeletonInputInner} ${styles.skeleton}`}
        style={{ animationDelay: "0.2s" }}
      ></div>
    </div>
  );

  return (
    <div className={styles.trainerProfile}>
      <div className={styles.header}>
        <div className={`${styles.skeletonTitle} ${styles.skeleton}`}></div>
      </div>

      <div className={styles.form}>
        <div className={styles.section}>
          <div className={styles.inputGroup}>
            {renderInputSkeleton()}
            {renderInputSkeleton()}
          </div>

          <div className={styles.inputGroup}>
            {renderInputSkeleton()}
            {renderInputSkeleton()}
          </div>

          <div className={styles.inputGroup}>
            {renderInputSkeleton()}
            {renderInputSkeleton()}
          </div>
        </div>

        <div className={styles.bottomActions}>
          <div className={`${styles.skeletonButton} ${styles.skeleton}`}></div>
          <div
            className={`${styles.skeletonClearButton} ${styles.skeleton}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfileSkeleton;
