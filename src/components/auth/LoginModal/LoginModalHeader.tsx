"use client";

import s from "./LoginModal.module.css";
import { CloseButtonIcon } from "@/components/Icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";

interface LoginModalHeaderProps {
  onClose: () => void;
}

export default function LoginModalHeader({ onClose }: LoginModalHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={s.headerBlock}>
      <div className={s.header}>
        <h2 className={s.headerText}>{t("auth.loginTitle")}</h2>
        <button className={s.close} onClick={onClose}>
          <CloseButtonIcon />
        </button>
      </div>
      <p className={s.subtitle}>{t("auth.loginSubtitle")}</p>
    </div>
  );
}
