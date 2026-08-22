"use client";

import { CloseButtonIcon, SuccessIcon } from "@/components/Icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./ResetPasswordSuccessModal.module.css";

interface ResetPasswordSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordSuccessModal({
  isOpen,
  onClose,
}: ResetPasswordSuccessModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <button className={s.close} onClick={onClose}>
          <CloseButtonIcon />
        </button>

        <div className={s.icon}>
          <SuccessIcon />
        </div>

        <div className={s.titleBlock}>
          <h3 className={s.title}>{t("auth.passwordResetSuccess")}</h3>
          <p className={s.description}>{t("auth.canLoginNow")}</p>
        </div>

        <button className={s.primary} onClick={onClose}>
          {t("auth.login")}
        </button>
      </div>
    </div>
  );
}
