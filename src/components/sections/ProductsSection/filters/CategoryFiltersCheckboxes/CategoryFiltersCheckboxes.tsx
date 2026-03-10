"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./CategoryFiltersCheckboxes.module.css";
import { useCatalogCategoriesQuery } from "@/components/hooks/useCatalogQueries";
import type { CatalogCategory } from "@/lib/bfbApi";

interface CategoryFiltersCheckboxesProps {
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
}

function findBySlug(
  cats: CatalogCategory[],
  slug: string,
): CatalogCategory | null {
  for (const c of cats) {
    if (c.slug === slug) return c;
    if (c.children?.length) {
      const found = findBySlug(c.children, slug);
      if (found) return found;
    }
  }
  return null;
}

function findParent(
  cats: CatalogCategory[],
  childSlug: string,
): CatalogCategory | null {
  for (const c of cats) {
    if (c.children?.some((ch) => ch.slug === childSlug)) return c;
    if (c.children) {
      const found = findParent(c.children, childSlug);
      if (found) return found;
    }
  }
  return null;
}

export function CategoryFiltersCheckboxes({
  value,
  onChange,
}: CategoryFiltersCheckboxesProps) {
  const searchParams = useSearchParams();
  const { data: categories = [] } = useCatalogCategoriesQuery();

  const categorySlug = searchParams.get("category");
  const currentCategory = useMemo(
    () => (categorySlug ? findBySlug(categories, categorySlug) : null),
    [categories, categorySlug],
  );
  const parentCategory = useMemo(
    () => (categorySlug ? findParent(categories, categorySlug) : null),
    [categories, categorySlug],
  );
  const categoryWithFilters =
    (currentCategory?.filters?.length ? currentCategory : parentCategory) ??
    currentCategory;

  const filterGroups = useMemo(() => {
    const arr = categoryWithFilters?.filters ?? [];
    return [...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [categoryWithFilters?.filters]);

  const handleToggle = (filterSlug: string, valueSlug: string, checked: boolean) => {
    const current = value[filterSlug] ?? [];
    const next = checked
      ? [...current, valueSlug]
      : current.filter((s) => s !== valueSlug);
    onChange({ ...value, [filterSlug]: next });
  };

  if (filterGroups.length === 0) return null;

  return (
    <div className={styles.filterSection}>
      {filterGroups.map((filter) => {
        const selected = value[filter.slug] ?? [];
        return (
          <div key={filter.slug} className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>{filter.name}</h3>
            <div className={styles.checkboxGroup}>
              {filter.values.map((opt) => {
                const isSelected = selected.includes(opt.slug);
                const inputId = `cf-${filter.slug}-${opt.slug}`;
                return (
                  <label
                    key={opt.slug}
                    htmlFor={inputId}
                    className={styles.checkboxItem}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={isSelected}
                      onChange={(e) =>
                        handleToggle(filter.slug, opt.slug, e.target.checked)
                      }
                    />
                    <span className={styles.checkboxBox} aria-hidden="true" />
                    <span className={styles.radioLabel}>{opt.value}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
