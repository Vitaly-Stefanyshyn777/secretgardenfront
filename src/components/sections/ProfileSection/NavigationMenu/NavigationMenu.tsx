"use client";
import React from "react";
import styles from "./NavigationMenu.module.css";
import { useAuthStore } from "@/store/auth";
import { usePathname } from "next/navigation";
import { navigationItems } from "./data";
import NavigationLink from "./NavigationLink";
import LogoutButton from "./LogoutButton";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import type { NavigationItem } from "./types";

const NavigationMenu: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return (
    <nav className={styles.navigationMenu}>
      <ul className={styles.menuList}>
        {navigationItems.map((item, index) => {
          const { labelKey, ...rest } = item;
          const resolvedItem: NavigationItem = {
            ...rest,
            label: t(labelKey),
          };
          const isActive = pathname === item.href;

          // Перевіряємо, чи це не останній елемент у масиві
          const isNotLast = index < navigationItems.length - 1;

          return (
            <React.Fragment key={item.id}>
              {item.id === "logout" ? (
                <LogoutButton
                  item={resolvedItem}
                  isActive={isActive}
                  onLogout={async () => {
                    try {
                      queryClient.clear();
                      await logout();
                      window.location.href = "/";
                    } catch {}
                  }}
                />
              ) : (
                <NavigationLink item={resolvedItem} isActive={isActive} />
              )}

              {/* Рендеримо лінію між кожним блоком */}
              {isNotLast && <div className={styles.menuListLine}></div>}
            </React.Fragment>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavigationMenu;
