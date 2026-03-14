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
          {/* Скелетони VideoInstruction та PurchasedCourses видалено */}
          <SectionDivider />
        </div>
      </div>
    </div>
  );
};

export default ProfileSectionSkeleton;
