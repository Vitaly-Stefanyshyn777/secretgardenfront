"use client";

import React, { useState } from "react";
import styles from "./NavigationMenu.module.css";
import { useTranslation } from "@/hooks/useTranslation";
import type { NavigationItem } from "./types";

type Props = {
  item: NavigationItem;
  isActive: boolean;
  onLogout: () => Promise<void> | void;
};

export default function LogoutButton({ item, isActive, onLogout }: Props) {
  const { t } = useTranslation();
  const { icon } = item;
  const isIconString = typeof icon === "string";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmLogout = async () => {
    setIsModalOpen(false);
    await onLogout();
  };

  return (
    <>
      <li className={styles.menuItem}>
        <button
          type="button"
          className={`${styles.menuLink} ${isActive ? styles.active : ""}`}
          onClick={() => setIsModalOpen(true)}
        >
          <span className={styles.menuIcon}>
            {isIconString ? (
              <img src={icon} alt={item.label} className={styles.iconSvg} />
            ) : (
              (() => {
                const IconComponent = icon;
                return <IconComponent className={styles.iconSvg} />;
              })()
            )}
          </span>
          <span className={styles.menuLabel}>{item.label}</span>
        </button>
      </li>

      {isModalOpen && (
        <div className={styles.logoutModalOverlay}>
          <div className={styles.logoutModal}>
            <p className={styles.logoutTitle}>{t("profile.logoutTitle")}</p>
            <div className={styles.logoutButtons}>
              <button
                type="button"
                className={styles.logoutConfirm}
                onClick={handleConfirmLogout}
              >
                {t("profile.logoutConfirm")}
              </button>
              <button
                type="button"
                className={styles.logoutCancel}
                onClick={() => setIsModalOpen(false)}
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
