"use client";
import React from "react";
import { useCartStore } from "@/store/cart";
import s from "./CartModal.module.css";

interface CartHeaderProps {
  onClose: () => void;
}

export default function CartHeader({ onClose }: CartHeaderProps) {
  const syncAndClose = useCartStore((st) => st.syncAndClose);

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={s.header}>
      <h3 className={s.title}>Кошик</h3>
      <div className={s.headerActions}>
        <button
          type="button"
          className={s.syncClose}
          onClick={() => syncAndClose()}
          title="Закрити і відправити кошик на бекенд (тест)"
        >
          Закрити + Sync
        </button>
        <button
          type="button"
          className={s.close}
          aria-label="Закрити"
          onClick={handleClose}
        >
          <img src="/icons/prefix-3.svg" alt="Закрити" />
        </button>
      </div>
    </div>
  );
}

