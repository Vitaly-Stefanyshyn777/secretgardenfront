"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./ProductsCatalog.module.css";
import ProductsFilter from "../ProductsFilter/ProductsFilter";
import { useProducts } from "@/components/hooks/useProducts";
import FilterSortPanel from "@/components/ui/FilterSortPanel/FilterSortPanel";
import ProductsCatalogContainer from "../ProductsCatalogContainer/ProductsCatalogContainer";
import {
  useFilteredProducts,
  type ProductFilters,
} from "@/components/hooks/useFilteredProducts";
import { useCatalogCategoriesQuery } from "@/components/hooks/useCatalogQueries";
import type { CatalogCategory } from "@/lib/bfbApi";
import { useCatalogStore } from "@/store/catalog";
import { sortItems } from "@/lib/sortUtils";
import { useTranslation } from "@/hooks/useTranslation";

type FilterProduct = {
  id?: string | number;
  name?: string;
  price?: string | number;
  regularPrice?: string | number;
  salePrice?: string | number;
  onSale?: boolean;
  image?: string;
  categories?: Array<{ id: number; name: string; slug: string }>;
  stockStatus?: string;
  dateCreated?: string;
  ratingAverage?: number;
  ratingCount?: number;
};

const CATALOG_FETCH_LIMIT = 200;

const ProductsCatalog = () => {
  const { t } = useTranslation();
  const { filters, updateFilters, resetFilters } = useProducts();
  const sortBy = useCatalogStore((s) => s.sortBy);
  const setSortBy = useCatalogStore((s) => s.setSortBy);
  const searchTerm = useCatalogStore((s) => s.searchTerm);
  const setSearchTerm = useCatalogStore((s) => s.setSearchTerm);

  const [appliedWcFilters, setAppliedWcFilters] =
    useState<Partial<ProductFilters> | null>({});
  const [catalogTitle, setCatalogTitle] = useState<string>("");
  const appliedCategoryRef = useRef<string | undefined>(
    typeof appliedWcFilters?.category === "string"
      ? appliedWcFilters.category
      : undefined,
  );

  const { data: catalogCategories = [] } = useCatalogCategoriesQuery();

  useEffect(() => {
    appliedCategoryRef.current =
      typeof appliedWcFilters?.category === "string"
        ? appliedWcFilters.category
        : undefined;
  }, [appliedWcFilters?.category]);

  const findBySlug = (
    cats: CatalogCategory[],
    slug: string,
  ): CatalogCategory | null => {
    for (const c of cats) {
      if (c.slug === slug) return c;
      if (c.children && c.children.length > 0) {
        const found = findBySlug(c.children, slug);
        if (found) return found;
      }
    }
    return null;
  };

  const searchParams = useSearchParams();
  useEffect(() => {
    const allProductsTitle = t("catalog.allProducts");
    const q = searchParams.get("category");
    if (!q) {
      setCatalogTitle(allProductsTitle);
      resetFilters();
      setAppliedWcFilters({});
      return;
    }

    if (q !== appliedCategoryRef.current) {
      setAppliedWcFilters({ category: q });
      resetFilters();
    }

    const found = findBySlug(catalogCategories, q);
    setCatalogTitle(found?.name ?? allProductsTitle);
  }, [searchParams, catalogCategories, t]);

  // Тягнемо повний набір під фільтри — сортування на клієнті (Zustand)
  const catalogFilters = useMemo(() => {
    return {
      ...(appliedWcFilters ?? {}),
      per_page: CATALOG_FETCH_LIMIT,
      ...(searchTerm.trim() && { search: searchTerm.trim() }),
    };
  }, [appliedWcFilters, searchTerm]);

  const { data: wcFilteredProducts = [], isLoading } =
    useFilteredProducts(catalogFilters);

  const sortedProducts = useMemo(() => {
    return sortItems(
      wcFilteredProducts as Array<{
        id: string | number;
        name?: string;
        price?: number | string;
        regularPrice?: number | string;
        salePrice?: number | string;
        dateCreated?: string;
        onSale?: boolean;
        image?: string;
        categories?: Array<{ id: number; name: string; slug: string }>;
        stockStatus?: string;
        ratingAverage?: number;
        ratingCount?: number;
      }>,
      sortBy,
    );
  }, [wcFilteredProducts, sortBy]);

  const wcFilteredProductsForFilter = (sortedProducts as FilterProduct[]).map(
    (p) => ({
      id: String(p.id ?? ""),
      name: p.name ?? "",
      price: String(p.price ?? "0"),
      regularPrice: String(p.regularPrice ?? ""),
      salePrice: String(p.salePrice ?? ""),
      onSale: Boolean(p.onSale),
      image: p.image ?? "",
      categories: p.categories ?? [],
      stockStatus: String(p.stockStatus ?? ""),
      dateCreated: p.dateCreated,
    }),
  );

  const buildWcFilters = (
    localFilters: typeof filters,
  ): Partial<ProductFilters> => {
    const params: Partial<ProductFilters> = {};
    const selected = localFilters.certification ?? [];
    if (selected.length === 1) {
      params.category = selected[0];
    } else if (selected.length > 1) {
      params.category = selected;
    }
    if (
      localFilters.dynamicFilters &&
      Object.keys(localFilters.dynamicFilters).length > 0
    ) {
      params.categoryFilters = localFilters.dynamicFilters;
    }
    return params;
  };

  const handleReset = () => {
    resetFilters();

    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setAppliedWcFilters({ category: categoryParam });
    } else {
      setAppliedWcFilters({});
    }
  };

  const handleFilterApply = (params: Partial<ProductFilters>) => {
    const merged: Partial<ProductFilters> = { ...appliedWcFilters, ...params };
    setAppliedWcFilters(merged);
  };

  const handleSortPanelApply = () => {
    setAppliedWcFilters((prev) => ({
      ...prev,
      ...buildWcFilters(filters),
    }));
  };

  const categorySlug = searchParams.get("category");
  const currentCategory = categorySlug
    ? findBySlug(catalogCategories, categorySlug)
    : null;
  const showFilterActions = !!(
    currentCategory &&
    (currentCategory.children?.length || currentCategory.parentId)
  );

  return (
    <div className={styles.productsCatalog}>
      <div className={styles.catalogContentBlock}>
        <div className={styles.catalogContentContainer}>
          <div className={styles.catalogContent}>
            <ProductsFilter
              filters={filters}
              onFiltersChange={updateFilters}
              onReset={handleReset}
              products={wcFilteredProductsForFilter}
              searchTerm={searchTerm}
              loading={isLoading}
              onApply={handleFilterApply}
              showFilterActions={showFilterActions}
            />
            <div className={styles.catalogRightColumn}>
              <div className={styles.catalogHeaderRow}>
                <h2 className={styles.catalogTitle}>{catalogTitle}</h2>
                <FilterSortPanel
                  filters={filters}
                  onFiltersChange={(newFilters) => updateFilters(newFilters)}
                  onReset={handleReset}
                  products={wcFilteredProductsForFilter}
                  onApply={handleSortPanelApply}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  hideItemsPerPage
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  embeddedInCatalog
                />
              </div>
              <ProductsCatalogContainer
                block={{
                  subtitle: "Наші товари",
                  title: catalogTitle,
                }}
                filteredProducts={sortedProducts}
                selectedCertificationFilter={
                  typeof appliedWcFilters?.category === "string"
                    ? appliedWcFilters.category
                    : ""
                }
                isLoading={isLoading}
              />
              {isLoading && <div className={styles.loading}>Завантаження…</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsCatalog;
