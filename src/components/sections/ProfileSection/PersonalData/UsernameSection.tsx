"use client";

import React from "react";
import styles from "./PersonalData.module.css";
import { UserIcon } from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  firstName: string;
  lastName: string;
  onChange: (firstName: string, lastName: string) => void;
};

export default function UsernameSection({
  firstName,
  lastName,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{t("profile.fullNameLabel")}</h3>

      <div className={styles.inputGroup}>
        <div className={`${styles.wrapperBlock} ${styles.wrapperBlockSingle}`}>
          <InputField
            icon={<UserIcon />}
            label={t("profile.fullNameLabel")}
            id="profile-username-name-field"
            type="text"
            value={fullName}
            onChange={(e) => {
              // Дозволяємо будь-яке введення, включаючи пробіли
              const value = e.target.value;

              // Очищаємо від зайвих символів, але зберігаємо пробіли
              const cleanValue = value.replace(/[.!]+$/, ""); // Видаляємо крапки та знаки оклику в кінці

              // Зберігаємо все як firstName, а lastName залишаємо пустим
              // Це спростить логіку і дозволить пробіли
              onChange(cleanValue, "");
            }}
          />
        </div>
      </div>
    </div>
  );
}
