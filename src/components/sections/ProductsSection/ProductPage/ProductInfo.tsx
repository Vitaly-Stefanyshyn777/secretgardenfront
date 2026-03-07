"use client";
import React, { memo } from "react";
import Badge from "@/components/ui/Badge/Badge";
import { formatPrice } from "@/lib/priceUtils";
import ProductVariations from "./ProductVariations";
import ProductActions from "./ProductActions";
import styles from "./ProductPage.module.css";
import type { Product } from "@/lib/products";
import type { ProductInfoProps } from "./types";
import { СhevronIcon } from "@/components/Icons/Icons";

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
  expandedSections,
  onToggleSection,
}: ProductInfoProps) {
  return (
    <div className={styles.productInfo}>
      <div className={styles.productInfoBlock}>
        <div className={styles.categoryTagBlock}>
          <div className={styles.categoryTag}>
            {product.categories?.[0]?.name || "Без категорії"}
          </div>
          <div className={styles.titleWithBadges}>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <div className={styles.productBadges}>
              {isActuallyHit && <Badge variant="hit" />}
            </div>
          </div>
          {/* В наявності */}
          {product.stockStatus === "instock" && (
            <p className={styles.stockInfo}>
              В наявності - {product.stockQuantity ?? 1}
            </p>
          )}
          {/* Рейтинг і відгуки */}
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
                  return (
                    <svg
                      key={i}
                      viewBox="0 0 20 20"
                      className={starClass}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 1.66699L12.4722 6.67699L18 7.50033L14 11.3337L14.9444 16.8337L10 14.3337L5.05556 16.8337L6 11.3337L2 7.50033L7.52778 6.67699L10 1.66699Z"
                        fill="currentColor"
                      />
                    </svg>
                  );
                })}
              </div>
              <span className={styles.ratingText}>
                {product.ratingCount ?? 0}{" "}
                {((n: number) => {
                  const mod10 = n % 10;
                  const mod100 = n % 100;
                  if (mod10 === 1 && mod100 !== 11) return "відгук";
                  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
                    return "відгуки";
                  return "відгуків";
                })(product.ratingCount ?? 0)}
              </span>
            </div>
          )}
          {product.shortDescription?.trim() && (
            <p className={styles.productText}>
              <span
                dangerouslySetInnerHTML={{
                  __html: product.shortDescription.trim(),
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

        {/* Характеристика та особливості + Опис (статичні блоки) + Доставка/Оплата/Повернення (розгортані) */}
        <div className={styles.expandableSections}>
          {/* Характеристика та особливості - статичний блок, двоколонкова таблиця */}
          {(product.characteristics?.length ?? 0) > 0 && (
            <div className={styles.characteristicsBlock}>
              <h3 className={styles.characteristicsBlockTitle}>
                Характеристика та особливості
              </h3>
              <div className={styles.characteristicsTable}>
                {product.characteristics!.map((ch, idx) => (
                  <div key={idx} className={styles.characteristicRow}>
                    <span className={styles.characteristicName}>{ch.name}</span>
                    <span className={styles.characteristicValue}>
                      {ch.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Опис - статичний блок */}
          <div className={styles.descriptionBlock}>
            <h3 className={styles.descriptionBlockTitle}>Опис</h3>
            <div className={styles.descriptionContent}>
              {product?.description?.trim() ||
              product?.shortDescription?.trim() ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      product.description?.trim() ||
                      product.shortDescription?.trim() ||
                      "",
                  }}
                />
              ) : (
                <p>Опис товару відсутній</p>
              )}
            </div>
          </div>

          {/* Оплата */}
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => onToggleSection("payment")}
            >
              <span className={styles.sectionHeaderText}>Оплата</span>
              <span
                className={`${styles.chevron} ${
                  expandedSections.payment ? "" : styles.rotated
                }`}
              >
                <СhevronIcon />
              </span>
            </button>
            {expandedSections.payment && (
              <div className={styles.sectionContent}>
                <p className={styles.sectionContentText}>
                  Онлайн-оплата – банківською карткою Visa/MasterCard. <br />{" "}
                  Оплата при отриманні (накладений платіж) – можливість огляду
                  перед покупкою. <br /> Оплата через Apple Pay / Google Pay –
                  швидко та зручно.
                </p>
              </div>
            )}
          </div>

          {/* Обмін та повернення */}
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => onToggleSection("return")}
            >
              <span className={styles.sectionHeaderText}>
                Обмін та повернення
              </span>
              <span
                className={`${styles.chevron} ${
                  expandedSections.return ? "" : styles.rotated
                }`}
              >
                <СhevronIcon />
              </span>
            </button>
            {expandedSections.return && (
              <div className={styles.sectionContent}>
                <p className={styles.sectionContentText}>
                  Обмін та повернення можливі протягом 14 днів відповідно до
                  Закону України «Про захист прав споживачів».
                </p>
                <p className={styles.sectionContentText}>
                  Товари без слідів носіння, зі збереженими бирками та в
                  оригінальній упаковці можна повернути. Доставка повернення -
                  за рахунок покупця, якщо товар не має браку.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductInfo.displayName = "ProductInfo";

export default ProductInfo;
