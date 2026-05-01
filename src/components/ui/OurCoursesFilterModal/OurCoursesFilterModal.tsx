"use client";
import React, { useEffect, useRef } from "react";
import styles from "./OurCoursesFilterModal.module.css";
import { CloseButtonIcon } from "@/components/Icons/Icons";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import { ApplyFilterButton } from "@/components/ui/Buttons/ApplyFilterButton";
import { ResetFilterButton } from "@/components/ui/Buttons/ResetFilterButton";

interface FilterState {
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  certification: string;
}

interface Product {
  id?: string;
  name?: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  onSale?: boolean;
  image?: string;
  categories?: Array<{
    id?: number;
    name: string;
    slug?: string;
  }>;
  stockStatus?: string;
}

interface OurCoursesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  products: Product[];
  searchTerm: string;
  onApply: () => void;
  onApplyCategories?: (categoryIds: number[]) => void;
}

const OurCoursesFilterModal: React.FC<OurCoursesFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onReset,
  products,
  searchTerm,
  onApply,
  onApplyCategories,
}) => {
  // Створюємо ref для доступу до handleApply з OurCoursesFilter
  const applyRef = useRef<(() => void) | null>(null);

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

  const handleApply = () => {
    // Викликаємо логіку застосування категорій з OurCoursesFilter
    if (applyRef.current) {
      applyRef.current();
    }
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Фільтр</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseButtonIcon />
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.filterContent}>
            {/* NOTE: OurCoursesFilter був видалений/перенесений.
                Модалка лишилась для сумісності, але зараз не використовується. */}
            <div />
          </div>
        </div>
        <div className={styles.footer}>
          <ApplyFilterButton onClick={handleApply} />
          <ResetFilterButton onClick={handleReset} />
        </div>
      </div>
    </div>
  );
};

export default OurCoursesFilterModal;



