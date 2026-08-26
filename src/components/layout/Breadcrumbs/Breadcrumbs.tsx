"use client";

import { useProductQuery } from "@/components/hooks/useProductsQuery";
import { useCourseQuery } from "@/lib/coursesQueries";
import { useTranslation, type TranslationPath } from "@/hooks/useTranslation";
import { localizeDynamicText } from "@/lib/localizedContent";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useLayoutEffect, useRef, useState } from "react";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

const Breadcrumbs: React.FC = () => {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const is404Page = pathname === "/not-found";

  // Якщо ми на сторінці продукту /products/[slug] — підтягнемо назву
  const productSlugMatch = pathname.match(/^\/products\/(.+)$/);
  const productSlug = productSlugMatch?.[1] || "";
  // Викликаємо useProductQuery тільки якщо є slug (не порожній)
  const { data: productData } = useProductQuery(productSlug || "skip");

  // Якщо ми на сторінці курсу /courses/[slug] — підтягнемо назву
  const courseSlugMatch = pathname.match(/^\/courses\/(.+)$/);
  const courseSlug = courseSlugMatch?.[1] || "";
  // Викликаємо useCourseQuery тільки якщо є slug (не порожній)
  const { data: courseData } = useCourseQuery(courseSlug || "skip");

  // Обробка кліку на breadcrumb item
  const handleBreadcrumbClick = (item: BreadcrumbItem, e: React.MouseEvent) => {
    if (item.href === "/products" && pathname.startsWith("/products")) {
      e.preventDefault();
      router.push("/products");
    }
  };

  const segmentLabels: Record<string, TranslationPath> = {
    trainers: "breadcrumbs.findTrainer",
    "#LearningFormats": "breadcrumbs.bfbLearning",
    "#LearningMobileFormats": "breadcrumbs.bfbLearning",
    "courses-landing": "breadcrumbs.instructing",
    courses: "breadcrumbs.workshops",
    course: "breadcrumbs.bfbBasics",
    "our-courses": "breadcrumbs.programs",
    inventory: "breadcrumbs.catalog",
    products: "breadcrumbs.catalog",
    workshops: "breadcrumbs.workshops",
    about: "breadcrumbs.about",
    "about-bfb": "breadcrumbs.aboutBfb",
    oferta: "breadcrumbs.oferta",
    "privacy-policy": "breadcrumbs.privacy",
    contact: "breadcrumbs.contacts",
    contacts: "breadcrumbs.contacts",
  };

  const categoryLabels: Record<string, TranslationPath> = {
    "30": "breadcrumbs.forSport",
    "85": "breadcrumbs.catalog",
    "86": "breadcrumbs.boards",
    "87": "breadcrumbs.accessories",
    "inventory-boards": "breadcrumbs.boards",
    "inventory-accessories": "breadcrumbs.accessories",
    inventory: "breadcrumbs.catalog",
    "for-sport": "breadcrumbs.forSport",
    girya: "breadcrumbs.dumbbells",
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    breadcrumbs.push({ label: t("breadcrumbs.home"), href: "/" });

    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      let label = segment;

      const segmentKey = segmentLabels[segment];
      if (segmentKey) {
        label = t(segmentKey);
      } else if (segments[0] === "products" && index === 1) {
        // Сторінка продукту: замінити slug/ID на назву товару
        // Декодуємо segment, якщо він encoded
        let decodedSegment = segment;
        try {
          decodedSegment = decodeURIComponent(segment);
        } catch {
          // Якщо не вдалося декодувати, використовуємо як є
        }

        // Використовуємо назву продукту, якщо вона доступна
        if (productData?.name) {
          label = localizeDynamicText(productData.name, locale);
        } else {
          // Якщо назва недоступна, використовуємо декодований segment
          label = localizeDynamicText(decodedSegment, locale);
        }
      } else if (segments[0] === "courses" && index === 1) {
        // Сторінка курсу: замінити slug/ID на назву курсу
        // Декодуємо segment, якщо він encoded
        let decodedSegment = segment;
        try {
          decodedSegment = decodeURIComponent(segment);
        } catch {
          // Якщо не вдалося декодувати, використовуємо як є
        }

        // Використовуємо назву курсу, якщо вона доступна
        if (courseData?.name) {
          label = localizeDynamicText(courseData.name, locale);
        } else {
          // Якщо назва недоступна, використовуємо декодований segment
          label = localizeDynamicText(decodedSegment, locale);
        }
      }
      const isActive = index === segments.length - 1;

      breadcrumbs.push({
        label,
        href: isActive ? undefined : currentPath,
        isActive,
      });
    });

    return breadcrumbs;
  };

  let breadcrumbs = generateBreadcrumbs();

  // Спеціальна логіка для сторінки 404 — використовуємо pathname замість document
  // щоб уникнути hydration mismatch (document доступний тільки на клієнті)
  if (pathname === "/not-found") {
    breadcrumbs = [
      { label: t("breadcrumbs.home"), href: "/" },
      { label: "404", isActive: true },
    ];
  }

  const catalogLabel = t("breadcrumbs.catalog");

  const normalizeCatalogLabel = (label: string) => {
    const normalized = label.trim().toLowerCase();
    if (
      normalized === "інвентар" ||
      normalized === "инвентарь" ||
      normalized === "inventory" ||
      normalized === "каталог" ||
      normalized === "catalog"
    ) {
      return catalogLabel;
    }
    return label;
  };

  breadcrumbs = breadcrumbs.map((item) => ({
    ...item,
    label: normalizeCatalogLabel(item.label),
  }));

  // Додаємо дочірню категорію Каталог у /products?category=...
  if (pathname === "/products") {
    const categorySlug = searchParams.get("category");
    if (categorySlug) {
      const categoryKey = categoryLabels[categorySlug];
      if (categoryKey) {
        const label = t(categoryKey);
        if (breadcrumbs.length > 0) {
          const last = breadcrumbs[breadcrumbs.length - 1];
          last.isActive = false;
          last.href = "/products";
          last.label = catalogLabel;
        }
        breadcrumbs.push({ label, isActive: true });
      } else {
        if (breadcrumbs.length > 0) {
          const last = breadcrumbs[breadcrumbs.length - 1];
          last.label = catalogLabel;
          if (last.href === undefined) {
            last.href = "/products";
            last.isActive = false;
          }
        }
      }
    } else {
      if (breadcrumbs.length > 0) {
        const last = breadcrumbs[breadcrumbs.length - 1];
        last.label = catalogLabel;
        last.href = undefined;
        last.isActive = true;
      }
    }
  }

  // Визначення мобільної версії - використовуємо useLayoutEffect для швидшого оновлення
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  // Відстеження стану модалки InstructingSlider - використовуємо useLayoutEffect
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const checkSliderState = () => {
      const hasClass = document.body.classList.contains(
        "instructing-slider-open",
      );
      setIsSliderOpen(hasClass);
    };

    // Перевіряємо одразу
    checkSliderState();

    // Спостерігаємо за змінами
    const observer = new MutationObserver(checkSliderState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: false,
    });

    // Також перевіряємо через інтервал для надійності
    const interval = setInterval(checkSliderState, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Відстеження стану модалки EventsSection - використовуємо useLayoutEffect
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const checkEventsModalState = () => {
      const hasClass = document.body.classList.contains("events-modal-open");
      setIsEventsModalOpen(hasClass);
    };

    // Перевіряємо одразу
    checkEventsModalState();

    // Спостерігаємо за змінами
    const observer = new MutationObserver(checkEventsModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: false,
    });

    // Також перевіряємо через інтервал для надійності
    const interval = setInterval(checkEventsModalState, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Перевірка безпосередньо в рендері для надійності
  const shouldHide =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1000px)").matches &&
    (document.body.classList.contains("instructing-slider-open") ||
      document.body.classList.contains("events-modal-open"));

  // Додаємо клас для приховування, коли модалка відкрита
  const isHidden =
    shouldHide || (isMobile && (isSliderOpen || isEventsModalOpen));
  const navRef = useRef<HTMLElement>(null);

  // Додаємо/видаляємо клас безпосередньо до DOM елемента
  useLayoutEffect(() => {
    if (!navRef.current) return;

    if (isHidden) {
      navRef.current.style.display = "none";
    } else {
      navRef.current.style.display = "";
    }
  }, [isHidden]);

  if (
    pathname === "/" ||
    pathname === "/order-success" ||
    pathname === "/checkout" ||
    pathname.startsWith("/profile") ||
    (pathname.includes("/trainers/") && pathname !== "/trainers")
  ) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      className={`${styles.breadcrumbs} ${isHidden ? styles.hidden : ""}`}
      aria-label={t("breadcrumbs.aria")}
    >
      <div className={styles.breadcrumbsContainer}>
        <ol className={styles.breadcrumbList}>
          {breadcrumbs.map((item, index) => (
            <li key={index} className={styles.breadcrumbItem}>
              {item.href && !item.isActive ? (
                <Link
                  href={item.href}
                  className={styles.breadcrumbLink}
                  onClick={(e) => handleBreadcrumbClick(item, e)}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`${styles.breadcrumbText} ${
                    item.isActive ? styles.active : ""
                  }`}
                >
                  {item.label}
                </span>
              )}

              {index < breadcrumbs.length - 1 && (
                <span className={styles.separator}>•</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
