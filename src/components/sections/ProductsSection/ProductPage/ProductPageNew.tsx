"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useProductQuery } from "@/components/hooks/useProductsQuery";
import {
  useProductsByCategory,
  useFilteredProducts,
} from "@/components/hooks/useFilteredProducts";
import { useProductGallery } from "@/components/hooks/useProductGallery";
import { useProductVariations } from "@/components/hooks/useProductVariations";
import { useProductActions } from "@/components/hooks/useProductActions";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import styles from "./ProductPage.module.css";
import RegisterModal from "@/components/auth/RegisterModal/RegisterModal";
import { calculatePrice } from "@/lib/priceUtils";
import ProductPageSkeleton from "./ProductPageSkeleton";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductReviews from "./ProductReviews";
import RelatedProducts from "./RelatedProducts";
import RecentlyViewed from "./RecentlyViewed";
import { trackView } from "@/components/hooks/useRecentlyViewed";
import Link from "next/link";
import { СhevronIcon } from "@/components/Icons/Icons";
import {
  isNewProduct,
  isHitProduct,
  isBoardProduct,
  getStockStatusText,
  isProductAvailable,
} from "./utils";
import type { Product } from "@/lib/products";

export default function ProductPage({ productSlug }: { productSlug: string }) {
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useProductQuery(productSlug);

  const categorySlug = product?.categories?.[0]?.slug ?? "";
  const { data: categoryProducts = [] } = useProductsByCategory(categorySlug, {
    per_page: 12,
  });
  const { data: fallbackProducts = [] } = useFilteredProducts({
    per_page: 12,
  });

  // Товари з категорії; якщо порожньо — з каталогу
  const relatedCategoryProducts = useMemo(() => {
    if (!product?.slug) return [];
    const excludeCurrent = (p: any) =>
      (p.slug || "").toLowerCase() !== (product.slug || "").toLowerCase();
    const fromCategory = (categoryProducts || []).filter(excludeCurrent);
    if (fromCategory.length > 0) return fromCategory.slice(0, 12);
    return (fallbackProducts || []).filter(excludeCurrent).slice(0, 12);
  }, [categoryProducts, fallbackProducts, product?.slug]);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Хук для галереї зображень
  const { selectedImageIndex, onThumbPrev, onThumbNext, selectImage } =
    useProductGallery(product?.images || [], isMobile || false);

  // Стан для варіацій продукту
  const [variationsData, setVariationsData] = useState<any[]>([]);
  const [variationsLoading, setVariationsLoading] = useState(false);

  // Завантаження варіацій продукту (catalog API)
  useEffect(() => {
    const loadVariations = async () => {
      if (!product?.wcProduct?.variations?.length) {
        setVariationsLoading(false);
        return;
      }

      setVariationsLoading(true);

      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const variations = await Promise.all(
          product.wcProduct.variations
            .slice(0, 10)
            .map(async (variationId: number) => {
              const res = await fetch(
                `${base}/api/catalog/products/${product.id}/variations/${variationId}`,
              );
              if (!res.ok) return null;
              return res.json();
            }),
        );

        const validVariations = variations.filter(Boolean);
        setVariationsData(validVariations);
      } catch {
        setVariationsData([]);
      } finally {
        setVariationsLoading(false);
      }
    };

    if (product?.wcProduct?.variations?.length) {
      loadVariations();
    } else {
      setVariationsData([]);
      setVariationsLoading(false);
    }
  }, [product]);

  // Хук для варіацій продукту
  const {
    selectedVariation,
    availableSizes,
    availableColors,
    setSelectedSize,
    setSelectedColor,
  } = useProductVariations(variationsData, product?.attributes);

  // Хук для дій з товаром
  const { quantity, isAddingToCart, isFavorite, addToCart, toggleFavorite } =
    useProductActions(product || null, selectedVariation, isLoggedIn);

  const handleRegisterOpen = useCallback(() => {
    setIsRegisterOpen(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ВИКОРИСТОВУЄМО useMemo ЗАВЖДИ перед умовним return
  const isActuallyNew = useMemo(
    () => isNewProduct(product?.dateCreated || ""),
    [product?.dateCreated],
  );

  const isActuallyHit = useMemo(
    () => isHitProduct(product as any, relatedCategoryProducts as any),
    [product, relatedCategoryProducts],
  );

  const priceCalculation = useMemo(
    () =>
      calculatePrice({
        price: selectedVariation?.price || product?.price || 0,
        regularPrice:
          selectedVariation?.regular_price || product?.regularPrice || "",
        isLoggedIn,
      }),
    [
      selectedVariation?.price,
      selectedVariation?.regular_price,
      product?.price,
      product?.regularPrice,
      isLoggedIn,
    ],
  );

  const { finalPrice, originalPrice, totalDiscount, shouldShowOldPrice } =
    priceCalculation;
  const hasDiscount = totalDiscount > 0;

  const isAvailable = useMemo(
    () => (product ? isProductAvailable(product) : false),
    [product],
  );
  const stockStatusText = useMemo(
    () => getStockStatusText(product?.stockStatus || "instock"),
    [product?.stockStatus],
  );
  const isControlsDisabled = !isAvailable;
  const isOutOfStock = product?.stockStatus === "outofstock";

  const cartItems = useCartStore((s) => s.items);
  const productId = product?.id?.toString() || productSlug;
  const cartQuantity = cartItems[productId]?.quantity || 0;

  // Відстеження перегляду товару (localStorage для анонімів, API для авторизованих)
  useEffect(() => {
    if (!product?.id) return;
    const snapshot = {
      slug: product.slug,
      name: product.name,
      price: product.price ?? product.regularPrice,
      images: product.images,
      mainImageUrl: product.images?.[0]?.src,
      ratingAverage:
        typeof product.averageRating === "number"
          ? product.averageRating
          : parseFloat(String(product.averageRating || 0)) || undefined,
      ratingCount: product.ratingCount,
      categories: product.categories?.map((c) => ({
        id: String(c.id),
        name: c.name,
        slug: c.slug,
      })),
    };
    trackView(String(product.id), snapshot);
  }, [product?.id, product?.slug]);

  // УМОВНИЙ РЕНДЕРИНГ ТІЛЬКИ В RETURN
  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className={`${styles.productPage} ${styles.error}`}>
        <div className={styles.loading}>
          {error ? "Помилка завантаження товару" : "Товар не знайдено"}
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Головна", href: "/" },
    { label: "Магазин", href: "/shop" },
    { label: "Всі товари", href: "/shop" },
    ...(product.categories?.map((c) => ({
      label: c.name,
      href: `/shop?category=${c.slug}`,
    })) ?? []),
    { label: product.name, href: undefined },
  ];

  return (
    <div
      className={`${styles.productPage} ${
        isOutOfStock ? styles.productPageOutOfStock : ""
      }`}
    >
      {/* Хлібні крихти */}
      {/* <nav className={styles.breadcrumb} aria-label="Навігація">
        {breadcrumbItems.map((item, i) => (
          <span key={i}>
            {i > 0 && " > "}
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        ))}
      </nav> */}

      <div className={styles.productContainer}>
        <div className={styles.productLeftColumn}>
          <ProductGallery
            images={product?.images || []}
            productName={product?.name || ""}
            isMobile={isMobile || false}
            isActuallyNew={isActuallyNew}
            hasDiscount={hasDiscount}
            totalDiscount={totalDiscount}
            isActuallyHit={isActuallyHit}
          />
          <div className={styles.productReviewsWrap}>
            <ProductReviews
              productSlug={product.slug}
              isMobile={isMobile || false}
            />
          </div>
        </div>

        <ProductInfo
          product={product}
          variationsData={variationsData}
          attributes={product?.attributes}
          selectedVariation={selectedVariation}
          selectedImageIndex={selectedImageIndex}
          onImageSelect={selectImage}
          isActuallyHit={isActuallyHit}
          isMobile={isMobile || false}
          isLoggedIn={isLoggedIn}
          isBoardProduct={isBoardProduct(product)}
          isAvailable={isAvailable}
          stockStatusText={stockStatusText}
          isControlsDisabled={isControlsDisabled}
          cartQuantity={cartQuantity}
          variationsLoading={false}
          finalPrice={finalPrice}
          originalPrice={originalPrice}
          shouldShowOldPrice={shouldShowOldPrice}
          onRegisterOpen={handleRegisterOpen}
        />
      </div>

      {/* Пов'язані товари */}
      <RelatedProducts
        relatedCategoryProducts={relatedCategoryProducts as any}
        currentProductSlug={product.slug}
        isMobile={isMobile || false}
      />

      {/* Переглянуті товари */}
      <RecentlyViewed
        currentProductSlug={product.slug}
        isMobile={isMobile || false}
      />

      {!isLoggedIn && (
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
      )}

      {/* Overlay для товарів, яких немає в наявності */}
      {isOutOfStock && (
        <div className={styles.outOfStockOverlay}>Немає в наявності</div>
      )}
    </div>
  );
}
