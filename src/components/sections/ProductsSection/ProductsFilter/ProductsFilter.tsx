"use client";
import React from "react";
import styles from "./ProductsFilter.module.css";
import { RangeInput } from "@/components/ui/RangeInput/RangeInput";
import { CertificationFilter } from "../filters/CertificationFilter/CertificationFilter";
import { CategoryFiltersCheckboxes } from "../filters/CategoryFiltersCheckboxes/CategoryFiltersCheckboxes";
import ButtonFilter from "@/components/ui/ButtonFilter/ButtonFilter";
import { useMemo } from "react";
import { type ProductFilters } from "@/components/hooks/useFilteredProducts";
import { useTranslation } from "@/hooks/useTranslation";

interface FilterState {
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  certification: string[];
  dynamicFilters: Record<string, string[]>;
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

interface ProductsFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  products: Product[];
  searchTerm: string;
  onApply?: (params: Record<string, unknown>) => void;
  loading?: boolean;
  /** Показувати кнопки «Застосувати» / «Скинути» — тільки в підкатегоріях */
  showFilterActions?: boolean;
}

const ProductsFilter = ({
  filters,
  onFiltersChange,
  onReset,
  products,
  onApply,
  loading = false,
  showFilterActions = false,
}: ProductsFilterProps) => {
  const { t } = useTranslation();
  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (values: { min: number; max: number }) => {
    // Змінюємо тільки один фільтр за раз для уникнення конфліктів
    if (values.min !== filters.priceMin) {
      handleFilterChange("priceMin", values.min);
    }

    if (values.max !== filters.priceMax) {
      handleFilterChange("priceMax", values.max);
    }
  };

  // Build WC filter params for useFilteredProducts
  const wcFilters = useMemo(() => {
    const params: Partial<ProductFilters> = {};
    const selected = filters.certification ?? [];
    if (selected.length === 1) {
      params.category = selected[0];
    } else if (selected.length > 1) {
      params.category = selected;
    }
    if (filters.dynamicFilters && Object.keys(filters.dynamicFilters).length > 0) {
      params.categoryFilters = filters.dynamicFilters;
    }
    return params as Record<string, unknown>;
  }, [filters]);

  return (
    <div className={styles.filterContainer}>
      <h2 className={styles.filterSectionTitle}>
        {t("catalog.categoriesLine1")} <br />
        {t("catalog.categoriesLine2")}
      </h2>
      <div className={styles.filterSidebar}>
        <RangeInput
          min={0}
          max={100000}
          value={{ min: filters.priceMin, max: filters.priceMax }}
          onChange={handlePriceChange}
        />

        <CertificationFilter
          value={filters.certification}
          onChange={(value) => handleFilterChange("certification", value)}
          hideAllCategoriesButton={showFilterActions}
        />

        <CategoryFiltersCheckboxes
          value={filters.dynamicFilters ?? {}}
          onChange={(value) => handleFilterChange("dynamicFilters", value)}
        />
      </div>
      {showFilterActions && (
        <ButtonFilter
          onApply={() => {
            if (onApply) onApply(wcFilters);
          }}
          onReset={onReset}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ProductsFilter;
