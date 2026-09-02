import React from "react";
import styles from "./Badge.module.css";
import { useTranslation } from "@/hooks/useTranslation";

export type BadgeVariant = "new" | "hit" | "discount";

interface BadgeProps {
  variant: BadgeVariant;
  text?: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant, text, className = "" }) => {
  const { t } = useTranslation();

  const defaultText = {
    new: t("product.badgeNew"),
    hit: t("product.badgeHit"),
    discount: "-20%",
  };

  const displayText = text || defaultText[variant];

  return (
    <span
      className={`${styles.badge} ${styles[`${variant}Badge`]} ${className}`}
    >
      {displayText}
    </span>
  );
};

export default Badge;
