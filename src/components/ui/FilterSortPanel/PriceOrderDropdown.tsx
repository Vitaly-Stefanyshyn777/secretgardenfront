"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./SortDropdown.module.css";

export type PriceOrder = "price_desc" | "price_asc";

interface PriceOrderDropdownProps {
  /** Поточне сортування; якщо price_desc/price_asc — показує активний варіант */
  value: string;
  onChange: (value: PriceOrder) => void;
}

const PRICE_ORDER_OPTIONS: { value: PriceOrder; label: string }[] = [
  { value: "price_desc", label: "За спаданням" },
  { value: "price_asc", label: "За зростанням" },
];

const PriceOrderDropdown: React.FC<PriceOrderDropdownProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const currentLabel =
    PRICE_ORDER_OPTIONS.find((o) => o.value === value)?.label ?? "За спаданням";

  return (
    <div ref={containerRef} className={`${styles.sortContainer} ${styles.priceOrderContainer}`}>
      <button
        type="button"
        className={`${styles.sortButton} ${styles.priceOrderButton}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Сортування за ціною"
      >
        <div
          className={`${styles.sortIconWrapper} ${isOpen ? styles.iconRotated : ""}`}
        >
          <Image
            src="/icons/Dropdown-2.svg"
            alt=""
            width={48}
            height={48}
            className={styles.sortDropdownIcon}
          />
        </div>
      </button>
      {isOpen && (
        <div className={`${styles.sortDropdown} ${styles.priceOrderDropdown}`}>
          {PRICE_ORDER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.sortDropdownItem} ${
                value === option.value ? styles.sortDropdownItemActive : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceOrderDropdown;
