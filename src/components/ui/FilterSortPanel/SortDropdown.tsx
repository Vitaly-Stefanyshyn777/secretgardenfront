"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./SortDropdown.module.css";
import Image from "next/image";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  label: string;
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
  className?: string;
  variant?: "itemsPerPage" | "sort";
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  className = "",
  variant = "sort",
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`${
        variant === "itemsPerPage"
          ? styles.itemsPerPageContainer
          : styles.sortContainer
      } ${className}`}
    >
      <button
        type="button"
        className={
          variant === "itemsPerPage"
            ? styles.itemsPerPageButton
            : `${styles.sortButton} ${styles.priceOrderButton}`
        }
        onClick={() => setIsOpen(!isOpen)}
      >
        {variant === "itemsPerPage" && (
          <span className={styles.itemsPerPageLabel}>{label}</span>
        )}
        <div
          className={`${
            variant === "itemsPerPage"
              ? styles.itemsPerPageIconWrapper
              : styles.sortIconWrapper
          } ${isOpen ? styles.iconRotated : ""}`}
        >
          <Image
            src={variant === "itemsPerPage" ? "/icons/Dropdown.svg" : "/icons/Dropdown.svg"}
            alt=""
            width={variant === "itemsPerPage" ? 14 : 48}
            height={variant === "itemsPerPage" ? 8 : 48}
            className={
              variant === "itemsPerPage"
                ? styles.itemsPerPageDropdownIcon
                : styles.sortDropdownIcon
            }
          />
        </div>
      </button>
      {isOpen && (
        <div
          className={
            variant === "itemsPerPage"
              ? styles.itemsPerPageDropdown
              : styles.sortDropdown
          }
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${
                variant === "itemsPerPage"
                  ? styles.itemsPerPageDropdownItem
                  : styles.sortDropdownItem
              } ${
                value === option.value
                  ? variant === "itemsPerPage"
                    ? styles.itemsPerPageDropdownItemActive
                    : styles.sortDropdownItemActive
                  : ""
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

export default SortDropdown;
