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
  iconVariant?: "default" | "catalog";
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  className = "",
  variant = "sort",
  iconVariant = "default",
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

  const sortIconSize = 48;

  const catalogSortIcon = (
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
  );

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
            : styles.sortButton
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
          } ${isOpen && iconVariant !== "catalog" ? styles.iconRotated : ""}`}
        >
          {variant !== "itemsPerPage" && iconVariant === "catalog" ? (
            catalogSortIcon
          ) : (
            <Image
              src="/icons/Dropdown.svg"
              alt=""
              width={variant === "itemsPerPage" ? 14 : sortIconSize}
              height={variant === "itemsPerPage" ? 8 : sortIconSize}
              className={
                variant === "itemsPerPage"
                  ? styles.itemsPerPageDropdownIcon
                  : styles.sortDropdownIcon
              }
            />
          )}
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
