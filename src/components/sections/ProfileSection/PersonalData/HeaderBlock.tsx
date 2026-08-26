"use client";

import React from "react";
import styles from "./PersonalData.module.css";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeaderBlock() {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{t("profile.personalDataTitle")}</h2>
      <p className={styles.description}>{t("profile.personalDataHint")}</p>
    </div>
  );
}
