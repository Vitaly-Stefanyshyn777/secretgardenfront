"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/language";
import styles from "./PurchasedCourses.module.css";

interface PurchasedCoursesProps {
  title?: string;
}

const PurchasedCourses: React.FC<PurchasedCoursesProps> = ({
  title,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const locale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);

  const handleLanguageChange = (lang: "uk" | "en") => {
    setLocale(lang);
    queryClient.invalidateQueries();
  };

  return (
    <div className={styles.purchasedCourses}>
      <h2 className={styles.title}>{title ?? t("profile.changeLanguage")}</h2>
      <div className={styles.langActions}>
        <button
          type="button"
          className={`${styles.langButton} ${
            locale === "uk" ? styles.langButtonActive : ""
          }`}
          onClick={() => handleLanguageChange("uk")}
        >
          {t("profile.ukrainian")}
        </button>
        <button
          type="button"
          className={`${styles.langButton} ${
            locale === "en" ? styles.langButtonActive : ""
          }`}
          onClick={() => handleLanguageChange("en")}
        >
          {t("profile.english")}
        </button>
      </div>
    </div>
  );
};

export default PurchasedCourses;
