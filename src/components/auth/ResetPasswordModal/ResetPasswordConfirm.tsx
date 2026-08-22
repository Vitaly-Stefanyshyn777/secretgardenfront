"use client";

import { CloseButtonIcon } from "@/components/Icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./ResetPasswordModal.module.css";

interface ResetPasswordConfirmProps {
  email: string;
  onBackToEmail: () => void;
  onResendEmail: () => void;
  onClose: () => void;
}

export default function ResetPasswordConfirm({
  email,
  onBackToEmail,
  onClose,
}: ResetPasswordConfirmProps) {
  const { t } = useTranslation();

  return (
    <>
      <button className={s.close} onClick={onClose}>
        <CloseButtonIcon />
      </button>

      <div className={s.headerBlock}>
        <div className={s.header}>
          <h2 className={s.headerTitle}>{t("auth.resetEmailSent")}</h2>
        </div>
      </div>

      <div className={s.confirmContent}>
        <div className={s.confirmText}>
          <p className={s.confirmDescription}>
            {t("auth.resetEmailSentDescription", { email })}
          </p>
        </div>

        <div className={s.confirmActions}>
          <button className={s.loginButton} onClick={onBackToEmail}>
            {t("auth.login")}
          </button>
        </div>
      </div>
    </>
  );
}
