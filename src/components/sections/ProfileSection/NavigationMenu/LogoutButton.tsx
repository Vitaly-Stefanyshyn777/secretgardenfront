"use client";

import React, { useState } from "react";
import styles from "./NavigationMenu.module.css";
import type { NavigationItem } from "./types";

type Props = {
  item: NavigationItem;
  isActive: boolean;
  onLogout: () => Promise<void> | void;
};

export default function LogoutButton({ item, isActive, onLogout }: Props) {
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
            <p className={styles.logoutTitle}>
              Вийти з особистого кабінету?
            </p>
            <div className={styles.logoutButtons}>
              <button
                type="button"
                className={styles.logoutConfirm}
                onClick={handleConfirmLogout}
              >
                Так, вийти
              </button>
              <button
                type="button"
                className={styles.logoutCancel}
                onClick={() => setIsModalOpen(false)}
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
