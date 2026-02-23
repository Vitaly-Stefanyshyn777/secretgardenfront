"use client";

import LoginModal from "@/components/auth/LoginModal/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal/RegisterModal";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal/ResetPasswordModal";
import { useThemeSettingsQuery } from "@/components/hooks/useWpQueries";
import { getContactData } from "@/lib/themeSettingsUtils";
import { useAuthStore } from "@/store/auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  ApplePayIcon,
  FacebookIcon,
  GooglePayIcon,
  InstagramIcon,
  LogoHeader,
  MastercardIcon,
  MonoPayIcon,
  PrivateIcon,
  TelegramIcon,
  VisardIcon,
  WhatsappIcon,
} from "../../Icons/Icons";
import s from "./Footer.module.css";

const Footer = () => {
  const pathname = usePathname();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const openRegisterModal = () => setIsRegisterOpen(true);
  const openResetPasswordModal = () => {
    // Невелика затримка щоб уникнути конфлікту з закриттям попередньої модалки
    setTimeout(() => setIsResetPasswordOpen(true), 100);
  };

  // Отримуємо контактні дані з theme_settings
  const { data: themeSettings } = useThemeSettingsQuery();
  const contactData = useMemo(
    () => getContactData(themeSettings),
    [themeSettings]
  );

  // Не показуємо футер на сторінках order-success та checkout
  if (pathname === "/order-success" || pathname === "/checkout") {
    return null;
  }

  return (
    <footer className={s.footer}>
      <div className={s.logoContainer}>
        <div className={s.logo}>
          <div className={s.brandLinkContainer}>
            <div className={s.logoIcon}>
              <LogoHeader />
            </div>
            <div className={s.brandNameContainer}>
              <Image
                src="/images/Frame-1321318176.svg"
                alt="B.F.B Fitness"
                width={166}
                height={25}
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
        {!isLoggedIn && (
          <div className={s.authButtons}>
            <button className={s.loginButton} onClick={openLoginModal}>
              Вхід
            </button>
            <button
              className={s.registerButton}
              onClick={() => setIsRegisterOpen(true)}
            >
              Реєстрація
            </button>
          </div>
        )}
      </div>
      <div className={s.footerTop}>
        <div className={s.divider}></div>

        {/* Основний контент футера */}
        <div className={s.footerMain}>
          {/* Контакти */}
          <div className={s.contactsContainer}>
            <div className={s.contactsSection}>
              <h3 className={s.sectionTitle}>КОНТАКТИ:</h3>
              <div className={s.contactInfo}>
                {contactData.phone && (
                  <a
                    href={`tel:${contactData.phone.replace(/\s/g, "")}`}
                    className={`${s.contactLink} ${s.phoneLink}`}
                  >
                    {contactData.phone}
                  </a>
                )}
                {contactData.email && (
                  <a
                    href={`mailto:${contactData.email}`}
                    className={`${s.contactLink} ${s.mailLink}`}
                  >
                    {contactData.email}
                  </a>
                )}
              </div>
              <div className={s.socialIcons}>
                {contactData.socialLinks.length > 0 ? (
                  <>
                    {contactData.socialLinks.map((social, index) => {
                      const iconMap: Record<
                        string,
                        React.ComponentType<{ className?: string }>
                      > = {
                        Instagram: InstagramIcon,
                        Facebook: FacebookIcon,
                        Telegram: TelegramIcon,
                        WhatsApp: WhatsappIcon,
                      };
                      const Icon = iconMap[social.name] || null;
                      if (!Icon) return null;
                      return social.link ? (
                        <a
                          key={index}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={s.iconButton}
                        >
                          <Icon />
                        </a>
                      ) : (
                        <button key={index} className={s.iconButton}>
                          <Icon />
                        </button>
                      );
                    })}
                    {contactData.phone && (
                      <a
                        href={`https://wa.me/${contactData.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.iconButton}
                      >
                        <WhatsappIcon />
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <a
                      href="https://www.instagram.com/bfb.official_ukraine?igsh=enFybWFmZGE3NG8z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={s.iconButton}
                    >
                      <InstagramIcon />
                    </a>
                    <button className={s.iconButton}>
                      <FacebookIcon />
                    </button>
                    <button className={s.iconButton}>
                      <TelegramIcon />
                    </button>
                    {contactData.phone ? (
                      <a
                        href={`https://wa.me/${contactData.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.iconButton}
                      >
                        <WhatsappIcon />
                      </a>
                    ) : (
                      <button className={s.iconButton}>
                        <WhatsappIcon />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Адреса */}
            <div className={s.addressSection}>
              <h3 className={s.sectionTitle}>АДРЕСА:</h3>
              <address className={s.address}>
                {contactData.address && (
                  <p className={s.addressText}>{contactData.address}</p>
                )}
                {contactData.schedule ? (
                  // Розбиваємо розклад по \r\n і виводимо кожен рядок
                  contactData.schedule
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, idx) => (
                      <p key={idx} className={s.scheduleItem}>
                        {line.replace(/,\s*$/, "")}
                      </p>
                    ))
                ) : (contactData.weekdays || contactData.weekends) ? (
                  <>
                    {contactData.weekdays && (
                      <p className={s.scheduleItem}>
                        понеділок - п&apos;ятниця: {contactData.weekdays}
                      </p>
                    )}
                    {contactData.weekends && (
                      <p className={s.scheduleItem}>
                        субота - неділя: {contactData.weekends}
                      </p>
                    )}
                  </>
                ) : null}
              </address>
            </div>
          </div>

          {/* Навігація */}
          <div className={s.navigationSections}>
            <div className={s.navSection}>
              <h3 className={s.sectionTitle}>ПРО ПЛАТФОРМУ</h3>
              <ul className={s.navList}>
                <li className={s.navItem}>
                  <Link href="/" className={s.navLink}>
                    Головна
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/about-bfb" className={s.navLink}>
                    Про BFB
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/courses-landing" className={s.navLink}>
                    Про Інструкторство
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/contacts" className={s.navLink}>
                    Контакти
                  </Link>
                </li>
              </ul>
            </div>

            <div className={s.navSection}>
              <h3 className={s.sectionTitle}>ПОСЛУГИ & ТОВАРИ</h3>
              <ul className={s.navList}>
                <li className={s.navItem}>
                  <Link href="/trainers" className={s.navLink}>
                    Каталог тренерів
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/products" className={s.navLink}>
                    Каталог товарів
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/courses" className={s.navLink}>
                    Воркшопи
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/our-courses" className={s.navLink}>
                    Навчальні програми
                  </Link>
                </li>
              </ul>
            </div>

            <div className={s.navSection}>
              <h3 className={s.sectionTitle}>ДОКУМЕНТАЦІЯ</h3>
              <ul className={s.navList}>
                <li className={s.navItem}>
                  <Link href="/privacy-policy" className={s.navLink}>
                    Політика конфіденційності
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/oferta" className={s.navLink}>
                    Умови співпраці
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/refunds" className={s.navLink}>
                    Умови повернення, обміну та оплати
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={s.divider}></div>

      {/* Нижня частина футера */}
      <div className={s.footerBottom}>
        <div>
          <p className={s.copyright}>©2024 BFB. All Rights Reserved.</p>
        </div>
        <div className={s.paymentMethods}>
          <a
            href="https://www.privat24.ua/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <PrivateIcon />
          </a>
          <a
            href="https://www.apple.com/apple-pay/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <ApplePayIcon />
          </a>
          <a
            href="https://pay.google.com/about/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <GooglePayIcon />
          </a>
          <a
            href="https://www.visa.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <VisardIcon />
          </a>
          <a
            href="https://www.mastercard.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <MastercardIcon />
          </a>
          <a
            href="https://www.monobank.ua/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <MonoPayIcon />
          </a>
        </div>

        <p className={s.credits}>
          Сайт розроблено агентством:{" "}
          <a
            href="https://before-after.agency/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.creditsLink}
          >
            Before/After
          </a>
        </p>
      </div>
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onOpenRegister={openRegisterModal}
        onOpenResetPassword={openResetPasswordModal}
      />
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        onOpenLogin={openLoginModal}
      />
    </footer>
  );
};

export default Footer;
