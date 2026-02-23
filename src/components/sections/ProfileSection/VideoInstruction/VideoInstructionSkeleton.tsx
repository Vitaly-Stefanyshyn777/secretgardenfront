"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./VideoInstruction.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const VideoInstructionSkeleton: React.FC = () => {
  return (
    <div className={styles.videoInstruction}>
      <div className={styles.header}>
        <div className={styles.textContent}>
          <Skeleton count={1} className={styles.titleSkeleton} />
          <Skeleton count={1} className={styles.descriptionSkeleton} />
        </div>
        <div className={styles.statusContainer}>
          <Skeleton className={styles.statusSkeleton} />
        </div>
      </div>

      <div className={styles.videoContainer}>
        <Skeleton className={styles.videoSkeleton} />
      </div>
    </div>
  );
};

export default VideoInstructionSkeleton;

