"use client";

import s from "./RegisterModal.module.css";
import { CloseButtonIcon } from "@/components/Icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";

interface RegisterModalHeaderProps {
  onClose: () => void;
}

export default function RegisterModalHeader({
  onClose,
}: RegisterModalHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={s.headerBlock}>
      <div className={s.header}>
        <h2 className={s.headerText}>{t("auth.registerTitle")}</h2>
        <button className={s.close} onClick={onClose}>
          <CloseButtonIcon />
        </button>
      </div>
      <p className={s.subtitle}>{t("auth.registerSubtitle")}</p>
    </div>
  );
}
