"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useProductsQuery } from "@/components/hooks/useProductsQuery";
import { calculatePrice, calculateCartPrice, getPriceSellRegistry, normalizePriceParams } from "@/lib/priceUtils";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { PlusIcon, CloseButtonIcon } from "@/components/Icons/Icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import s from "./CartModal.module.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "@/hooks/useTranslation";

// Функція для отримання бренду товару
const getProductBrand = (product: any): string | null => {
  // Спочатку перевіряємо поле brands (масив брендів)
  if (
    product.brands &&
    Array.isArray(product.brands) &&
    product.brands.length > 0
  ) {
    return product.brands[0].name;
  }

  // Потім перевіряємо мета дані
  if (product.metaData) {
    const brandMeta = product.metaData.find(
      (meta: any) =>
        meta.key === "_brand" ||
        meta.key === "brand" ||
        meta.key === "_product_brand" ||
        meta.key.toLowerCase().includes("brand")
    );
    if (brandMeta && brandMeta.value) {
      return brandMeta.value;
    }
  }

  // Потім перевіряємо атрибути товару
  if (product.attributes) {
    const brandAttr = product.attributes.find(
      (attr: any) =>
        attr.slug === "pa_brand" ||
        attr.slug === "brand" ||
        attr.name.toLowerCase().includes("бренд") ||
        attr.name.toLowerCase().includes("brand")
    );
    if (brandAttr && brandAttr.options && brandAttr.options.length > 0) {
      return brandAttr.options[0];
    }
  }

  return null;
};

export default function CartRecommendations() {
  const { t } = useTranslation();
  const { data: products, isLoading } = useProductsQuery();
  const items = useCartStore((st) => st.items);
  const addItem = useCartStore((st) => st.addItem);
  const removeItem = useCartStore((st) => st.removeItem);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const token = useAuthStore((state) => state.token);
  const effectiveIsLoggedIn =
    isLoggedIn ||
    !!token ||
    (typeof window !== "undefined" &&
      (!!localStorage.getItem("bfb_token") ||
        !!localStorage.getItem("bfb_token_old")));
  const swiperRef = useRef<{
    slidePrev: () => void;
    slideNext: () => void;
    slideTo: (i: number) => void;
  } | null>(null);
  const [recoPage, setRecoPage] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  const productsList = (products || []) as Array<{
    id: string;
    name: string;
    image?: string;
    price?: number;
    originalPrice?: number;
    regularPrice?: number;
    salePrice?: number;
    color?: string;
    stockQuantity?: number | null;
    metaData?: Array<{ key: string; value: string }>;
    wcProduct?: Record<string, unknown>;
  }>;

  // Показуємо skeleton під час завантаження або коли товарів немає
  if (isLoading || productsList.length === 0) {
    const skeletonCount = isMobile ? 2 : 3;
    const slideWidth = isMobile ? "155px" : "458px";
    const cardHeight = isMobile ? "211px" : "auto";
    
    return (
      <div className={s.recommendations}>
        <div className={s.recoHeader}>
          <Skeleton width={200} height={24} className={s.recoTitle} />
        </div>
        <div className={s.recoRow}>
          <div className={s.recoSwiper} style={{ display: "flex", gap: 8 }}>
            {[...Array(skeletonCount)].map((_, i) => (
              <div key={i} className={s.recoSlide} style={{ minWidth: slideWidth, width: slideWidth }}>
                <div className={s.recoItem} style={{ height: cardHeight, flexDirection: isMobile ? "column" : "row" }}>
                  <Skeleton 
                    width={isMobile ? 155 : 128} 
                    height={isMobile ? 100 : 116} 
                    borderRadius={8} 
                    className={s.recoThumb} 
                  />
                  <div className={s.recoContent}>
                    <div className={s.recoTextBlock}>
                      {isMobile ? (
                        <>
                          <Skeleton width={133} height={32} />
                          <Skeleton width={132} height={14} style={{ marginTop: 4 }} />
                        </>
                      ) : (
                        <>
                          <Skeleton width={60} height={14} style={{ marginBottom: 4 }} />
                          <Skeleton width="80%" height={16} />
                        </>
                      )}
                    </div>
                    <div className={s.recoPriceButtonBlock}>
                      <div className={s.recoPriceBlock} style={isMobile ? { flexDirection: "row", gap: 4 } : undefined}>
                        {isMobile ? (
                          <>
                            <Skeleton width={40} height={12} />
                            <Skeleton width={28} height={12} />
                          </>
                        ) : (
                          <Skeleton width={80} height={20} />
                        )}
                      </div>
                      <Skeleton width={isMobile ? 35 : 120} height={isMobile ? 35 : 40} borderRadius={8} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.recommendations}>
      <div className={s.recoHeader}>
        <div className={s.recoTitle}>{t("cart.recommended")}</div>
        {isMobile === false && productsList.length > 1 && (
          <SliderNav
            activeIndex={recoPage}
            dots={productsList.length}
            onPrev={() => swiperRef.current?.slidePrev()}
            onNext={() => swiperRef.current?.slideNext()}
            onDotClick={(idx) => swiperRef.current?.slideTo(idx)}
          />
        )}
      </div>
      <div className={s.recoRow}>
        <Swiper
          onSwiper={(inst: SwiperType) => (swiperRef.current = inst)}
          onSlideChange={(sw: SwiperType) => setRecoPage(sw.realIndex)}
          slidesPerView={3.1}
          spaceBetween={8}
          loop={productsList.length > 3}
          className={s.recoSwiper}
        >
          {productsList.map((p) => (
            <SwiperSlide key={p.id} className={s.recoSlide}>
              <div className={s.recoItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image || "/placeholder.svg"}
                  alt={p.name}
                  className={s.recoThumb}
                />
                <div className={s.recoContent}>
                  <div className={s.recoTextBlock}>
                    {(() => {
                      const brand = getProductBrand(p);
                      return brand ? (
                        <div className={s.recoBrand}>{brand}</div>
                      ) : null;
                    })()}
                    <div className={s.recoName}>{p.name}</div>
                    {p.color && <div className={s.recoColor}>{p.color}</div>}
                  </div>

                  <div className={s.recoPriceButtonBlock}>
                    <div className={s.recoPriceBlock}>
                      {(() => {
                        // Використовуємо уніфіковану функцію для нормалізації цін (як в CartItemsList)
                        const normalizedPrices = normalizePriceParams({
                          wcProduct: p.wcProduct,
                          price: p.price,
                          originalPrice: p.originalPrice,
                          regularPrice: p.regularPrice,
                          salePrice: p.salePrice,
                        });

                        // Отримуємо відсоток знижки з metaData
                        const priceSellRegistry = getPriceSellRegistry({
                          metaData: p.metaData,
                          meta_data: p.metaData,
                          wcProduct: p.wcProduct ? { meta_data: (p.wcProduct as any).meta_data } : undefined,
                        });

                        const {
                          finalPrice,
                          originalPrice,
                          shouldShowOldPrice,
                        } = calculatePrice({
                          price: normalizedPrices.price,
                          regularPrice: normalizedPrices.regularPrice,
                          salePrice: normalizedPrices.salePrice,
                          isLoggedIn: effectiveIsLoggedIn,
                          priceSellRegistry,
                        });

                        return (
                          <>
                            <div className={s.recoPrice}>
                              <span className={s.recoCurrentPriceValue}>
                                {finalPrice.toLocaleString()}
                              </span>
                              <span className={s.recoPriceCurrency}>₴</span>
                            </div>
                            {shouldShowOldPrice && (
                              <div className={s.recoOldPrice}>
                                <span className={s.recoOriginalPriceValue}>
                                  {originalPrice.toLocaleString()}
                                </span>
                                <span className={s.recoOriginalPriceCurrency}>
                                  ₴
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    {items[String(p.id)] ? (
                      <button
                        className={`${s.smallPrimary} ${s.smallDelete}`}
                        onClick={() => removeItem(String(p.id))}
                        aria-label={t("cart.removeItem")}
                      >
                        <span className={s.smallPrimaryLabel}>
                          {t("cart.remove")}
                        </span>
                        <CloseButtonIcon />
                      </button>
                    ) : (
                      <button
                        className={s.smallPrimary}
                        onClick={async () => {
                          // Використовуємо уніфіковану функцію для нормалізації цін (як в CartItemsList)
                          const normalizedPrices = normalizePriceParams({
                            wcProduct: p.wcProduct,
                            price: p.price,
                            originalPrice: p.originalPrice,
                            regularPrice: p.regularPrice,
                            salePrice: p.salePrice,
                          });

                          // Отримуємо відсоток знижки з metaData
                          const priceSellRegistry = getPriceSellRegistry({
                            metaData: p.metaData,
                            meta_data: p.metaData,
                            wcProduct: p.wcProduct ? { meta_data: (p.wcProduct as any).meta_data } : undefined,
                          });

                          const { priceToAdd, originalPriceToAdd } =
                            calculateCartPrice({
                              price: normalizedPrices.price,
                              regularPrice: normalizedPrices.regularPrice,
                              salePrice: normalizedPrices.salePrice,
                              isLoggedIn: effectiveIsLoggedIn,
                              priceSellRegistry,
                            });

                          try {
                            await addItem({
                              id: String(p.id),
                              productId:
                                typeof p.id === "string" && /^c[a-z0-9]{10,}$/i.test(p.id)
                                  ? p.id
                                  : !isNaN(Number(p.id))
                                    ? Number(p.id)
                                    : undefined,
                              slug: (p as { slug?: string }).slug,
                              name: p.name,
                              price: priceToAdd,
                              image: p.image,
                              color: p.color,
                              originalPrice: originalPriceToAdd,
                              stockQuantity: p.stockQuantity,
                              metaData: p.metaData,
                              wcPrice: normalizedPrices.price,
                              wcRegularPrice: normalizedPrices.regularPrice,
                            });
                          } catch (error) {
                            alert((error as Error).message);
                            return;
                          }
                        }}
                        aria-label={t("cart.addItem")}
                      >
                        <span className={s.smallPrimaryLabel}>
                          {t("cart.add")}
                        </span>
                        <PlusIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
