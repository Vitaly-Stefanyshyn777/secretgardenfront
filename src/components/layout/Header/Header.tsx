"use client";

import { Fragment, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import s from "./Header.module.css";
import {
  BurgerMenu,
  FacebookIcon,
  CloseButtonIcon,
  InstagramIcon,
  LogoHeader,
  NumberHeader,
  TelegramIcon,
  WhatsappIcon,
  LogoHeaderText,
} from "../../Icons/Icons";
import RegisterModal from "@/components/auth/RegisterModal/RegisterModal";
import LoginModal from "@/components/auth/LoginModal/LoginModal";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal/ResetPasswordModal";
import { useCartStore } from "@/store/cart";
import { useFavoriteStore } from "@/store/favorites";
import CartModal from "../../CartModal/CartModal";
import FavoritesModal from "../../FavoritesModal/FavoritesModal";
import { mainNavigation, burgerMenuNavigation } from "@/lib/navigation";
import { useThemeSettings } from "@/components/providers/ThemeSettingsProvider";
import { getContactData } from "@/lib/themeSettingsUtils";

export default function Header() {
  const pathname = usePathname();
  const headerClass = ""; // статичний хедер, без зміни кольорів/станів
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isTrenersModalOpen, setIsTrenersModalOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const { isLoggedIn } = useAuthStore();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);
  const openCart = useCartStore((s) => s.open);
  const openFav = useFavoriteStore((s) => s.open);
  const toggleCart = useCartStore((s) => s.toggle);
  const toggleFav = useFavoriteStore((s) => s.toggle);
  const isCartOpen = useCartStore((s) => s.isOpen);
  const isFavOpen = useFavoriteStore((s) => s.isOpen);

  // Використовуємо useMemo для кешування результатів
  const cartItemsMap = useCartStore((s) => s.items);
  const favoriteItemsMap = useFavoriteStore((s) => s.items);

  const openRegisterModal = () => setIsRegisterOpen(true);

  const cartItems = useMemo(() => Object.values(cartItemsMap), [cartItemsMap]);
  const favoriteItems = useMemo(
    () => Object.values(favoriteItemsMap),
    [favoriteItemsMap],
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );
  const favoriteCount = useMemo(() => favoriteItems.length, [favoriteItems]);

  // Отримуємо контактні дані з theme_settings
  const { themeSettings } = useThemeSettings();
  const contactData = useMemo(
    () => getContactData(themeSettings),
    [themeSettings],
  );

  const handleUserIconClick = () => {
    if (isLoggedIn) {
      window.location.href = "/profile";
    } else {
      openLoginModal();
    }
  };

  const handleLoginSuccess = async () => {
    closeLoginModal();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Блокуємо скролінг коли меню відкрите
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Очищуємо стилі при розмонтуванні компонента
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Визначення мобільної версії
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  // Відстеження стану модалки InstructingSlider
  useEffect(() => {
    const checkSliderState = () => {
      setIsSliderOpen(
        document.body.classList.contains("instructing-slider-open"),
      );
    };

    checkSliderState();

    const observer = new MutationObserver(checkSliderState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Відстеження стану модалки EventsSection
  useEffect(() => {
    const checkEventsModalState = () => {
      setIsEventsModalOpen(
        document.body.classList.contains("events-modal-open"),
      );
    };

    checkEventsModalState();

    const observer = new MutationObserver(checkEventsModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Відстеження стану модалки TrenersModal
  useEffect(() => {
    const checkTrenersModalState = () => {
      setIsTrenersModalOpen(
        document.body.classList.contains("treners-modal-open"),
      );
    };

    checkTrenersModalState();

    const observer = new MutationObserver(checkTrenersModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Перевірка безпосередньо в рендері для надійності
  const shouldHideHeader =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1000px)").matches &&
    (document.body.classList.contains("instructing-slider-open") ||
      document.body.classList.contains("events-modal-open") ||
      document.body.classList.contains("treners-modal-open"));

  // Перевірка для InstructingSlider на всіх пристроях
  const shouldHideHeaderForSlider =
    typeof window !== "undefined" &&
    document.body.classList.contains("instructing-slider-open");

  // Не показуємо хедер на мобільних, коли модалка InstructingSlider, EventsSection або TrenersModal відкрита
  // Або на всіх пристроях, коли відкритий InstructingSlider
  if (
    shouldHideHeaderForSlider ||
    (isMobile && (isSliderOpen || isEventsModalOpen || isTrenersModalOpen)) ||
    shouldHideHeader
  ) {
    return null;
  }

  return (
    <header
      className={`${s.header} ${isMobile ? s.mobileHeader : ""}`}
      suppressHydrationWarning
    >
      <div className={s.headerTrainerProfileBlock}>
        {isMobile ? (
          <>
            <div className={s.mobileLeft}>
              <button className={s.burger} onClick={toggleMenu}>
                <BurgerMenu />
              </button>
              <button
                className={s.iconBtn}
                onClick={handleUserIconClick}
                title={
                  isHydrated
                    ? isLoggedIn
                      ? "Особистий кабінет"
                      : "Увійти"
                    : "Профіль"
                }
                suppressHydrationWarning
              >
                <Image
                  src="/icons/prefix-2.svg"
                  alt="Профіль"
                  width={20}
                  height={20}
                  className={s.iconImage}
                />
              </button>
            </div>

            <div className={s.mobileLogo}>
              <Link href="/">
                <div className={s.LogoIcon}>
                  <LogoHeaderText />
                </div>
              </Link>
            </div>

            <div className={s.mobileRight}>
              <button
                className={`${s.iconBtn} ${isFavOpen ? s.active : ""}`}
                onClick={toggleFav}
                title="Обране"
              >
                <Image
                  src="/icons/prefix-Icon.svg"
                  alt=""
                  width={20}
                  height={20}
                  className={s.iconImage}
                />
                {favoriteCount > 0 && (
                  <span className={s.badge}>{favoriteCount}</span>
                )}
              </button>
              <button
                className={`${s.iconBtn} ${isCartOpen ? s.active : ""}`}
                onClick={toggleCart}
                title="Кошик"
              >
                <Image
                  src="/icons/Prefix-Icon-2.svg"
                  alt=""
                  width={20}
                  height={20}
                  className={s.iconImage}
                />
                {cartCount > 0 && <span className={s.badge}>{cartCount}</span>}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={s.LogoIconContainer}>
              {/* <div className={s.logo}>
                <Link href="/">
                  <div className={s.LogoIcon} suppressHydrationWarning> */}
              <div className={s.logo}>
                <Link href="/">
                  <LogoHeader />
                </Link>
              </div>
              {/* </Link>
              </div> */}
              <div className={s.LogoTextIconBlock}>
                <Link href="/">
                  <div className={s.LogoTextIcon} suppressHydrationWarning>
                    <LogoHeaderText />
                  </div>
                </Link>
              </div>
            </div>
            <div className={s.left}>
              <nav className={s.nav}>
                {mainNavigation.map((item, index) => {
                  const isLastItem = index === mainNavigation.length - 1;
                  // Спеціальна обробка для посилання на воркшопи
                  if (item.href === "/#events") {
                    return (
                      <Fragment key={item.href}>
                        <a
                          href="/#events"
                          onClick={(e) => {
                            // Якщо ми вже на головній сторінці, обробляємо прокрутку вручну
                            if (pathname === "/") {
                              e.preventDefault();
                              const eventsElement =
                                document.getElementById("events");
                              if (eventsElement) {
                                const headerHeight = 120;
                                const targetPosition =
                                  eventsElement.offsetTop - headerHeight;
                                window.scrollTo({
                                  top: Math.max(0, targetPosition),
                                  behavior: "smooth",
                                });
                              } else {
                                // Якщо елемент ще не завантажений, встановлюємо хеш і чекаємо
                                window.location.hash = "events";
                              }
                            } else {
                              // Якщо ми на іншій сторінці, використовуємо window.location
                              // для гарантованого переходу з хешем
                              e.preventDefault();
                              window.location.href = "/#events";
                            }
                          }}
                        >
                          {item.label}
                        </a>
                        {!isLastItem && (
                          <span className={s.navSeparator} aria-hidden="true">
                            <Image
                              src="/icons/Icon-5.svg"
                              alt=""
                              width={14}
                              height={14}
                            />
                          </span>
                        )}
                      </Fragment>
                    );
                  }
                  return (
                    <Fragment key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                      {!isLastItem && (
                        <span className={s.navSeparator} aria-hidden="true">
                          <Image
                            src="/icons/Icon-5.svg"
                            alt=""
                            width={14}
                            height={14}
                          />
                        </span>
                      )}
                    </Fragment>
                  );
                })}
              </nav>
            </div>

            <div className={s.right}>
              <div className={s.phone}>
                <NumberHeader />
                <div className={s.contacts}>
                  <p className={s.contactText}>Ми на зв&apos;язку:</p>
                  <div className={s.phoneWrapper}>
                    <a href="tel:+380954372575" className={s.phoneLink}>
                      +380 95 437 25 75
                    </a>
                  </div>
                </div>
              </div>

              <div className={s.headerActions}>
                <div className={s.icons}>
                  <button
                    className={`${s.iconBtn} ${isFavOpen ? s.active : ""}`}
                    onClick={toggleFav}
                    title="Обране"
                  >
                    <Image
                      src="/icons/prefix-Icon.svg"
                      alt=""
                      width={20}
                      height={20}
                      className={s.iconImage}
                    />
                    {favoriteCount > 0 && (
                      <span className={s.badge}>{favoriteCount}</span>
                    )}
                  </button>
                  <button
                    className={`${s.iconBtn} ${isCartOpen ? s.active : ""}`}
                    onClick={toggleCart}
                    title="Кошик"
                  >
                    <Image
                      src="/icons/Prefix-Icon-2.svg"
                      alt=""
                      width={20}
                      height={20}
                      className={s.iconImage}
                    />
                    {cartCount > 0 && (
                      <span className={s.badge}>{cartCount}</span>
                    )}
                  </button>
                  {isHydrated && isLoggedIn ? (
                    <button
                      className={`${s.iconBtn} ${s.userBtn}`}
                      onClick={handleUserIconClick}
                      title="Особистий кабінет"
                      suppressHydrationWarning
                    >
                      <Image
                        src="/icons/prefix-2.svg"
                        alt="Профіль"
                        width={20}
                        height={20}
                        className={s.iconImage}
                      />
                    </button>
                  ) : (
                    <button
                      className={s.loginBtn}
                      onClick={openLoginModal}
                      title="Увійти"
                      suppressHydrationWarning
                    >
                      Вхід
                    </button>
                  )}
                </div>

                <div className={s.authButtons}>
                  {isHydrated && !isLoggedIn && (
                    <button
                      className={s.register}
                      onClick={() => setIsRegisterOpen(true)}
                    >
                      Реєстрація
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSubmit={handleLoginSuccess}
        onOpenRegister={openRegisterModal}
      />
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        onOpenLogin={() => {
          setIsResetPasswordOpen(false);
          openLoginModal();
        }}
        initialStep="email"
      />
      <CartModal />
      <FavoritesModal />

      {/* Desktop Menu */}
      {isMenuOpen && (
        <div className={s.menuOverlay} onClick={toggleMenu}>
          <div className={s.menuContainer} onClick={(e) => e.stopPropagation()}>
            <div className={s.menuContent}>
              <div className={s.menuHeader}>
                <h5 className={s.menuTitle}>Меню</h5>
                <button className={s.menuClose} onClick={toggleMenu}>
                  <CloseButtonIcon />
                </button>
              </div>

              <div className={s.menuSection}>
                <p className={s.sectionTitle}>B.F.B Напрямок:</p>

                <div className={s.menuItemBlock}>
                  {burgerMenuNavigation.main.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={s.menuLink}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className={s.menuSection}>
                <p className={s.sectionTitle}>Додатково</p>
                <div className={s.menuItemBlock}>
                  {burgerMenuNavigation.additional.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={s.menuLink}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className={s.contactInfoContainer}>
              <div className={s.contactGrid}>
                <div className={s.contactRow}>
                  <div className={s.contactItem}>
                    <h5 className={s.contactLabel}>Телефон</h5>
                    <p className={s.contactValue}>
                      {contactData.phone || "+380 95 437 25 75"}
                    </p>
                  </div>
                  <div className={s.contactItem}>
                    <h5 className={s.contactLabel}>Час роботи у вихідні:</h5>
                    <p className={s.contactValue}>
                      {contactData.weekends || "10:00 - 20:00"}
                    </p>
                  </div>
                </div>

                <div className={s.contactRow}>
                  <div className={s.contactItem}>
                    <h5 className={s.contactLabel}>Email</h5>
                    <p className={s.contactValue}>
                      {contactData.email || "bfb.board.ukraine@gmail.com"}
                    </p>
                  </div>
                  <div className={s.contactItem}>
                    <h5 className={s.contactLabel}>Час роботи у будні:</h5>
                    <p className={s.contactValue}>
                      {contactData.weekdays || "10:00 - 20:00"}
                    </p>
                  </div>
                </div>
              </div>

              <div className={s.addressSection}>
                <h5 className={s.contactLabel}>Адреса головного залу:</h5>
                <p className={s.contactValue}>
                  {contactData.address || "м. Київ, Хрещатик, будинок 23/A"}
                </p>
              </div>

              <div className={s.socialSection}>
                {contactData.socialLinks.length > 0 ? (
                  contactData.socialLinks.map((social, index) => {
                    const iconMap: Record<string, React.ComponentType> = {
                      Instagram: InstagramIcon,
                      Facebook: FacebookIcon,
                      Telegram: TelegramIcon,
                      WhatsApp: WhatsappIcon,
                    };
                    const Icon = iconMap[social.name] || null;
                    if (!Icon) return null;
                    return (
                      <a
                        key={index}
                        href={social.link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.socialIcon}
                      >
                        <Icon />
                      </a>
                    );
                  })
                ) : (
                  <>
                    <a
                      href="https://www.instagram.com/bfb.official_ukraine?igsh=enFybWFmZGE3NG8z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={s.socialIcon}
                    >
                      <InstagramIcon />
                    </a>
                    <div className={s.socialIcon}>
                      <FacebookIcon />
                    </div>
                    <div className={s.socialIcon}>
                      <TelegramIcon />
                    </div>
                    <div className={s.socialIcon}>
                      <WhatsappIcon />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
