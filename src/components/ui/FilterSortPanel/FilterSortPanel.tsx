"use client";
import React, { useState } from "react";
import styles from "./FilterSortPanel.module.css";
import { FilterMobileIcon } from "@/components/Icons/Icons";
import FilterModal from "@/components/ui/FilterModal/FilterModal";
import SortDropdown, { type SortOption } from "./SortDropdown";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationPath } from "@/i18n";

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

export const SORT_OPTION_KEYS: Array<{
  value: SortType;
  labelKey: TranslationPath;
}> = [
  { value: "popular", labelKey: "catalog.sortPopular" },
  { value: "new", labelKey: "catalog.sortNew" },
  { value: "price_desc", labelKey: "catalog.sortPriceDesc" },
  { value: "price_asc", labelKey: "catalog.sortPriceAsc" },
];

/** @deprecated static UK labels — use SORT_OPTION_KEYS + t() */
export const SORT_OPTIONS: SortOption[] = [
  { value: "popular", label: "Популярне" },
  { value: "new", label: "Нове" },
  { value: "price_desc", label: "За зменшенням" },
  { value: "price_asc", label: "За зростанням" },
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
  hideSort = false,
  searchTerm = "",
  onSearchChange = () => {},
  embeddedInCatalog = false,
}) => {
  const { t } = useTranslation();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const sortOptions: SortOption[] = SORT_OPTION_KEYS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  if (embeddedInCatalog) {
    return (
      <>
        <div className={`${styles.sortSection} ${styles.desktopOnly}`}>
          {!hideSort && (
            <SortDropdown
              label={t("catalog.sortLabel")}
              value={sortBy}
              options={sortOptions}
              onChange={(value) => onSortChange(value as SortType)}
              variant="sort"
              iconVariant="catalog"
            />
          )}
          <div className={styles.searchWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t("catalog.searchPlaceholder")}
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

        <div className={`${styles.catalogMobileFilterBar} ${styles.mobileOnly}`}>
          <button
            type="button"
            className={styles.catalogCategoriesButton}
            onClick={() => setIsFilterModalOpen(true)}
          >
            <span className={styles.catalogCategoriesLabel}>
              {t("catalog.categoriesAndFilters")}
            </span>
            <svg
              className={styles.catalogCategoriesChevron}
              viewBox="0 0 15 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7.14844 8.27878C6.82015 8.27878 6.52834 8.16935 6.30948 7.95049L0.473227 2.11424C-0.000968739 1.67652 -0.000968739 0.910515 0.473227 0.472797C0.910945 -0.00139878 1.67695 -0.00139878 2.11467 0.472797L7.14844 5.47009L12.1457 0.472797C12.5834 -0.00139878 13.3495 -0.00139878 13.7872 0.472797C14.2614 0.910515 14.2614 1.67652 13.7872 2.11424L7.95092 7.95049C7.73206 8.16935 7.44025 8.27878 7.14844 8.27878Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <SortDropdown
            label={t("catalog.sortLabel")}
            value={sortBy}
            options={sortOptions}
            onChange={(value) => onSortChange(value as SortType)}
            className={styles.catalogSortIconBtn}
            iconVariant="catalog"
          />
        </div>

        <FilterModal
          variant="catalog"
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
      </>
    );
  }

  return (
    <>
      <div className={styles.filterSortPanel}>
        <div className={styles.filterSortBar}>
          <div className={`${styles.filterBarDesktop} ${styles.desktopOnly}`}>
            <div className={styles.filterSection}>
              <span className={styles.label}>Фільтр</span>
            </div>
            <div className={styles.sortSection}>
              {!hideSort && (
                <SortDropdown
                  label={t("catalog.sortLabel")}
                  value={sortBy}
                  options={sortOptions}
                  onChange={(value) => onSortChange(value as SortType)}
                  variant="sort"
                  iconVariant="catalog"
                />
              )}
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={t("catalog.searchPlaceholder")}
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
          </div>

          <div className={`${styles.filterBarMobile} ${styles.mobileOnly}`}>
            <button
              className={styles.filterMobileButton}
              onClick={() => setIsFilterModalOpen(true)}
            >
              <FilterMobileIcon className={styles.filterMobileIcon} />
              <span className={styles.filterMobileLabel}>Фільтр</span>
            </button>
            <div className={styles.sortSection}>
              <SortDropdown
                label={t("catalog.sortLabel")}
                value={sortBy}
                options={sortOptions}
                onChange={(value) => {
                  onSortChange(value as SortType);
                }}
                iconVariant="catalog"
              />
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};

export default FilterSortPanel;
