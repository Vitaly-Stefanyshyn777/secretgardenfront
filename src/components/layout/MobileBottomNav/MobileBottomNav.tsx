"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useFavoriteStore } from "@/store/favorites";
import { useTranslation } from "@/hooks/useTranslation";
import styles from "./MobileBottomNav.module.css";

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4.5 10.5L12 4.5L19.5 10.5V19.5C19.5 20.0523 19.0523 20.5 18.5 20.5H5.5C4.94772 20.5 4.5 20.0523 4.5 19.5V10.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 20.5V12.5H14.5V20.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CatalogIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4.5 5.5C4.5 4.94772 4.94772 4.5 5.5 4.5H10C10.5523 4.5 11 4.94772 11 5.5V18.5C11 19.0523 10.5523 19.5 10 19.5H5.5C4.94772 19.5 4.5 19.0523 4.5 18.5V5.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M13 5.5C13 4.94772 13.4477 4.5 14 4.5H18.5C19.0523 4.5 19.5 4.94772 19.5 5.5V18.5C19.5 19.0523 19.0523 19.5 18.5 19.5H14C13.4477 19.5 13 19.0523 13 18.5V5.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 20.25L10.9125 19.2675C6.45 15.27 3.5 12.6375 3.5 9.375C3.5 6.75 5.565 4.6875 8.175 4.6875C9.66 4.6875 11.085 5.3775 12 6.4725C12.915 5.3775 14.34 4.6875 15.825 4.6875C18.435 4.6875 20.5 6.75 20.5 9.375C20.5 12.6375 17.55 15.27 13.0875 19.275L12 20.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4.5 7.5H19.5L18.2 18.15C18.12 18.86 17.52 19.4 16.8 19.4H7.2C6.48 19.4 5.88 18.86 5.8 18.15L4.5 7.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 7.5V6.25C8.5 4.45507 9.95507 3 11.75 3H12.25C14.0449 3 15.5 4.45507 15.5 6.25V7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="10" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M7.75 17.25C8.65 15.55 10.2 14.5 12 14.5C13.8 14.5 15.35 15.55 16.25 17.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const toggleCart = useCartStore((s) => s.toggle);
  const toggleFav = useFavoriteStore((s) => s.toggle);
  const isCartOpen = useCartStore((s) => s.isOpen);
  const isFavOpen = useFavoriteStore((s) => s.isOpen);
  const cartCount = useCartStore((s) =>
    Object.values(s.items).reduce((sum, item) => sum + item.quantity, 0),
  );
  const favoriteCount = useFavoriteStore((s) => Object.keys(s.items).length);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  if (!isMobile) return null;

  const isHome = pathname === "/";
  const isCatalog =
    pathname.startsWith("/products") || pathname.startsWith("/catalog");
  const isProfile = pathname.startsWith("/profile");

  // Лише один активний пункт: модалки мають пріоритет над маршрутом
  const activeTab = isCartOpen
    ? "cart"
    : isFavOpen
      ? "favorites"
      : isProfile
        ? "profile"
        : isCatalog
          ? "catalog"
          : isHome
            ? "home"
            : null;

  const handleProfile = () => {
    if (isLoggedIn) {
      window.location.href = "/profile";
    } else {
      openLoginModal();
    }
  };

  const openFavorites = () => {
    if (isCartOpen) toggleCart();
    toggleFav();
  };

  const openCart = () => {
    if (isFavOpen) toggleFav();
    toggleCart();
  };

  return (
    <nav className={styles.nav} aria-label={t("nav.mobileNav")}>
      <Link
        href="/"
        className={`${styles.item} ${activeTab === "home" ? styles.itemActive : ""}`}
      >
        <span className={styles.icon}>
          <HomeIcon />
        </span>
        <span className={styles.label}>{t("nav.home")}</span>
      </Link>

      <Link
        href="/products"
        className={`${styles.item} ${activeTab === "catalog" ? styles.itemActive : ""}`}
      >
        <span className={styles.icon}>
          <CatalogIcon />
        </span>
        <span className={styles.label}>{t("nav.catalog")}</span>
      </Link>

      <button
        type="button"
        className={`${styles.item} ${activeTab === "favorites" ? styles.itemActive : ""}`}
        onClick={openFavorites}
        aria-label={t("nav.favorites")}
      >
        <span className={styles.icon}>
          <HeartIcon />
          {favoriteCount > 0 && (
            <span className={styles.badge}>{favoriteCount}</span>
          )}
        </span>
        <span className={styles.label}>{t("nav.favorites")}</span>
      </button>

      <button
        type="button"
        className={`${styles.item} ${activeTab === "cart" ? styles.itemActive : ""}`}
        onClick={openCart}
        aria-label={t("nav.cart")}
      >
        <span className={styles.icon}>
          <CartIcon />
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </span>
        <span className={styles.label}>{t("nav.cart")}</span>
      </button>

      <button
        type="button"
        className={`${styles.item} ${activeTab === "profile" ? styles.itemActive : ""}`}
        onClick={handleProfile}
        aria-label={t("nav.profile")}
      >
        <span className={styles.icon}>
          <ProfileIcon />
        </span>
        <span className={styles.label}>{t("nav.profile")}</span>
      </button>
    </nav>
  );
}
