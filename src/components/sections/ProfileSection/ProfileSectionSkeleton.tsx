"use client";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./ProfileSection.module.css";
import navStyles from "./NavigationMenu/NavigationMenu.module.css";
import videoStyles from "./VideoInstruction/VideoInstruction.module.css";
import communityStyles from "./CommunityChats/CommunityChats.module.css";
import purchasedStyles from "./PurchasedCourses/PurchasedCourses.module.css";
import UserProfileSkeleton from "./UserProfile/UserProfileSkeleton";
import SectionDivider from "./SectionDivider/SectionDivider";
import "react-loading-skeleton/dist/skeleton.css";

const ProfileSectionSkeleton: React.FC = () => {
  // isMobile більше не потрібен — ContactSupport скелетон видалено
  return (
    <div className={styles.portfolioSection}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <UserProfileSkeleton />
          <nav className={navStyles.navigationMenu}>
            <ul className={navStyles.menuList}>
              {[...Array(8)].map((_, i) => (
                <li key={i} className={navStyles.menuItem}>
                  <div className={navStyles.menuLink}>
                    <Skeleton width={20} height={20} />
                    <Skeleton width={120} height={20} />
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.mainContent}>
          {/* VideoInstruction Skeleton */}
          <div className={videoStyles.videoInstruction}>
            <div className={videoStyles.header}>
              <div className={videoStyles.textContent}>
                <Skeleton count={1} className={videoStyles.titleSkeleton} />
                <Skeleton count={1} className={videoStyles.descriptionSkeleton} />
              </div>
              <div className={videoStyles.statusContainer}>
                <Skeleton className={videoStyles.statusSkeleton} />
              </div>
            </div>
            <div className={videoStyles.videoContainer}>
              <Skeleton className={videoStyles.videoSkeleton} />
            </div>
          </div>

          <SectionDivider className={styles.hideFirstDividerOnMobile} />

          {/* CommunityChats Skeleton */}
          <div className={communityStyles.communityChats}>
            <h2 className={communityStyles.title}>Посилання на чати з ком'юніті</h2>
            <div className={communityStyles.chatsGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={communityStyles.chatCard}>
                  <div className={communityStyles.chatIcon}>
                    <Skeleton width={37} height={24} />
                  </div>
                  <div className={communityStyles.chatInfo}>
                    <Skeleton width={120} height={20} style={{ marginBottom: 8 }} />
                    <Skeleton width={80} height={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SectionDivider />

          {/* PurchasedCourses Skeleton */}
          <div className={purchasedStyles.purchasedCourses}>
            <h2 className={purchasedStyles.title}>Придбані курси</h2>
            <div className={purchasedStyles.divider}></div>
            <div className={purchasedStyles.coursesList}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={purchasedStyles.skeletonCard}>
                  <div className={purchasedStyles.skeletonImageContainer}></div>
                  <div className={purchasedStyles.skeletonInfo}>
                    <div className={purchasedStyles.skeletonType}></div>
                    <div className={purchasedStyles.skeletonTitle}></div>
                    <div className={purchasedStyles.skeletonDescription}></div>
                  </div>
                  <div className={purchasedStyles.skeletonActions}>
                    <div className={purchasedStyles.skeletonPrice}></div>
                    <div className={purchasedStyles.skeletonButtonContainer}>
                      <div className={purchasedStyles.skeletonButton}></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SectionDivider />
        </div>
      </div>
    </div>
  );
};

export default ProfileSectionSkeleton;
