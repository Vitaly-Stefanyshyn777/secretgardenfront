import { fetchFilteredProducts, fetchProductReviews } from "./bfbApi";
import type { Product } from "./products";

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
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"}/api/catalog/products/${encodeURIComponent(
        slugOrId,
      )}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      throw new Error(`Product not found: ${slugOrId}`);
    }

    const raw = await res.json();
    // Підтримка обгорнутої відповіді { data: {...} } або прямої відповіді
    const data = (raw?.data ?? raw) as {
      id: string;
      name: string;
      slug: string;
      price: string;
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

    const placeholderImage = data.mainImageUrl || "/placeholder.svg";
    const imageUrls = data.imageUrls && data.imageUrls.length > 0
      ? data.imageUrls
      : data.mainImageUrl
        ? [data.mainImageUrl]
        : [placeholderImage];

    const product: Product = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      price: data.price,
      regularPrice: data.price,
      salePrice: data.price,
      onSale: false,
      description: data.description || "",
      shortDescription: data.shortDescription || "",
      sku: "",
      stockStatus: data.inStock ? "instock" : "outofstock",
      stockQuantity: data.stockQuantity ?? null,
      image: imageUrls[0] || placeholderImage,
      images: imageUrls.map((src, idx) => ({
        id: idx + 1,
        src,
        name: data.name,
        alt: data.name,
      })),
      characteristics: data.characteristics
        ? [...data.characteristics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : undefined,
      descriptionBlocks: (() => {
        const blocks = data.descriptionBlocks ?? data.description_blocks;
        if (!Array.isArray(blocks) || blocks.length === 0) return undefined;
        return [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      })(),
      categories:
        data.categories?.map((c, idx) => ({
          id: idx,
          name: c.name,
          slug: c.slug,
        })) ?? [],
      brands: [],
      attributes: [],
      metaData: [],
      isNew: false,
      isHit: false,
      dateCreated: "",
      averageRating: String(data.ratingAverage ?? 0),
      ratingCount: data.ratingCount ?? 0,
      permalink: `/products/${data.slug}`,
      weight: undefined,
      dimensions: undefined,
      color: undefined,
      originalPrice: undefined,
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
