import { useQuery } from "@tanstack/react-query";
import {
  fetchCatalogCategories,
  fetchFilteredProducts,
  type CatalogCategory,
  type ProductFilters,
} from "@/lib/bfbApi";

export const useCatalogCategoriesQuery = () =>
  useQuery<CatalogCategory[]>({
    queryKey: ["catalogCategories"],
    queryFn: fetchCatalogCategories,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

export const useCatalogProductsQuery = (filters: {
  categorySlug?: string;
  search?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["catalogProducts", filters],
    queryFn: () =>
      fetchFilteredProducts({
        category: filters.categorySlug,
        search: filters.search,
        page: filters.page,
        per_page: filters.limit,
      } as ProductFilters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

