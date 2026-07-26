"use client";
import React from "react";
import s from "./CartModal.module.css";

interface CartHeaderProps {
  onClose: () => void;
  showClose?: boolean;
}

export default function CartHeader({
  onClose,
  showClose = true,
}: CartHeaderProps) {
  return (
    <div className={s.header}>
      <h3 className={s.title}>Кошик</h3>
      {showClose && (
        <div className={s.headerActions}>
          <button
            type="button"
            className={s.close}
            aria-label="Закрити"
            onClick={onClose}
          >
            <img src="/icons/prefix-3.svg" alt="Закрити" />
          </button>
        </div>
      )}
    </div>
  );
}
