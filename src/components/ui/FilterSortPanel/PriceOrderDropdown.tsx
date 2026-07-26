"use client";
import React, { useState, useEffect, useRef } from "react";
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

  return (
    <div
      ref={containerRef}
      className={`${styles.sortContainer} ${styles.priceOrderContainer}`}
    >
      <button
        type="button"
        className={`${styles.sortButton} ${styles.priceOrderButton}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Сортування за ціною"
      >
        <div className={styles.sortIconWrapper}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.catalogSortDropdownIcon}
            aria-hidden
          >
            <path
              d="M3.32143 12.75V5.25M5.89286 10.5L3.32143 12.75L0.75 10.5M10.1786 0.75V8.25M7.60714 3L10.1786 0.75L12.75 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
