"use client";
import React from "react";
import s from "./CartModal.module.css";

interface CartHeaderProps {
  onClose: () => void;
}

export default function CartHeader({ onClose }: CartHeaderProps) {
  return (
    <div className={s.header}>
      <h3 className={s.title}>Кошик</h3>
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
    </div>
  );
}

