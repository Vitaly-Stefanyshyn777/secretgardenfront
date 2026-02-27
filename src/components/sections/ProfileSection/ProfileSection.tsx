"use client";
import React from "react";
import styles from "./ProfileSection.module.css";
import UserProfile from "./UserProfile/UserProfile";
import NavigationMenu from "./NavigationMenu/NavigationMenu";
import VideoInstruction from "./VideoInstruction/VideoInstruction";
import CommunityChats from "./CommunityChats/CommunityChats";
import PurchasedCourses from "./PurchasedCourses/PurchasedCourses";
import SectionDivider from "./SectionDivider/SectionDivider";
import { usePathname, useRouter } from "next/navigation";
import { ArrowIcon } from "@/components/Icons/Icons";
import { useAuthStore } from "@/store/auth";

interface ProfileSectionProps {
  children?: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);

  // Перевірка валідності токену тепер в layout
  // Тут просто перевіряємо базові умови для безпеки
  if (!isHydrated || !isLoggedIn || !token) {
    return null;
  }

  const showBackBtn = pathname === "/profile/subscription";

  const handleBack = () => {
    router.push("/profile");
  };

  return (
    <div className={styles.portfolioSection}>
      <div
        className={`${styles.container} ${
          pathname === "/profile/trainer-profile" ? styles.trainerContainer : ""
        }`}
      >
        <div className={styles.sidebar}>
          <UserProfile />
          <NavigationMenu />
        </div>

        {showBackBtn && (
          <button className={styles.backBtn} onClick={handleBack}>
            <span className={styles.backBtnIcon}>
              <ArrowIcon />
            </span>
            Назад
          </button>
        )}

        <div className={styles.mainContent}>
          {children || (
            <>
              <VideoInstruction />
              <SectionDivider className={styles.hideFirstDividerOnMobile} />
              <CommunityChats />
              <SectionDivider />
              <PurchasedCourses />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
