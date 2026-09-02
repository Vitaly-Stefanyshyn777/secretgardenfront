"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAgeVerificationStore } from "@/store/ageVerification";
import s from "./AgeVerificationModal.module.css";

export default function AgeVerificationModal() {
  const { t } = useTranslation();
  const confirm = useAgeVerificationStore((state) => state.confirm);

  return (
    <div className={s.backdrop} role="dialog" aria-modal="true">
      <div className={s.modal}>
        <h2 className={s.title}>{t("ageVerification.title")}</h2>
        <p className={s.text}>{t("ageVerification.description")}</p>
        <div className={s.actions}>
          <button
            type="button"
            className={s.btnPrimary}
            onClick={() => confirm(true)}
          >
            {t("ageVerification.confirmYes")}
          </button>
          <button
            type="button"
            className={s.btnSecondary}
            onClick={() => confirm(false)}
          >
            {t("ageVerification.confirmNo")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AgeBlockedScreen() {
  const { t } = useTranslation();

  return (
    <div className={s.backdrop}>
      <div className={s.blocked}>
        <h2 className={s.title}>{t("ageVerification.blockedTitle")}</h2>
        <p className={s.text}>{t("ageVerification.blockedDescription")}</p>
      </div>
    </div>
  );
}
