"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./ProductsCatalogContainer.module.css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import ProductsGrid from "../ProductsGrid/ProductsGrid";
import ProductsGridSkeleton from "../ProductsGrid/ProductsGridSkeleton";
import { useQuery } from "@tanstack/react-query";
import { productsWithFiltersQuery } from "@/lib/productsQueries";

const FORCE_PRODUCTS_SKELETON = false;

interface Props {
  block: {
    subtitle: string;
    title: string;
  };
  filteredProducts: unknown[];
  isNoCertificationFilter?: boolean;
  selectedCertificationFilter?: string; // Вибраний фільтр сертифікації (78, 79, або undefined)
  isLoading?: boolean; // Стан завантаження з батьківського компонента
}

const ProductsCatalogContainer = ({
  filteredProducts,
  isNoCertificationFilter = false,
  selectedCertificationFilter,
  isLoading: parentIsLoading,
}: Props) => {
  // Якщо зовнішній фільтр не передано – отримуємо товари категорії "товари для спорту"
  const {
    data: sportsProducts = [],
    isLoading: localIsLoading,
    isError,
  } = useQuery(productsWithFiltersQuery({ category: "tovary-dlya-sportu" }));

  // Використовуємо isLoading з батьківського компонента, якщо передано, інакше локальний
  const isLoading = FORCE_PRODUCTS_SKELETON
    ? true
    : parentIsLoading !== undefined
      ? parentIsLoading
      : localIsLoading;

  // debug logs removed

  // Пріоритет: передані зверху filteredProducts → інакше беремо з запиту
  const products = (
    filteredProducts && filteredProducts.length
      ? filteredProducts
      : sportsProducts
  ) as unknown[];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  type ProductLike = {
    id: string | number;
    name: string;
    price: string | number;
    regularPrice?: string;
    salePrice?: string;
    onSale?: boolean;
    images?: Array<{ src: string }>;
    categories?: unknown;
    stockStatus?: string;
    dateCreated?: string;
    ratingAverage?: number;
    ratingCount?: number;
  };

  // Порядок уже заданий у ProductsCatalog (Zustand + sortItems)
  const orderedProducts: ProductLike[] = useMemo(() => {
    return (filteredProducts?.length ? filteredProducts : products) as ProductLike[];
  }, [filteredProducts, products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts]);

  const totalPages = Math.max(
    1,
    Math.ceil(orderedProducts.length / itemsPerPage),
  );
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = orderedProducts.slice(start, start + itemsPerPage);

  const productsForGrid = pageData.map((product) => {
    type SnakeCaseFields = Partial<{
      regular_price: string;
      sale_price: string;
      on_sale: boolean;
      stock_status: string;
      images: Array<{ src: string; alt?: string }>;
      date_created?: string;
    }>;
    type CamelCaseFields = Partial<{
      dateCreated?: string;
      ratingAverage?: number;
      ratingCount?: number;
    }>;
    const p = product as ProductLike & SnakeCaseFields & CamelCaseFields;
    const imagesArr =
      Array.isArray(p.images) && p.images.length > 0
        ? (p.images as Array<{ src: string; alt?: string }>).map((img) => ({
            src: img.src,
            alt: img.alt || product.name,
          }))
        : [{ src: product.images?.[0]?.src || "", alt: product.name }];

    // Отримуємо dateCreated з різних можливих джерел
    // mapProductToUi мапить date_created -> dateCreated, тому спочатку перевіряємо camelCase
    const dateCreatedValue =
      product.dateCreated ??
      (product as { date_created?: string }).date_created ??
      p.dateCreated ??
      p.date_created;

    const wc = (product as any).wcProduct as
      | { type?: string; variations?: number[] }
      | undefined;

    const ratingAverage =
      (product as any).ratingAverage ?? (product as any).averageRating ?? 0;
    const ratingCount =
      (product as any).ratingCount ?? (product as any).reviewCount ?? 0;

    return {
      // CUID (clx...) зберігаємо як string; числовий id теж через String()
      id:
        typeof product.id === "string" ? product.id : String(product.id ?? ""),
      slug: (product as any).slug, // Додаємо slug з продукту
      name: product.name,
      type: wc?.type,
      variations: wc?.variations,
      price: String(product.price ?? "0"),
      regular_price: String(p.regular_price ?? product.regularPrice ?? ""),
      sale_price: String(p.sale_price ?? product.salePrice ?? ""),
      on_sale: Boolean(p.on_sale ?? product.onSale),
      images: imagesArr,
      categories:
        (product.categories as Array<{
          id: number;
          name: string;
          slug: string;
        }>) || [],
      attributes: [],
      stock_status: String(p.stock_status ?? product.stockStatus ?? ""),
      date_created: dateCreatedValue,
      average_rating: String(ratingAverage ?? 0),
      review_count: ratingCount ?? 0,
      // IMPORTANT: keep meta for subscription discount (proce_sell_registry)
      metaData: (product as any).metaData ?? [],
      wcProduct: (product as any).wcProduct,
    };
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(Math.max(0, currentPage - 1));
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className={styles.catalogContainer}>
      <div className={styles.mainContent}>
        {isError && (
          <div className={styles.error}>Не вдалося завантажити товари</div>
        )}
        {isLoading ? (
          <ProductsGridSkeleton catalogDarkCards />
        ) : (
          <ProductsGrid
            products={productsForGrid}
            isNoCertificationFilter={isNoCertificationFilter}
            selectedCertificationFilter={selectedCertificationFilter}
            catalogDarkCards
          />
        )}
        {totalPages > 1 && (
          <SliderNav
            activeIndex={activeIndex}
            dots={totalPages}
            onPrev={() => handlePageChange(currentPage - 1)}
            onNext={() => handlePageChange(currentPage + 1)}
            onDotClick={(i) => handlePageChange(i + 1)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductsCatalogContainer;
