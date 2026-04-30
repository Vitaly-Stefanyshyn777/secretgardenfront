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
      title: "BFB",
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
    title: yoast.og_title ?? yoast.title ?? "BFB",
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
    title: yoast.title ?? "BFB",
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

/** SEO для товару — через catalog API (yoast не підтримується) */
export async function fetchProductSeo(_slug: string): Promise<YoastHeadJson | null> {
  return null;
}

/** SEO для курсу — через catalog API (yoast не підтримується) */
export async function fetchCourseSeo(_courseIdOrSlug: string | number): Promise<YoastHeadJson | null> {
  return null;
}

/** SEO для категорії — WooCommerce відключено */
export async function fetchCategorySeo(_slug: string): Promise<YoastHeadJson | null> {
  return null;
}
