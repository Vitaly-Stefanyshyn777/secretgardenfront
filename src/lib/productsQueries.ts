import { fetchFilteredProducts } from "./bfbApi";

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
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"}/catalog/products/${encodeURIComponent(
        slugOrId,
      )}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      throw new Error(`Product not found: ${slugOrId}`);
    }

    // Повертаємо об'єкт у тому вигляді, в якому його очікують ProductPage та інші компоненти
    return (await res.json()) as unknown;
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
