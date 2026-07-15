"use client";
import React from "react";
import styles from "./FilterModal.module.css";
import { RangeInput } from "@/components/ui/RangeInput/RangeInput";
import { CertificationFilter } from "@/components/sections/ProductsSection/filters/CertificationFilter/CertificationFilter";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import { useEffect } from "react";
import { CloseButtonIcon } from "@/components/Icons/Icons";
import { ApplyFilterButton } from "@/components/ui/Buttons/ApplyFilterButton";
import { ResetFilterButton } from "@/components/ui/Buttons/ResetFilterButton";

interface FilterState {
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  certification: string[];
}

interface Product {
  id: string;
  name: string;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  image: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  stockStatus: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  products: Product[];
  onApply: () => void;
  variant?: "default" | "catalog";
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onReset,
  onApply,
  variant = "default",
}) => {
  const isCatalog = variant === "catalog";
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("filter-modal-open");
    } else {
      document.body.classList.remove("filter-modal-open");
    }
    return () => {
      document.body.classList.remove("filter-modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | string[] | number,
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handlePriceChange = (values: { min: number; max: number }) => {
    handleFilterChange("priceMin", values.min);
    handleFilterChange("priceMax", values.max);
  };

  if (isCatalog) {
    return (
      <div className={styles.overlayCatalog} onClick={onClose}>
        <div
          className={styles.modalCatalog}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.headerCatalog}>
            <h2 className={styles.titleCatalog}>Категорії та фільтри</h2>
            <button
              type="button"
              className={styles.closeButtonCatalog}
              onClick={onClose}
              aria-label="Закрити"
            >
              <CloseButtonIcon />
            </button>
          </div>
          <div className={styles.contentCatalog}>
            <CertificationFilter
              value={filters.certification}
              onChange={(value) => handleFilterChange("certification", value)}
              variant="catalogDropdown"
              onCategorySelect={onClose}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Фільтр</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <CloseButtonIcon />
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.filterSection}>
            <div className={styles.rangeInputWrapper}>
              <RangeInput
                min={0}
                max={100000}
                value={{ min: filters.priceMin, max: filters.priceMax }}
                onChange={handlePriceChange}
              />
            </div>
          </div>

          <div className={styles.filterSection}>
            <CertificationFilter
              value={filters.certification}
              onChange={(value) => handleFilterChange("certification", value)}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <ApplyFilterButton onClick={onApply} />
          <ResetFilterButton onClick={onReset} />
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
