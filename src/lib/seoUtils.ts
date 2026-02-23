import type { Metadata } from "next";

export type YoastRobots = {
  index?: string;
  follow?: string;
  ["max-snippet"]?: string;
  ["max-image-preview"]?: string;
  ["max-video-preview"]?: string;
};

export type YoastHeadJson = {
  title?: string;
  description?: string;
  robots?: YoastRobots;
  og_locale?: string;
  og_type?: string;
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_site_name?: string;
  og_image?: Array<{ url?: string; width?: number; height?: number }> | string;
  article_modified_time?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical?: string;
};

/**
 * Перетворює yoast_head_json в Next.js Metadata
 */
export function yoastToMetadata(yoast: YoastHeadJson | null | undefined): Metadata {
  if (!yoast) {
    return {
      title: "B.F.B Fitness",
      description: "Навчання, інвентар та тренування",
    };
  }

  const robots = yoast.robots ?? {};
  
  // Обробка og_image
  let ogImage: string | undefined;
  let ogImageWidth: number | undefined;
  let ogImageHeight: number | undefined;
  
  if (yoast.og_image) {
    if (typeof yoast.og_image === "string") {
      ogImage = yoast.og_image;
    } else if (Array.isArray(yoast.og_image) && yoast.og_image.length > 0) {
      const firstImage = yoast.og_image[0];
      ogImage = firstImage?.url || (firstImage as any) || undefined;
      ogImageWidth = typeof firstImage?.width === "number" ? firstImage.width : undefined;
      ogImageHeight = typeof firstImage?.height === "number" ? firstImage.height : undefined;
    }
  }

  const openGraphBase: any = {
    title: yoast.og_title ?? yoast.title ?? "B.F.B Fitness",
    description: yoast.og_description ?? yoast.description,
    url: yoast.og_url,
    siteName: yoast.og_site_name ?? "BFB",
    locale: yoast.og_locale ?? "uk_UA",
    type: (yoast.og_type as any) || "website",
  };

  if (ogImage) {
    openGraphBase.images = [
      {
        url: ogImage,
        ...(ogImageWidth && { width: ogImageWidth }),
        ...(ogImageHeight && { height: ogImageHeight }),
      },
    ];
  }

  return {
    title: yoast.title ?? "B.F.B Fitness",
    description: yoast.description ?? yoast.og_description ?? "Навчання, інвентар та тренування",
    robots: {
      index: robots.index !== "noindex",
      follow: robots.follow !== "nofollow",
    },
    alternates: {
      canonical: yoast.canonical,
    },
    openGraph: openGraphBase,
    twitter: {
      card: (yoast.twitter_card as any) || "summary_large_image",
      title: yoast.twitter_title ?? yoast.og_title ?? yoast.title,
      description: yoast.twitter_description ?? yoast.og_description ?? yoast.description,
      images: yoast.twitter_image ? [yoast.twitter_image] : ogImage ? [ogImage] : undefined,
    },
  };
}

/**
 * Отримує SEO дані для товару за slug
 */
export async function fetchProductSeo(slug: string): Promise<YoastHeadJson | null> {
  try {
    const UPSTREAM_BASE = process.env.UPSTREAM_BASE;
    if (!UPSTREAM_BASE) return null;

    const response = await fetch(
      `${UPSTREAM_BASE}/wp-json/wc/v3/products?slug=${slug}&consumer_key=${process.env.WC_CONSUMER_KEY}&consumer_secret=${process.env.WC_CONSUMER_SECRET}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const products = await response.json();
    const product = Array.isArray(products) ? products[0] : products;
    
    return product?.yoast_head_json as YoastHeadJson | null;
  } catch {
    return null;
  }
}

/**
 * Отримує SEO дані для курсу за slug або ID
 */
export async function fetchCourseSeo(courseIdOrSlug: string | number): Promise<YoastHeadJson | null> {
  try {
    const UPSTREAM_BASE = process.env.UPSTREAM_BASE;
    if (!UPSTREAM_BASE) return null;

    // Якщо це число, використовуємо як ID
    if (typeof courseIdOrSlug === "number" || /^\d+$/.test(String(courseIdOrSlug))) {
      const response = await fetch(
        `${UPSTREAM_BASE}/wp-json/wc/v3/products/${courseIdOrSlug}?consumer_key=${process.env.WC_CONSUMER_KEY}&consumer_secret=${process.env.WC_CONSUMER_SECRET}`,
        { next: { revalidate: 3600 } }
      );
      
      if (!response.ok) return null;
      const product = await response.json();
      return product?.yoast_head_json as YoastHeadJson | null;
    }

    // Якщо це slug, шукаємо через API
    const response = await fetch(
      `${UPSTREAM_BASE}/wp-json/wc/v3/products?slug=${courseIdOrSlug}&category=72&consumer_key=${process.env.WC_CONSUMER_KEY}&consumer_secret=${process.env.WC_CONSUMER_SECRET}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;
    const products = await response.json();
    const course = Array.isArray(products) ? products[0] : products;
    
    return course?.yoast_head_json as YoastHeadJson | null;
  } catch {
    return null;
  }
}

/**
 * Отримує SEO дані для категорії товарів за slug
 */
export async function fetchCategorySeo(slug: string): Promise<YoastHeadJson | null> {
  try {
    const UPSTREAM_BASE = process.env.UPSTREAM_BASE;
    if (!UPSTREAM_BASE) return null;

    // Отримуємо категорії
    const categoriesResponse = await fetch(
      `${UPSTREAM_BASE}/wp-json/wc/v3/products/categories?slug=${slug}&consumer_key=${process.env.WC_CONSUMER_KEY}&consumer_secret=${process.env.WC_CONSUMER_SECRET}`,
      { next: { revalidate: 3600 } }
    );

    if (!categoriesResponse.ok) return null;
    const categories = await categoriesResponse.json();
    const category = Array.isArray(categories) ? categories[0] : categories;
    
    return category?.yoast_head_json as YoastHeadJson | null;
  } catch {
    return null;
  }
}
