"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./PersonalData.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const PersonalDataSkeleton: React.FC = () => {
  const renderInputSkeleton = () => (
    <div className={styles.skeletonInput}>
      <Skeleton
        className={styles.skeletonInputField}
        borderRadius={4}
        height="100%"
        width="100%"
      />
      <div className={styles.skeletonInputIcon}>
        <Skeleton circle width="100%" height="100%" />
      </div>
    </div>
  );

  return (
    <div className={styles.personalData}>
      <div className={styles.header}>
        <Skeleton className={styles.skeletonTitle} borderRadius={8} />
        <Skeleton className={styles.skeletonDescription} borderRadius={6} />
        <Skeleton className={styles.skeletonDescription} borderRadius={6} />
      </div>

      <div className={styles.divider}></div>

      <div className={styles.form}>
        <div className={styles.section}>
          <div className={styles.profilePhotoSection}>
            <div className={styles.profilePhotoBlock}>
              <Skeleton
                circle
                className={styles.skeletonAvatar}
                width="100%"
                height="100%"
              />
              <div className={styles.sectionHeader}>
                <Skeleton
                  className={styles.skeletonSectionTitle}
                  borderRadius={6}
                />
                <Skeleton className={styles.skeletonFileInfo} borderRadius={6} />
              </div>
            </div>
            <div className={styles.photoActions}>
              <Skeleton className={styles.skeletonPhotoBtn} borderRadius={15} />
              <Skeleton className={styles.skeletonPhotoBtn} borderRadius={15} />
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <Skeleton
            className={styles.skeletonSectionTitle}
            borderRadius={6}
            style={{ marginBottom: "12px" }}
          />
          <div className={styles.inputGroup}>
            {renderInputSkeleton()}
            {renderInputSkeleton()}
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <Skeleton
            className={styles.skeletonSectionTitle}
            borderRadius={6}
            style={{ marginBottom: "12px" }}
          />
          <div className={styles.inputGroup}>
            <div className={styles.wrapperBlock}>
              {renderInputSkeleton()}
              {renderInputSkeleton()}
            </div>
            <div className={styles.wrapperBlock}>
              {renderInputSkeleton()}
              {renderInputSkeleton()}
            </div>
          </div>
        </div>

        <div className={styles.saveSection}>
          <Skeleton className={styles.skeletonSaveBtn} borderRadius={8} />
        </div>
      </div>
    </div>
  );
};

export default PersonalDataSkeleton;
