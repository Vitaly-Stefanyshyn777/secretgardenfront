"use client";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./CertificationFilter.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useCatalogCategoriesQuery } from "@/components/hooks/useCatalogQueries";
import type { CatalogCategory } from "@/lib/bfbApi";

interface CertificationFilterProps {
  // Вибрані підкатегорії (slug). Може бути декілька.
  value: string[];
  onChange: (value: string[]) => void;
  loading?: boolean;
  hideAllCategoriesButton?: boolean;
}

function findCategoryById(
  categories: CatalogCategory[],
  id: string,
): CatalogCategory | null {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryById(cat.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findRootCategoryBySlug(
  categories: CatalogCategory[],
  slug: string,
): CatalogCategory | null {
  for (const root of categories) {
    if (root.slug === slug) return root;
    if (root.children && root.children.length > 0) {
      const hit = root.children.some((c) => c.slug === slug);
      if (hit) return root;
    }
  }
  return null;
}

function findBySlug(
  categories: CatalogCategory[],
  slug: string,
): CatalogCategory | null {
  for (const c of categories) {
    if (c.slug === slug) return c;
    if (c.children?.length) {
      const found = findBySlug(c.children, slug);
      if (found) return found;
    }
  }
  return null;
}

export const CertificationFilter = ({
  value,
  onChange,
  loading,
  hideAllCategoriesButton = false,
}: CertificationFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [isSubExpanded, setIsSubExpanded] = useState(true);

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useCatalogCategoriesQuery();

  const showSkeleton = loading || isLoading;

  const activeCategorySlug = searchParams?.get("category") ?? "";

  const activeRoot = useMemo(() => {
    if (!activeCategorySlug) return null;
    return findRootCategoryBySlug(categories, activeCategorySlug);
  }, [categories, activeCategorySlug]);

  useEffect(() => {
    if (
      !activeRoot ||
      !activeRoot.children ||
      activeRoot.children.length === 0
    ) {
      setActiveParentId(null);
      setIsSubExpanded(true);
      return;
    }
    setActiveParentId(activeRoot.id);
    setIsSubExpanded(true);
  }, [activeRoot?.id]);

  const activeParent = useMemo(() => {
    if (!activeParentId) return null;
    return findCategoryById(categories, activeParentId);
  }, [categories, activeParentId]);

  const rootCategories = useMemo(
    () =>
      (categories || []).filter(
        (cat) =>
          cat.name !== "Всі товари" &&
          cat.slug !== "all-products" &&
          cat.slug !== "all",
      ),
    [categories],
  );
  const subCategories = activeParent?.children ?? [];

  // Поточна категорія з URL
  const currentCategory = useMemo(
    () =>
      activeCategorySlug ? findBySlug(categories, activeCategorySlug) : null,
    [categories, activeCategorySlug],
  );
  // Якщо категорія (або її батько) має filters — не показуємо children без заголовка.
  // Фільтри відмальовуються в CategoryFiltersCheckboxes з заголовками.
  const categoryForFilters = activeParent ?? currentCategory;
  const hasFilters = (categoryForFilters?.filters?.length ?? 0) > 0;
  const showSubcategoryCheckboxes =
    isSubExpanded && subCategories.length > 0 && !hasFilters;

  // Якщо немає категорій і не завантажується, не відображаємо фільтр
  if (!showSkeleton && rootCategories.length === 0) {
    return null;
  }

  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  const pushCategoryToUrl = (slug: string | null) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (!slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleParentClick = (cat: CatalogCategory) => {
    if (cat.children && cat.children.length > 0) {
      setActiveParentId(cat.id);
      // Батьківська категорія застосовується моментально через URL,
      // а підкатегорії (чекбокси) накопичуються і застосовуються через кнопку "Застосувати".
      onChange([]);
      pushCategoryToUrl(cat.slug);
      return;
    }

    // Якщо у категорії немає children — фільтруємо по її slug
    // (категорія без children поводиться як звичайна категорія)
    pushCategoryToUrl(cat.slug);
    onChange([]);
  };

  const handleSubcategoryToggle = (cat: CatalogCategory) => {
    const isSelected = value.includes(cat.slug);
    const next = isSelected
      ? value.filter((s) => s !== cat.slug)
      : [...value, cat.slug];
    // Для підкатегорій лише оновлюємо локальний стан фільтрів (чекбокси).
    onChange(next);
  };

  return (
    <div
      className={`${styles.filterSection} ${
        !isExpanded ? styles.collapsedSection : ""
      }`}
    >
      {/* <div className={styles.sectionTitleContainer} onClick={toggleSection}>
        <h3 className={styles.sectionTitle}>Категорії</h3>
        {isExpanded ? <MinuswIcon /> : <PlusIcon />}
      </div> */}
      <div
        className={`${styles.sectionContent} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
      >
        {showSkeleton ? (
          <div className={styles.categoryBlocks}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height={42} borderRadius={6} />
            ))}
          </div>
        ) : isError ? (
          <div className={styles.error}>Помилка завантаження категорій</div>
        ) : activeParentId ? (
          <>
            <div className={styles.subHeaderDivider} />
            <div className={styles.subHeader}>
              <button
                type="button"
                className={`${styles.categoryBlockBtn} ${styles.categoryBlockBtnActive}`}
                disabled
              >
                {activeParent?.name ?? "Категорія"}
              </button>

              {!hideAllCategoriesButton && (
                <button
                  type="button"
                  className={styles.allCategoriesBtn}
                  onClick={() => {
                    setIsSubExpanded((prev) => !prev);
                  }}
                >
                  <span>Всі категорії</span>
                  <span
                    className={`${styles.caretIcon} ${
                      isSubExpanded ? styles.caretIconUp : ""
                    }`}
                    aria-hidden="true"
                  >
                    <img
                      src="/icons/icon-13.svg"
                      alt=""
                      width={15}
                      height={9}
                    />
                  </span>
                </button>
              )}
            </div>

            <div className={styles.subHeaderDivider} />

            {showSubcategoryCheckboxes && (
              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupTitle}>
                  {activeParent?.slug === "cbd-oil"
                    ? "Канобіноїд"
                    : "Підкатегорії"}
                </h3>
                <div className={styles.checkboxGroup}>
                  {subCategories.map((opt) => {
                    const isSelected = value.includes(opt.slug);
                    const inputId = `catalog-subcategory-${opt.id}`;
                    return (
                      <label
                        key={opt.id}
                        htmlFor={inputId}
                        className={styles.checkboxItem}
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          className={styles.checkboxInput}
                          checked={isSelected}
                          onChange={() => handleSubcategoryToggle(opt)}
                        />
                        <span
                          className={styles.checkboxBox}
                          aria-hidden="true"
                        />
                        <span className={styles.radioLabel}>{opt.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              className={`${styles.categoryBlockBtn} ${styles.categoryBackBtn}`}
              onClick={() => {
                setActiveParentId(null);
                setIsSubExpanded(true);
                onChange([]);
                pushCategoryToUrl(null);
              }}
            >
              Всі товари
            </button>
          </>
        ) : activeRoot &&
          (!activeRoot.children || activeRoot.children.length === 0) ? (
          <>
            <div className={styles.subHeader}>
              <button
                type="button"
                className={`${styles.categoryBlockBtn} ${styles.categoryBlockBtnActive}`}
                disabled
              >
                {activeRoot.name}
              </button>
            </div>

            <div className={styles.subHeaderDivider} />

            <button
              type="button"
              className={`${styles.categoryBlockBtn} ${styles.categoryBackBtn}`}
              onClick={() => {
                setActiveParentId(null);
                setIsSubExpanded(true);
                onChange([]);
                pushCategoryToUrl(null);
              }}
            >
              Всі товари
            </button>
          </>
        ) : rootCategories.length > 0 ? (
          <>
            <div className={styles.subHeader}>
              <button
                type="button"
                className={`${styles.categoryBlockBtn} ${styles.categoryBlockBtnActive}`}
                disabled
              >
                {activeRoot?.name ?? "Категорії"}
              </button>

              {activeCategorySlug && !hideAllCategoriesButton && (
                <button
                  type="button"
                  className={styles.allCategoriesBtn}
                  onClick={() => {
                    setIsSubExpanded((prev) => !prev);
                  }}
                >
                  <span>Всі категорії</span>
                  <span
                    className={`${styles.caretIcon} ${
                      isSubExpanded ? styles.caretIconUp : ""
                    }`}
                    aria-hidden="true"
                  >
                    <img
                      src="/icons/icon-13.svg"
                      alt=""
                      width={15}
                      height={9}
                    />
                  </span>
                </button>
              )}
            </div>

            <div className={styles.subHeaderDivider} />

            <div className={styles.categoryBlocks}>
              {rootCategories.map((cat) => {
                const isActive = activeCategorySlug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.categoryBlockBtn} ${
                      isActive ? styles.categoryBlockBtnActive : ""
                    }`}
                    onClick={() => handleParentClick(cat)}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className={styles.noOptions}>Немає доступних категорій</div>
        )}
      </div>
    </div>
  );
};
