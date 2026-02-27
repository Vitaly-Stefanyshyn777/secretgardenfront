"use client";

import React from "react";
import Link from "next/link";
import styles from "./NavigationMenu.module.css";
import type { NavigationItem } from "./types";

type Props = {
  item: NavigationItem;
  isActive: boolean;
};

export default function NavigationLink({ item, isActive }: Props) {
  const { icon } = item;
  const isIconString = typeof icon === "string";

  return (
    <li className={styles.menuItem}>
      <Link
        href={item.href}
        className={`${styles.menuLink} ${isActive ? styles.active : ""}`}
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
      </Link>
    </li>
  );
}
