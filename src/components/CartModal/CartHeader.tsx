"use client";
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./CartModal.module.css";

interface CartHeaderProps {
  onClose: () => void;
  showClose?: boolean;
}

export default function CartHeader({
  onClose,
  showClose = true,
}: CartHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={s.header}>
      <h3 className={s.title}>{t("cart.title")}</h3>
      {showClose && (
        <div className={s.headerActions}>
          <button
            type="button"
            className={s.close}
            aria-label={t("common.close")}
            onClick={onClose}
          >
            <img src="/icons/prefix-3.svg" alt={t("common.close")} />
          </button>
        </div>
      )}
    </div>
  );
}
