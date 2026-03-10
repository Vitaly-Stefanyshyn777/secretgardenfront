import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import AdvantagesSection from "@/components/sections/AdvantagesSection/AdvantagesSection";
import HomeFaqSection from "@/components/sections/HomeFaqSection/HomeFaqSection";
import HomeReviewsSection from "@/components/sections/HomeReviewsSection/HomeReviewsSection";

import PageLoader from "@/components/PageLoader";
import ProductsShowcase from "@/components/sections/ProductsSection/ProductsShowcase/ProductsShowcase";

type YoastRobots = {
  index?: string;
  follow?: string;
  ["max-snippet"]?: string;
  ["max-image-preview"]?: string;
  ["max-video-preview"]?: string;
};

type YoastHeadJson = {
  title?: string;
  robots?: YoastRobots;
  og_locale?: string;
  og_type?: string;
  og_title?: string;
  og_url?: string;
  og_site_name?: string;
  article_modified_time?: string;
  twitter_card?: string;
};

async function fetchHomeSeo(): Promise<YoastHeadJson | null> {
  try {
    // Викликаємо WordPress API напряму для статичної генерації
    const UPSTREAM_BASE = process.env.UPSTREAM_BASE;
    if (!UPSTREAM_BASE) {
      return null;
    }

    // Отримуємо токен для авторизації
    const normalize = (v?: string) => (v || "").replace(/^['"]|['"]$/g, "");
    const username = normalize(process.env.ADMIN_USER);
    const password = normalize(process.env.ADMIN_PASS);

    let freshToken: string | undefined;
    if (username && password) {
      try {
        const tokenRes = await fetch(
          `${UPSTREAM_BASE}/wp-json/jwt-auth/v1/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            next: { revalidate: 3600 }, // Кешуємо токен на 1 годину
          },
        );

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          freshToken = tokenData?.token;
        }
      } catch (tokenError) {
        // Token error handling removed
      }
    }

    // Запитуємо дані банерів напряму з WordPress
    const targetUrl = new URL(`${UPSTREAM_BASE}/wp-json/wp/v2/banner`);

    const headers: Record<string, string> = {};
    if (freshToken) {
      headers["Authorization"] = `Bearer ${freshToken}`;
    }

    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers,
      next: { revalidate: 3600 }, // Кешуємо банери на 1 годину
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const first = Array.isArray(data) && data.length > 0 ? data[0] : data;
    const yoast = first?.yoast_head_json as YoastHeadJson | undefined;
    if (!yoast) {
      return null;
    }
    return yoast;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const yoast = await fetchHomeSeo();

    if (!yoast) {
      return {
        title: "B.F.B Fitness",
        description: "Навчання, інвентар та тренування",
      };
    }

    const robots = yoast.robots ?? {};

    return {
      title: yoast.title ?? "B.F.B Fitness",
      description: "Навчання, інвентар та тренування", // Додаємо description
      robots: {
        index: robots.index !== "noindex",
        follow: robots.follow !== "nofollow",
      },
      openGraph: {
        title: yoast.og_title ?? yoast.title ?? "B.F.B Fitness",
        url: yoast.og_url,
        siteName: yoast.og_site_name ?? "BFB",
        locale: yoast.og_locale ?? "uk_UA",
        type: (yoast.og_type as any) || "website",
      },
      twitter: {
        card: (yoast.twitter_card as any) || "summary_large_image",
      },
    };
  } catch (error) {
    return {
      title: "B.F.B Fitness",
      description: "Навчання, інвентар та тренування",
    };
  }
}

export default function Home() {
  return (
    <>
      <PageLoader />
      <HeroSection />
      <AdvantagesSection />
      <ProductsShowcase />
      <HomeFaqSection />
      <HomeReviewsSection />
    </>
  );
}
