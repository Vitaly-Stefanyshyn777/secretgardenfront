"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./ProductsCatalog.module.css";
import ProductsFilter from "../ProductsFilter/ProductsFilter";
import { useProducts } from "@/components/hooks/useProducts";
import FilterSortPanel, {
  type SortType,
} from "@/components/ui/FilterSortPanel/FilterSortPanel";
import ProductsCatalogContainer from "../ProductsCatalogContainer/ProductsCatalogContainer";
// Видалено useProductsQuery імпорт
import {
  useFilteredProducts,
  type ProductFilters,
} from "@/components/hooks/useFilteredProducts";
// import { ProductsNewShowcase } from "@/components/ProductsShowcase/ProductsNewShowcase";

import { mapSortTypeToWcParams } from "@/lib/sortMapping";
import { useCatalogCategoriesQuery } from "@/components/hooks/useCatalogQueries";
import type { CatalogCategory } from "@/lib/bfbApi";

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
};

const ProductsCatalog = () => {
  const { filters, updateFilters, resetFilters } = useProducts();
  // Видалено useProductsQuery, використовуємо тільки useFilteredProducts

  const [appliedWcFilters, setAppliedWcFilters] =
    useState<Partial<ProductFilters> | null>({});
  const [catalogTitle, setCatalogTitle] = useState<string>("Всі товари");
  const [sortBy, setSortBy] = useState<SortType>("popular");
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Слухаємо зміну ?category=<slug|id> у URL і застосовуємо фільтр
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams.get("category");
    if (!q) {
      setCatalogTitle("Всі товари");
      resetFilters();
      setAppliedWcFilters({});
      return;
    }

    // Нова логіка: q — це slug категорії/підкатегорії
    if (q !== appliedCategoryRef.current) {
      setAppliedWcFilters({ category: q });
      resetFilters();
    }

    const found = findBySlug(catalogCategories, q);
    setCatalogTitle(found?.name ?? "Всі товари");
  }, [searchParams, catalogCategories]);
  // Формуємо фільтри з сортуванням та пагінацією
  const wcFiltersWithSort = useMemo(() => {
    const sortParams = mapSortTypeToWcParams(sortBy);
    return {
      ...(appliedWcFilters ?? {}),
      orderby: sortParams.orderby,
      order: sortParams.order,
      per_page: itemsPerPage,
      ...(sortParams.on_sale !== undefined && { on_sale: sortParams.on_sale }),
      ...(searchTerm.trim() && { search: searchTerm.trim() }),
    };
  }, [appliedWcFilters, sortBy, itemsPerPage, searchTerm]);

  const {
    data: wcFilteredProducts = [],
    isLoading,
    isError,
  } = useFilteredProducts(wcFiltersWithSort);

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
  };
  const wcFilteredProductsForFilter = (
    wcFilteredProducts as FilterProduct[]
  ).map((p) => ({
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
  }));

  // Функція для побудови WC фільтрів з локальних фільтрів
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

  // Функція для скидання фільтрів зі збереженням категорії
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

  // Кнопки «Застосувати» / «Скинути» показуємо, коли відкриті підкатегорії-фільтри
  // (категорія з children, напр. CBD масло) або обрана підкатегорія
  const categorySlug = searchParams.get("category");
  const currentCategory = categorySlug
    ? findBySlug(catalogCategories, categorySlug)
    : null;
  const showFilterActions =
    !!(
      currentCategory &&
      (currentCategory.children?.length || currentCategory.parentId)
    );

  return (
    <div className={styles.productsCatalog}>
      <div className={styles.catalogContentBlock}>
        {/* <ProductsNewShowcase /> */}

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
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
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
                filteredProducts={wcFilteredProducts}
                selectedCertificationFilter={
                  typeof appliedWcFilters?.category === "string"
                    ? appliedWcFilters.category
                    : ""
                }
                isLoading={isLoading}
              />
              {/* {isError && (
              <div className={styles.error}>Не вдалося завантажити товари</div>
            )} */}
              {isLoading && <div className={styles.loading}>Завантаження…</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsCatalog;
