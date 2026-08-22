"use client";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import ProductCard from "@/components/sections/ProductsSection/ProductCard/ProductCard";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { normalizeImageUrl } from "@/lib/imageUtils";
import Image from "next/image";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useFavoriteStore } from "@/store/favorites";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { A11y, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import s from "./FavoritesModal.module.css";
import FavoritesModalSkeleton from "./FavoritesModalSkeleton";
import { useTranslation } from "@/hooks/useTranslation";

const FORCE_FAVORITES_SKELETON = false;

type FavoriteEnrichedData = {
  price?: number;
  originalPrice?: number;
  metaData?: Array<{ key: string; value: string }>;
};

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? parseFloat(value)
        : parseFloat(String(value));
  return Number.isFinite(n) ? n : undefined;
}

function extractProductSlug(slug?: string): string | null {
  if (!slug) return null;
  const raw = slug.trim();
  if (!raw) return null;
  // може бути "/products/sumka-bfb" або "sumka-bfb"
  const withoutQuery = raw.split("?")[0] || "";
  const parts = withoutQuery.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  return parts[parts.length - 1] || null;
}

export default function FavoritesModal() {
  const { t } = useTranslation();
  const isOpen = useFavoriteStore((st) => st.isOpen);
  const close = useFavoriteStore((st) => st.close);
  const remove = useFavoriteStore((st) => st.remove);
  const removeAll = useFavoriteStore((st) => st.removeAll);
  const clear = useFavoriteStore((st) => st.clear);
  const itemsMap = useFavoriteStore((st) => st.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);
  const addToCart = useCartStore((st) => st.addItem);
  const removeItem = useCartStore((st) => st.removeItem);
  const clearCart = useCartStore((st) => st.clear);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [enrichedByKey, setEnrichedByKey] = useState<
    Record<string, FavoriteEnrichedData>
  >({});
  const swiperRef = useRef<SwiperType | null>(null);
  const desktopSwiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [desktopActiveIndex, setDesktopActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const desktopTotalSlides = Math.max(
    1,
    items.length > 5 ? items.length - 5 + 1 : 1,
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const trySync = () => {
      const s = useFavoriteStore.getState();
      const t = useAuthStore.getState().token;
      if (s.pendingFavoritesSync && s.currentUserId && t) {
        s.syncFavoritesToApi();
      }
    };
    const onBeforeUnload = () => trySync();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") trySync();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Підтягуємо meta та ціни з catalog API
  useEffect(() => {
    if (!isOpen) return;
    if (items.length === 0) return;

    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

    const run = async () => {
      const productCache = new Map<
        string,
        {
          price?: string;
          characteristics?: Array<{ name: string; value: string }>;
        }
      >();

      const tasks = items.map(async (it) => {
        if (it.id.startsWith("course-")) return;

        const already =
          enrichedByKey[it.id] ||
          (it.metaData && it.metaData.length > 0 && it.originalPrice);
        if (already) return;

        const slug = extractProductSlug(it.slug) ?? it.id;
        if (!slug) return;

        try {
          let cached = productCache.get(slug);
          if (!cached) {
            const res = await fetch(
              `${base}/api/catalog/products/${encodeURIComponent(slug)}`,
            );
            const raw = res.ok ? await res.json() : null;
            const d = raw?.data ?? raw;
            cached = {
              price: d?.price,
              characteristics: d?.characteristics,
            };
            if (cached) productCache.set(slug, cached);
          }
          if (!cached || cancelled) return;

          const metaData: Array<{ key: string; value: string }> = (
            cached.characteristics ?? []
          ).map((c: { name: string; value: string }) => ({
            key: c.name,
            value: String(c.value ?? ""),
          }));

          const price = toNumber(cached.price);
          const originalPrice = price;

          if (cancelled) return;

          setEnrichedByKey((prev) => ({
            ...prev,
            [it.id]: {
              price: price ?? prev[it.id]?.price,
              originalPrice: originalPrice ?? prev[it.id]?.originalPrice,
              metaData: metaData.length > 0 ? metaData : prev[it.id]?.metaData,
            },
          }));
        } catch {
          // ігноруємо — UI просто відобразить те, що вже є
        }
      });

      await Promise.all(tasks);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isOpen, items, enrichedByKey]);

  const mobileChunkSize = 4;
  const mobilePages = useMemo(() => {
    const chunks: (typeof items)[] = [];
    for (let i = 0; i < items.length; i += mobileChunkSize) {
      chunks.push(items.slice(i, i + mobileChunkSize));
    }
    return chunks;
  }, [items]);

  const mobilePageItems =
    isMobile && mobilePages.length > 0
      ? mobilePages[Math.min(activeIndex, mobilePages.length - 1)]
      : [];

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (mobilePages.length === 0) {
      if (activeIndex !== 0) {
        setActiveIndex(0);
      }
      return;
    }
    if (activeIndex >= mobilePages.length) {
      const newIndex = Math.max(0, mobilePages.length - 1);
      if (activeIndex !== newIndex) {
        setActiveIndex(newIndex);
      }
    }
  }, [activeIndex, mobilePages.length]);

  useEffect(() => {
    if (desktopTotalSlides === 0) {
      if (desktopActiveIndex !== 0) {
        setDesktopActiveIndex(0);
      }
      return;
    }
    if (desktopActiveIndex >= desktopTotalSlides) {
      const newIndex = Math.max(0, desktopTotalSlides - 1);
      if (desktopActiveIndex !== newIndex) {
        setDesktopActiveIndex(newIndex);
      }
    }
  }, [desktopActiveIndex, desktopTotalSlides, items.length]);

  useScrollLock(isOpen);

  if (!isOpen || !isMounted) return null;

  const emptyFavoritesContent = (
    <div className={s.emptyCart}>
      <div className={s.emptyCartIcon}>
        <Image
          src="/images/preference.svg"
          alt=""
          width={350}
          height={350}
          priority
        />
      </div>
      <div className={s.emptyCartTextCol}>
        <p className={s.emptyCartTitle}>{t("favorites.emptyTitle")}</p>
        <p className={s.emptyCartSubtitle}>{t("favorites.emptySubtitle")}</p>
      </div>
    </div>
  );

  const emptyFavoritesDesktop = (
    <>
      {emptyFavoritesContent}
      <button
        type="button"
        className={s.emptyCartButton}
        onClick={() => {
          close();
          window.location.href = "/products";
        }}
      >
        {t("common.toCatalog")}
      </button>
    </>
  );

  const content =
    FORCE_FAVORITES_SKELETON || isMobile === null ? (
      <FavoritesModalSkeleton />
    ) : (
      <div className={s.backdrop} onClick={close}>
        <div
          className={`${s.modal} ${
            items.length === 0 ? s.modalEmpty : s.modalFilled
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`${s.topbarListBlock} ${
              items.length === 0 ? s.topbarListBlockEmpty : ""
            }`}
          >
            <div className={s.topbar}>
              <span className={s.topbarTitle}>
                {isMobile ? t("favorites.title") : t("favorites.titleShort")}
              </span>
              {!isMobile && (
                <div className={s.headerActions}>
                  <ModalCloseButton onClose={close} className={s.close} />
                </div>
              )}
            </div>

            {isMobile ? (
              <div
                className={`${s.mobileSliderWrap} ${
                  items.length === 0 ? s.mobileSliderWrapEmpty : ""
                }`}
              >
                {items.length === 0 ? (
                  emptyFavoritesContent
                ) : (
                  <div className={s.mobileSlideGrid}>
                    {items.map((it) => {
                      const isCourse = it.id.startsWith("course-");
                      const courseId = isCourse
                        ? it.id.replace("course-", "")
                        : undefined;
                      const normalizedImage = normalizeImageUrl(it.image);
                      const enriched = enrichedByKey[it.id];
                      const effectivePrice = enriched?.price ?? it.price ?? 0;
                      const effectiveOriginalPrice =
                        enriched?.originalPrice ?? it.originalPrice;
                      const effectiveMetaData =
                        (enriched?.metaData &&
                          enriched.metaData.length > 0 &&
                          enriched.metaData) ||
                        it.metaData;
                      return (
                        <div
                          key={it.id}
                          className={s.mobileCardWrapper}
                          onClick={() => close()}
                        >
                          <ProductCard
                            id={it.id}
                            name={it.name}
                            price={effectivePrice}
                            originalPrice={effectiveOriginalPrice}
                            color={it.color}
                            size={it.size}
                            image={normalizedImage}
                            slug={
                              isCourse && courseId
                                ? `/courses/${courseId}`
                                : it.slug
                            }
                            discount={it.discount}
                            isNew={it.isNew}
                            isHit={it.isHit}
                            stockStatus={
                              it.stockQuantity != null && it.stockQuantity <= 0
                                ? "outofstock"
                                : undefined
                            }
                            useRedGreenIconOnMobile={true}
                            removeFromFavoritesOnAddToCart={true}
                            productType={it.productType}
                            variations={it.variations}
                            metaData={effectiveMetaData}
                            showcaseDark
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className={s.desktopSliderWrap}>
                {items.length === 0 ? (
                  emptyFavoritesDesktop
                ) : (
                  <Swiper
                    modules={[Navigation, Pagination, A11y]}
                    onSwiper={(sw: SwiperType) =>
                      (desktopSwiperRef.current = sw)
                    }
                    onSlideChange={(sw: SwiperType) =>
                      setDesktopActiveIndex(sw.activeIndex)
                    }
                    spaceBetween={20}
                    slidesPerView={5}
                    slidesPerGroup={1}
                    centeredSlides={false}
                    observer
                    observeParents
                    updateOnWindowResize
                  >
                    {items.map((it) => {
                      const isCourse = it.id.startsWith("course-");
                      const courseId = isCourse
                        ? it.id.replace("course-", "")
                        : undefined;
                      const normalizedImage = normalizeImageUrl(it.image);
                      const enriched = enrichedByKey[it.id];
                      const effectivePrice = enriched?.price ?? it.price ?? 0;
                      const effectiveOriginalPrice =
                        enriched?.originalPrice ?? it.originalPrice;
                      const effectiveMetaData =
                        (enriched?.metaData &&
                          enriched.metaData.length > 0 &&
                          enriched.metaData) ||
                        it.metaData;
                      return (
                        <SwiperSlide key={it.id} className={s.desktopSlide}>
                          <div onClick={() => close()}>
                            <ProductCard
                              id={it.id}
                              name={it.name}
                              price={effectivePrice}
                              originalPrice={effectiveOriginalPrice}
                              color={it.color}
                              size={it.size}
                              image={normalizedImage}
                              slug={
                                isCourse && courseId
                                  ? `/courses/${courseId}`
                                  : it.slug
                              }
                              discount={it.discount}
                              isNew={it.isNew}
                              isHit={it.isHit}
                              stockStatus={
                              it.stockQuantity != null && it.stockQuantity <= 0
                                ? "outofstock"
                                : undefined
                            }
                              useRedGreenIconOnMobile={true}
                              removeFromFavoritesOnAddToCart={true}
                              productType={it.productType}
                              variations={it.variations}
                              metaData={effectiveMetaData}
                            />
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                )}
              </div>
            )}
          </div>

          {items.length === 0 && isMobile && (
            <button
              type="button"
              className={s.emptyCartButton}
              onClick={() => {
                close();
                window.location.href = "/products";
              }}
            >
              {t("common.toCatalog")}
            </button>
          )}

          {items.length > 0 && !isMobile && (
            <div className={s.actionsRow}>
              <div className={s.buttonsWrap}>
                <button
                  className={s.secondary}
                  onClick={async () => {
                    const itemsToAdd = isMobile ? mobilePageItems : items;

                    const itemIds: string[] = [];
                    const cartItemsToAdd = [];

                    for (const it of itemsToAdd) {
                      if (typeof it.price === "number") {
                        const itemId = it.id;
                        itemIds.push(itemId);
                        const enriched = enrichedByKey[it.id];
                        const effectivePrice = enriched?.price ?? it.price ?? 0;
                        const effectiveOriginalPrice =
                          enriched?.originalPrice ?? it.originalPrice;
                        const effectiveMetaData =
                          (enriched?.metaData &&
                            enriched.metaData.length > 0 &&
                            enriched.metaData) ||
                          it.metaData;

                        cartItemsToAdd.push({
                          id: itemId,
                          name: it.name,
                          price: effectivePrice,
                          image: it.image,
                          originalPrice: effectiveOriginalPrice,
                          regularPrice: effectiveOriginalPrice,
                          salePrice: undefined,
                          variationId: it.variationId,
                          color: it.color,
                          size: it.size,
                          metaData: effectiveMetaData,
                        });
                      }
                    }

                    for (const cartItem of cartItemsToAdd) {
                      try {
                        await addToCart(cartItem, 1);
                      } catch (error) {}
                    }

                    if (itemIds.length > 0) {
                      try {
                        await removeAll(itemIds);
                      } catch (error) {}
                    }
                  }}
                >
                  {t("favorites.addAll")}
                </button>

                <button
                  className={s.remove}
                  onClick={() => {
                    clear();
                  }}
                >
                  {t("favorites.removeAll")}
                </button>
              </div>
              <div className={s.navWrap}>
                {isMobile
                  ? items.length > 4 && (
                      <SliderNav
                        activeIndex={activeIndex}
                        dots={mobilePages.length}
                        onPrev={() => swiperRef.current?.slidePrev()}
                        onNext={() => swiperRef.current?.slideNext()}
                        onDotClick={(idx) => swiperRef.current?.slideTo(idx)}
                      />
                    )
                  : items.length > 5 && (
                      <SliderNav
                        activeIndex={desktopActiveIndex}
                        dots={desktopTotalSlides}
                        onPrev={() => desktopSwiperRef.current?.slidePrev()}
                        onNext={() => desktopSwiperRef.current?.slideNext()}
                        onDotClick={(idx) =>
                          desktopSwiperRef.current?.slideTo(idx)
                        }
                      />
                    )}
              </div>
            </div>
          )}
        </div>
      </div>
    );

  return createPortal(content, document.body);
}
