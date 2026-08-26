"use client";
import React, { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useFavoriteStore } from "@/store/favorites";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BasketIcon,
  SmitnikIcon,
  BasketMobileVioletIcon,
  BasketMobileVioletGreenIcon,
} from "@/components/Icons/Icons";
import s from "./CartButton.module.css";
import { useTranslation } from "@/hooks/useTranslation";

function normalizeCartKey(id: string): string {
  const match = id.match(/(?:course|product)-(\d+)/i);
  return match?.[1] ?? id;
}

type Props = {
  id: string;
  productId?: number | string;
  name: string;
  slug?: string;
  productType?: string;
  variations?: number[];
  price?: number;
  originalPrice?: number;
  regularPrice?: number;
  salePrice?: number;
  image?: string;
  stockQuantity?: number | null;
  className?: string;
  activeClassName?: string;
  removeFromFavoritesOnAddToCart?: boolean;
  requireAuth?: boolean;
  metaData?: Array<{ key: string; value: string }>;
  showcaseCart?: boolean;
};

export default function CartButton({
  id,
  productId: productIdProp,
  name,
  slug,
  productType,
  variations,
  price = 0,
  originalPrice,
  regularPrice,
  salePrice,
  image,
  stockQuantity,
  className = "",
  activeClassName = "",
  removeFromFavoritesOnAddToCart = false,
  requireAuth = true,
  metaData,
  showcaseCart = false,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const removeFromFavorites = useFavoriteStore((s) => s.remove);
  const favoriteItems = useFavoriteStore((s) => s.items);
  const isInFavorites = favoriteItems[id] !== undefined;
  const normalizedKey = normalizeCartKey(id);
  const inCart =
    (cartItems[id] && cartItems[id].quantity > 0) ||
    (cartItems[normalizedKey] && cartItems[normalizedKey].quantity > 0);

  const isCourse = id.includes("course") || name.toLowerCase().includes("курс");

  const numericId = (() => {
    const raw = normalizeCartKey(id);
    return /^\d+$/.test(raw) ? raw : null;
  })();

  const getProductHref = () => {
    const rawSlug = slug?.trim();
    if (rawSlug) {
      if (rawSlug.startsWith("/")) return rawSlug;
      try {
        return `/products/${
          rawSlug.includes("%") ? decodeURIComponent(rawSlug) : rawSlug
        }`;
      } catch {
        return `/products/${rawSlug}`;
      }
    }
    return numericId ? `/products/${numericId}` : "/products";
  };

  const isVariableByProps =
    productType === "variable" || (variations?.length ?? 0) > 0;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const needsAuth = requireAuth || isCourse;

    if (!isCourse) {
      if (isVariableByProps) {
        router.push(getProductHref());
        return;
      }
    }

    if (needsAuth && !isLoggedIn && !inCart) {
      openLoginModal();
      return;
    }

    if (inCart) {
      const itemToRemove = cartItems[id] || cartItems[normalizedKey];
      if (itemToRemove) {
        const keyToRemove = cartItems[id] ? id : normalizedKey;
        removeItem(keyToRemove);
      }
    } else {
      try {
        await addItem(
          {
            id,
            productId:
              productIdProp != null
                ? typeof productIdProp === "string" && /^c[a-z0-9]{10,}$/i.test(productIdProp)
                  ? productIdProp
                  : productIdProp
                : /^c[a-z0-9]{10,}$/i.test(id)
                  ? id
                  : undefined,
            slug,
            name,
            price,
            originalPrice,
            regularPrice,
            salePrice,
            image,
            stockQuantity,
            metaData,
          },
          1,
        );
      } catch (error) {
        alert((error as Error).message);
        return;
      }

      if (removeFromFavoritesOnAddToCart && isInFavorites) {
        removeFromFavorites(id);
      }
    }
  };

  return (
    <button
      className={`${s.root} ${showcaseCart ? s.showcaseRoot : ""} ${className} ${
        inCart ? `${s.active} ${activeClassName}` : ""
      }`}
      onClick={handleClick}
      aria-pressed={inCart}
      aria-label={inCart ? t("product.removeFromCart") : t("product.addToCart")}
    >
      <div
        className={`${s.cartIconWrapper} ${
          showcaseCart ? s.showcaseWrapper : ""
        }`}
      >
        <span className={s.cartIconText}>
          {inCart ? t("product.inCart") : t("product.addToCart")}
        </span>
        {inCart ? (
          <span className={s.checkIcon} aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16.6667 5.83398L8.33333 14.1673L3.33333 9.16732"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : showcaseCart ? (
          <Image
            src="/icons/icon-18.svg"
            alt="Cart"
            width={18}
            height={18}
            className={s.showcaseIcon}
          />
        ) : (
          <Image
            src="/icons/icon-18.svg"
            alt="Cart"
            width={18}
            height={18}
          />
        )}
      </div>
    </button>
  );
}
