import { fetchFilteredProducts, fetchProductReviews } from "./bfbApi";
import { getAllProducts, getProductsByCategory, mapProductToUi } from "./products";
import { getAgeVerificationHeaders } from "./ageVerification";
import type { Product } from "./products";
import {
  getLocaleHeaders,
  getLocalizedName,
  localizeProductRecord,
} from "./localizedContent";

export const productReviewsQuery = (productSlug: string) => ({
  queryKey: ["product", productSlug, "reviews"] as const,
  queryFn: () => fetchProductReviews(productSlug),
  staleTime: 2 * 60 * 1000,
  retry: 1,
});

export const productsQuery = () => ({
  queryKey: ["products"] as const,
  queryFn: async () => {
    // Для списків без фільтрів використовуємо новий REST /catalog/products
    const products = (await fetchFilteredProducts({})) as unknown[];
    return products;
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const productQuery = (slugOrId: string) => ({
  queryKey: ["product", slugOrId] as const,
  queryFn: async () => {
    // Якщо slug порожній або "skip", не виконуємо запит
    if (!slugOrId || slugOrId.trim() === "" || slugOrId === "skip") {
      throw new Error("Product slug is empty");
    }

    // Нова логіка: отримуємо товар через REST /catalog/products/:slug
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/catalog/products/${encodeURIComponent(
        slugOrId,
      )}`,
      { cache: "no-store", headers: { ...getLocaleHeaders(), ...getAgeVerificationHeaders() } },
    );

    if (!res.ok) {
      throw new Error(`Product not found: ${slugOrId}`);
    }

    const raw = await res.json();
    const data = localizeProductRecord((raw?.data ?? raw) as Record<string, unknown>);
    const typed = data as {
      id: string;
      name: string;
      slug: string;
      price: string;
      salePrice?: string | number | null;
      currency: string;
      shortDescription?: string;
      description?: string;
      mainImageUrl?: string | null;
      imageUrls?: string[];
      label?: string;
      inStock?: boolean;
      stockQuantity?: number | null;
      ratingAverage?: number;
      ratingCount?: number;
      categories?: Array<{ id: string; name: string; slug: string }>;
      characteristics?: Array<{ id?: string; name: string; value: string; order?: number }>;
      descriptionBlocks?: Array<{
        type: "paragraph" | "list" | "heading";
        content?: string;
        items?: string[];
        order: number;
        level?: number;
      }>;
      description_blocks?: Array<{
        type: "paragraph" | "list" | "heading";
        content?: string;
        items?: string[];
        order: number;
        level?: number;
      }>;
    };

    const placeholderImage = typed.mainImageUrl || "/placeholder.svg";
    const imageUrls = typed.imageUrls && typed.imageUrls.length > 0
      ? typed.imageUrls
      : typed.mainImageUrl
        ? [typed.mainImageUrl]
        : [placeholderImage];

    const regularPrice = String(typed.price ?? "");
    const salePriceRaw = typed.salePrice;
    const salePrice =
      salePriceRaw !== undefined &&
      salePriceRaw !== null &&
      String(salePriceRaw).trim() !== ""
        ? String(salePriceRaw)
        : "";
    const onSale =
      !!salePrice &&
      Number(salePrice) > 0 &&
      Number(salePrice) < Number(regularPrice);

    const product: Product = {
      id: typed.id,
      name: typed.name,
      slug: typed.slug,
      price: onSale ? salePrice : regularPrice,
      regularPrice,
      salePrice: onSale ? salePrice : regularPrice,
      onSale,
      description: typed.description || "",
      shortDescription: typed.shortDescription || "",
      sku: "",
      stockStatus: typed.inStock ? "instock" : "outofstock",
      stockQuantity: typed.stockQuantity ?? null,
      image: imageUrls[0] || placeholderImage,
      images: imageUrls.map((src, idx) => ({
        id: idx + 1,
        src,
        name: typed.name,
        alt: typed.name,
      })),
      characteristics: typed.characteristics
        ? [...typed.characteristics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : undefined,
      descriptionBlocks: (() => {
        const blocks = typed.descriptionBlocks ?? typed.description_blocks;
        if (!Array.isArray(blocks) || blocks.length === 0) return undefined;
        return [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      })(),
      categories:
        typed.categories?.map((c, idx) => ({
          id: idx,
          name: getLocalizedName(c),
          slug: c.slug,
        })) ?? [],
      brands: [],
      attributes: [],
      metaData: [],
      isNew: false,
      dateCreated: "",
      averageRating: String(typed.ratingAverage ?? 0),
      ratingCount: typed.ratingCount ?? 0,
      permalink: `/products/${typed.slug}`,
      weight: undefined,
      dimensions: undefined,
      color: undefined,
      originalPrice: onSale ? regularPrice : undefined,
    };

    return product;
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const productsWithFiltersQuery = (filters: Record<string, unknown>) => ({
  queryKey: ["products", "filtered", filters] as const,
  queryFn: async () => {
    // productsWithFilters тепер просто делегує до fetchFilteredProducts,
    // який вже працює через /catalog/products
    const products = await fetchFilteredProducts(filters as any);
    return products;
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const newProductsQuery = () => ({
  queryKey: ["products", "new"] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    const mapped = products.map(mapProductToUi);
    // Mock logic for new products - products created in last 30 days
    return mapped.filter((product) => product.isNew);
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const bestSellingProductsQuery = () => ({
  queryKey: ["products", "bestselling"] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    const mapped = products.map(mapProductToUi);
    // Mock logic for best selling - products with high sales
    return mapped.slice(0, 8); // Return first 8 products as mock
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const saleProductsQuery = () => ({
  queryKey: ["products", "sale"] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    const mapped = products.map(mapProductToUi);
    return mapped.filter((product) => product.onSale);
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

// Fetch by numeric WC category id
export const productsByCategoryQuery = (categoryId: string) => ({
  queryKey: ["products", "category", categoryId] as const,
  queryFn: async () => {
    const products = await getProductsByCategory(categoryId);
    return products.map(mapProductToUi);
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const productCategoriesQuery = () => ({
  queryKey: ["product-categories"] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    const mapped = products.map(mapProductToUi);
    const categories = new Map();

    mapped.forEach((product) => {
      product.categories.forEach((category) => {
        if (!categories.has(category.slug)) {
          categories.set(category.slug, category);
        }
      });
    });

    return Array.from(categories.values());
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});
