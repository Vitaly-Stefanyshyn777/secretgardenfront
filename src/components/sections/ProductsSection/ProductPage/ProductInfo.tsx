"use client";
import React, { memo } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge/Badge";
import { formatPrice } from "@/lib/priceUtils";
import ProductVariations from "./ProductVariations";
import ProductActions from "./ProductActions";
import styles from "./ProductPage.module.css";
import type { Product } from "@/lib/products";
import type { ProductInfoProps } from "./types";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeDynamicText } from "@/lib/localizedContent";
import { getProductHref } from "@/lib/slugUtils";

const ProductInfo = memo(function ProductInfo({
  product,
  variationsData,
  attributes,
  selectedVariation,
  selectedImageIndex,
  onImageSelect,
  isActuallyHit,
  isMobile,
  isLoggedIn,
  isBoardProduct,
  isAvailable,
  stockStatusText,
  isControlsDisabled,
  cartQuantity,
  variationsLoading,
  finalPrice,
  originalPrice,
  shouldShowOldPrice,
  onRegisterOpen,
}: ProductInfoProps) {
  const { t, locale } = useTranslation();
  const productName = localizeDynamicText(product.name, locale);
  const shortDescription = localizeDynamicText(
    product.shortDescription || "",
    locale,
  );
  return (
    <div className={styles.productInfo}>
      <div className={styles.productInfoBlock}>
        <div className={styles.categoryTagBlock}>
          {/* <div className={styles.categoryTag}>
            {product.categories?.[0]?.name || "Без категорії"}
          </div> */}
          <div className={styles.titleWithBadges}>
            <h1 className={styles.productTitle}>{productName}</h1>
            <div className={styles.productBadges}>
              {isActuallyHit && <Badge variant="hit" />}
            </div>
          </div>
          {/* В наявності та рейтинг */}
          <div className={styles.stockRatingBlock}>
            {product.stockStatus === "instock" && (
              <p className={styles.stockInfo}>
                {t("cart.inStock", { quantity: product.stockQuantity ?? 1 })}
              </p>
            )}
            {(Number(product.averageRating) > 0 ||
              (product.ratingCount ?? 0) > 0) && (
              <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const rating = Number(product.averageRating) || 0;
                  const filled =
                    i < Math.round(Math.min(5, Math.max(0, rating)));
                  const starClass =
                    [
                      styles.starIcon,
                      filled ? styles.starFilled : styles.starEmpty,
                    ]
                      .filter(
                        (c): c is string =>
                          typeof c === "string" && c.length > 0,
                      )
                      .join(" ") || undefined;
                  const starPathFilled =
                    "M16.5703 0.00162601C17.1956 0.00162601 17.6958 0.376814 17.946 0.877063L22.2606 9.69397L31.8279 11.1322C32.3907 11.1947 32.8284 11.6324 33.016 12.1327C33.2036 12.6955 33.0785 13.2583 32.6408 13.696L25.6998 20.5744L27.3257 30.2667C27.4507 30.8295 27.2006 31.4548 26.7629 31.7675C26.2626 32.0802 25.6373 32.1427 25.1371 31.8926L16.5703 27.2653L8.0035 31.8926C7.50325 32.1427 6.94047 32.0802 6.44022 31.7675C6.0025 31.4548 5.75238 30.8295 5.81491 30.2667L7.50325 20.5744L0.562282 13.696C0.124564 13.2583 -0.000498921 12.6955 0.187095 12.1327C0.374689 11.6324 0.812407 11.1947 1.37519 11.1322L10.9425 9.69397L15.2571 0.877063C15.5073 0.376814 16.0075 0.00162601 16.5703 0.00162601Z";
                  const starPathEmpty =
                    "M16.5703 0.00162601C17.1956 0.00162601 17.6958 0.376814 17.946 0.877063L22.2606 9.69397L31.8279 11.1322C32.3907 11.1947 32.8284 11.6324 33.016 12.1327C33.2036 12.6955 33.0785 13.2583 32.6408 13.696L25.6998 20.5744L27.3257 30.2667C27.4507 30.8295 27.2006 31.4548 26.7629 31.7675C26.2626 32.0802 25.6373 32.1427 25.1371 31.8926L16.5703 27.2653L8.0035 31.8926C7.50325 32.1427 6.94047 32.0802 6.44022 31.7675C6.0025 31.4548 5.75238 30.8295 5.81491 30.2667L7.50325 20.5744L0.562282 13.696C0.124564 13.2583 -0.000498921 12.6955 0.187095 12.1327C0.374689 11.6324 0.812407 11.1947 1.37519 11.1322L10.9425 9.69397L15.2571 0.877063C15.5073 0.376814 16.0075 0.00162601 16.5703 0.00162601ZM16.5703 4.94159L13.3187 11.7575C13.0685 12.1952 12.6933 12.5079 12.1931 12.5704L4.75188 13.6334L10.1296 18.9486C10.5048 19.3238 10.6298 19.824 10.5673 20.3243L9.31666 27.7655L15.8824 24.2638C16.3202 24.0136 16.8829 24.0136 17.3207 24.2638L23.8864 27.7655L22.6358 20.3243C22.5108 19.824 22.6983 19.3238 23.0735 18.9486L28.3887 13.6334L21.01 12.5704C20.5098 12.5079 20.072 12.1952 19.8844 11.7575L16.5703 4.94159Z";
                  return (
                    <svg
                      key={i}
                      viewBox="0 0 34 33"
                      className={starClass}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {filled ? (
                        <path d={starPathFilled} fill="var(--zhovtiy)" />
                      ) : (
                        <path
                          d={starPathEmpty}
                          fill="transparent"
                          fillRule="evenodd"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                  );
                })}
              </div>
              <span className={styles.ratingText}>
                {product.ratingCount ?? 0}{" "}
                {((n: number) => {
                  if (locale === "en") {
                    return n === 1
                      ? t("product.reviewOne")
                      : t("product.reviewMany");
                  }
                  const mod10 = n % 10;
                  const mod100 = n % 100;
                  if (mod10 === 1 && mod100 !== 11) return t("product.reviewOne");
                  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
                    return t("product.reviewFew");
                  return t("product.reviewMany");
                })(product.ratingCount ?? 0)}
              </span>
            </div>
            )}
          </div>
          {(shortDescription || product.shortDescription)?.trim() && (
            <p className={styles.productText}>
              <span
                dangerouslySetInnerHTML={{
                  __html: (shortDescription || product.shortDescription || "").trim(),
                }}
              />
            </p>
          )}
        </div>

        {/* Варіації продукту */}
        <ProductVariations
          productType={product.wcProduct?.type}
          attributes={attributes}
          images={product.images || []}
          variationsData={variationsData}
          selectedImageIndex={selectedImageIndex}
          onImageSelect={onImageSelect}
        />

        {/* Ціна та дії */}
        <div className={styles.currenInfoBlock}>
          <div className={styles.priceSection}>
            {variationsLoading ? (
              <>
                <div
                  className={`${styles.skeleton} ${styles.skeletonPrice}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonOriginalPrice}`}
                ></div>
              </>
            ) : (
              <>
                <div className={styles.currentPrice}>
                  {formatPrice(finalPrice)}
                </div>
                {shouldShowOldPrice && (
                  <div className={styles.originalPrice}>
                    {formatPrice(originalPrice)}
                  </div>
                )}
              </>
            )}
          </div>

          <ProductActions
            product={product}
            selectedVariation={selectedVariation}
            isLoggedIn={isLoggedIn}
            isMobile={isMobile}
            isBoardProduct={isBoardProduct}
            isAvailable={isAvailable}
            stockStatusText={stockStatusText}
            isControlsDisabled={isControlsDisabled}
            cartQuantity={cartQuantity}
            selectedImageIndex={selectedImageIndex}
            onRegisterOpen={onRegisterOpen}
          />
        </div>

        {/* {t("profile.characteristicsTitle")} + Опис */}
        <div className={styles.expandableSections}>
          {isMobile && (
            <Link
              href={`${getProductHref(product.slug, String(product.id))}/characteristics`}
              className={styles.characteristicsToggleBtn}
            >
              {t("profile.characteristicsTitle")}
            </Link>
          )}

          <div
            className={`${styles.mobileExpandableContent} ${
              isMobile ? styles.mobileExpandableContentHidden : ""
            }`}
          >
          {(product.characteristics?.length ?? 0) > 0 && (() => {
            const chars = product.characteristics!;
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
            const renderRow = (ch: { name: string; value: string }, idx: number) => (
              <div key={idx} className={styles.characteristicRow}>
                <span className={styles.characteristicName}>
                  {localizeDynamicText(ch.name, locale)}
                </span>
                <span className={styles.characteristicValue}>
                  {localizeDynamicText(ch.value, locale)}
                </span>
              </div>
            );
            const hasRange =
              startIdx >= 0 && endIdx >= 0 && endIdx >= startIdx;
            const before = hasRange ? chars.slice(0, startIdx) : [];
            const wrapped = hasRange
              ? chars.slice(startIdx, endIdx + 1)
              : [];
            const after = hasRange ? chars.slice(endIdx + 1) : [];

            return (
              <div className={styles.characteristicsBlock}>
                <h3 className={styles.characteristicsBlockTitle}>
                  {t("profile.characteristicsTitle")}
                </h3>
                <div className={styles.characteristicsTable}>
                  {hasRange ? (
                    <>
                      {before.map((ch, i) => renderRow(ch, i))}
                      <div className={styles.characteristicsRowsBlock}>
                        {wrapped.map((ch, i) => renderRow(ch, startIdx + i))}
                      </div>
                      {after.map((ch, i) => renderRow(ch, endIdx + 1 + i))}
                    </>
                  ) : (
                    chars.map((ch, i) => renderRow(ch, i))
                  )}
                </div>
              </div>
            );
          })()}

          {/* Опис - статичний блок */}
          <div className={styles.descriptionBlock}>
            <h3 className={styles.descriptionBlockTitle}>{t("profile.descriptionTitle")}</h3>
            <div className={styles.descriptionContent}>
              {(product.descriptionBlocks?.length ?? 0) > 0 ? (
                product
                  .descriptionBlocks!.slice()
                  .sort((a, b) => a.order - b.order)
                  .map((block, idx) => {
                    if (block.type === "paragraph" && block.content) {
                      return (
                        <p
                          key={idx}
                          className={styles.descriptionParagraph}
                          dangerouslySetInnerHTML={{ __html: localizeDynamicText(block.content, locale) }}
                        />
                      );
                    }
                    if (block.type === "list" && block.items?.length) {
                      return (
                        <ul key={idx} className={styles.descriptionList}>
                          {block.items.map((item, i) => (
                            <li key={i} className={styles.descriptionListItem}>
                              {localizeDynamicText(item, locale)}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.type === "heading" && block.content) {
                      const Tag =
                        block.level === 3
                          ? "h3"
                          : block.level === 4
                            ? "h4"
                            : "h2";
                      return (
                        <Tag
                          key={idx}
                          className={styles.descriptionHeading}
                          dangerouslySetInnerHTML={{ __html: localizeDynamicText(block.content, locale) }}
                        />
                      );
                    }
                    return null;
                  })
              ) : product?.description?.trim() || product?.shortDescription?.trim() ? (
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
                <p>{locale === "en" ? "Product description is missing" : "Опис товару відсутній"}</p>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductInfo.displayName = "ProductInfo";

export default ProductInfo;
