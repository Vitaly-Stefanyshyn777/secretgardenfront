"use client";

import React, { useEffect, useState } from "react";
import styles from "./PurchasedCourses.module.css";

interface PurchasedCoursesProps {
  title?: string;
}

const PurchasedCourses: React.FC<PurchasedCoursesProps> = ({
  title = "Придбані курси",
}) => {
  const [language, setLanguage] = useState<"uk" | "en">("uk");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("preferredLanguage");
    if (stored === "uk" || stored === "en") {
      setLanguage(stored);
    }
  }, []);

  const handleLanguageChange = (lang: "uk" | "en") => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("preferredLanguage", lang);
    }
  };

  return (
    <div className={styles.purchasedCourses}>
      <h2 className={styles.title}>{title}</h2>
      {/* <div className={styles.divider}></div> */}
      <div className={styles.langActions}>
        <button
          type="button"
          className={`${styles.langButton} ${
            language === "uk" ? styles.langButtonActive : ""
          }`}
          onClick={() => handleLanguageChange("uk")}
        >
          Українська
        </button>
        <button
          type="button"
          className={`${styles.langButton} ${
            language === "en" ? styles.langButtonActive : ""
          }`}
          onClick={() => handleLanguageChange("en")}
        >
          English
        </button>
      </div>
    </div>
  );
};

export default PurchasedCourses;
