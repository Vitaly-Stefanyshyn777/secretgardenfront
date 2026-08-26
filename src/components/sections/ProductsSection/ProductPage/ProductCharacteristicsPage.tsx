"use client";

import React from "react";
import { useProductQuery } from "@/components/hooks/useProductsQuery";
import ProductSubpageShell from "./ProductSubpageShell";
import styles from "./ProductSubpage.module.css";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeDynamicText } from "@/lib/localizedContent";

export default function ProductCharacteristicsPage({
  productSlug,
}: {
  productSlug: string;
}) {
  const { t, locale } = useTranslation();
  const { data: product, isLoading, isError } = useProductQuery(productSlug);
  const backHref = `/products/${productSlug}`;
  const title = t("profile.characteristicsTitle");

  if (isLoading) {
    return (
      <ProductSubpageShell title={title} backHref={backHref}>
        <p className={styles.loading}>
          {locale === "en" ? "Loading..." : "Завантаження..."}
        </p>
      </ProductSubpageShell>
    );
  }

  if (isError || !product) {
    return (
      <ProductSubpageShell title={title} backHref={backHref}>
        <p className={styles.loading}>
          {locale === "en"
            ? "Failed to load product"
            : "Не вдалося завантажити товар"}
        </p>
      </ProductSubpageShell>
    );
  }

  const chars = product.characteristics ?? [];
  const startIdx = chars.findIndex(
    (ch) =>
      ch.name === "Кількість капсул в упаковці" ||
      ch.name === "Quantity of capsules in package",
  );
  const endIdx = chars.findIndex(
    (ch) =>
      ch.name === "Важливі застереження" ||
      ch.name === "Important precautions",
  );
  const hasRange = startIdx >= 0 && endIdx >= 0 && endIdx >= startIdx;
  const displayChars = hasRange
    ? chars.slice(startIdx, endIdx + 1)
    : chars;

  return (
    <ProductSubpageShell title={title} backHref={backHref}>
      {displayChars.length > 0 && (
        <div className={styles.charsBox}>
          {displayChars.map((ch, idx) => (
            <div key={idx} className={styles.charRow}>
              <span className={styles.charName}>
                {localizeDynamicText(ch.name, locale)}
              </span>
              <span className={styles.charValue}>
                {localizeDynamicText(ch.value, locale)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className={styles.descTitle}>{t("profile.descriptionTitle")}</h2>
        <div className={styles.descContent}>
          {(product.descriptionBlocks?.length ?? 0) > 0 ? (
            product
              .descriptionBlocks!.slice()
              .sort((a, b) => a.order - b.order)
              .map((block, idx) => {
                if (block.type === "paragraph" && block.content) {
                  return (
                    <p
                      key={idx}
                      dangerouslySetInnerHTML={{
                        __html: localizeDynamicText(block.content, locale),
                      }}
                    />
                  );
                }
                if (block.type === "list" && block.items?.length) {
                  return (
                    <ul key={idx} className={styles.descList}>
                      {block.items.map((item, i) => (
                        <li key={i} className={styles.descListItem}>
                          {localizeDynamicText(item, locale)}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === "heading" && block.content) {
                  return (
                    <p
                      key={idx}
                      dangerouslySetInnerHTML={{
                        __html: localizeDynamicText(block.content, locale),
                      }}
                    />
                  );
                }
                return null;
              })
          ) : product.description?.trim() || product.shortDescription?.trim() ? (
            <div
              dangerouslySetInnerHTML={{
                __html: localizeDynamicText(
                  product.description?.trim() ||
                    product.shortDescription?.trim() ||
                    "",
                  locale,
                ),
              }}
            />
          ) : (
            <p>
              {locale === "en"
                ? "Product description is missing"
                : "Опис товару відсутній"}
            </p>
          )}
        </div>
      </div>
    </ProductSubpageShell>
  );
}
