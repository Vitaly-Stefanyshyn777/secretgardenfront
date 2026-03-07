"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./FilterSortPanel.module.css";
import { FilterMobileIcon } from "@/components/Icons/Icons";
import FilterModal from "@/components/ui/FilterModal/FilterModal";
import SortDropdown, { type SortOption } from "./SortDropdown";
import PriceOrderDropdown from "./PriceOrderDropdown";

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

export type SortType = "popular" | "new" | "sale" | "price_desc" | "price_asc";

export interface FilterSortPanelProps {
  filters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  onReset?: () => void;
  products?: Product[];
  onApply?: () => void;
  sortBy?: SortType;
  onSortChange?: (sort: SortType) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (perPage: number) => void;
  hideSort?: boolean;
  hideItemsPerPage?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  /** Коли true — рендерить тільки sortSection (для вбудовування поруч з "Всі товари") */
  embeddedInCatalog?: boolean;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "popular", label: "Популярне" },
  { value: "new", label: "Новинки" },
  { value: "sale", label: "Акційні товари" },
  { value: "price_desc", label: "Ціна за зменшенням" },
  { value: "price_asc", label: "Ціна за зростанням" },
];

export const ITEMS_PER_PAGE_OPTIONS: SortOption[] = [
  { value: "16", label: "16" },
  { value: "24", label: "24" },
  { value: "36", label: "36" },
];

const FilterSortPanel: React.FC<FilterSortPanelProps> = ({
  filters = {
    priceMin: 0,
    priceMax: 100000,
    colors: [],
    sizes: [],
    certification: [],
  },
  onFiltersChange = () => {},
  onReset = () => {},
  products = [],
  onApply = () => {},
  sortBy = "popular",
  onSortChange = () => {},
  itemsPerPage = 16,
  onItemsPerPageChange = () => {},
  hideSort = false,
  hideItemsPerPage = false,
  searchTerm = "",
  onSearchChange = () => {},
  embeddedInCatalog = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  if (embeddedInCatalog && !isMobile) {
    return (
      <div className={styles.sortSection}>
        {!hideSort && (
          <>
            <SortDropdown
              label="Сортування"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={(value) => onSortChange(value as SortType)}
              variant="sort"
            />
            <PriceOrderDropdown
              value={
                sortBy === "price_desc" || sortBy === "price_asc"
                  ? sortBy
                  : "price_desc"
              }
              onChange={(value) => onSortChange(value)}
            />
          </>
        )}
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Пошук..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <img
            src="/icons/Icon-12.svg"
            alt=""
            className={styles.searchIcon}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.filterSortPanel}>
        <div className={styles.filterSortBar}>
          {isMobile ? (
            <>
              <button
                className={styles.filterMobileButton}
                onClick={() => setIsFilterModalOpen(true)}
              >
                <FilterMobileIcon className={styles.filterMobileIcon} />
                <span className={styles.filterMobileLabel}>Фільтр</span>
              </button>
              <div className={styles.sortSection}>
                <SortDropdown
                  label="Сортування"
                  value={sortBy}
                  options={SORT_OPTIONS}
                  onChange={(value) => {
                    onSortChange(value as SortType);
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.filterSection}>
                <span className={styles.label}>Фільтр</span>
              </div>
              <div className={styles.sortSection}>
                {!hideSort && (
                  <>
                    <SortDropdown
                      label="Сортування"
                      value={sortBy}
                      options={SORT_OPTIONS}
                      onChange={(value) => onSortChange(value as SortType)}
                      variant="sort"
                    />
                    <PriceOrderDropdown
                      value={
                        sortBy === "price_desc" || sortBy === "price_asc"
                          ? sortBy
                          : "price_desc"
                      }
                      onChange={(value) => onSortChange(value)}
                    />
                  </>
                )}
                <div className={styles.searchWrapper}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Пошук..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                  <img
                    src="/icons/Icon-12.svg"
                    alt=""
                    className={styles.searchIcon}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {isMobile && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onReset={onReset}
          products={products}
          onApply={() => {
            onApply();
            setIsFilterModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default FilterSortPanel;
