"use client";
import { useQuery } from "@tanstack/react-query";
import {
  productsQuery,
  productQuery,
  productReviewsQuery,
  productsWithFiltersQuery,
  newProductsQuery,
  bestSellingProductsQuery,
  saleProductsQuery,
  productsByCategoryQuery,
  productCategoriesQuery,
} from "@/lib/productsQueries";
import { useLanguageStore } from "@/store/language";
import type { Locale } from "@/i18n";
import { resolveProductSlugParam } from "@/lib/slugUtils";

function withLocale<T extends { queryKey: readonly unknown[] }>(
  base: T,
  locale: Locale,
): T & { queryKey: readonly unknown[] } {
  return { ...base, queryKey: [...base.queryKey, locale] };
}

export function useProductsQuery() {
  const locale = useLanguageStore((s) => s.locale);
  return useQuery(withLocale(productsQuery(), locale));
}

export function useProductQuery(slugOrId: string) {
  const locale = useLanguageStore((s) => s.locale);
  const normalizedSlug = resolveProductSlugParam(slugOrId);
  const shouldFetch =
    !!normalizedSlug && normalizedSlug !== "skip";

  return useQuery({
    ...withLocale(productQuery(slugOrId), locale),
    enabled: shouldFetch,
  });
}

export function useProductsWithFiltersQuery(filters: Record<string, unknown>) {
  const locale = useLanguageStore((s) => s.locale);
  return useQuery(withLocale(productsWithFiltersQuery(filters), locale));
}

export function useNewProductsQuery() {
  const locale = useLanguageStore((s) => s.locale);
  return useQuery(withLocale(newProductsQuery(), locale));
}

export function useBestSellingProductsQuery() {
  const locale = useLanguageStore((s) => s.locale);
  return useQuery(withLocale(bestSellingProductsQuery(), locale));
}

export function useSaleProductsQuery() {
  const locale = useLanguageStore((s) => s.locale);
  return useQuery(withLocale(saleProductsQuery(), locale));
}

export function useProductsByCategoryQuery(categoryId: string) {
  const locale = useLanguageStore((s) => s.locale);
  return useQuery(withLocale(productsByCategoryQuery(categoryId), locale));
}

export function useProductCategoriesQuery() {
  const locale = useLanguageStore((s) => s.locale);
  return useQuery(withLocale(productCategoriesQuery(), locale));
}

export function useProductReviewsQuery(productSlug: string) {
  const locale = useLanguageStore((s) => s.locale);
  const normalizedSlug = resolveProductSlugParam(productSlug);
  return useQuery({
    ...withLocale(productReviewsQuery(normalizedSlug || productSlug), locale),
    enabled: !!normalizedSlug && normalizedSlug.trim() !== "",
  });
}
