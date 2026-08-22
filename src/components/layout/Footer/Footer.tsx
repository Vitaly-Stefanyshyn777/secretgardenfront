"use client";

import LoginModal from "@/components/auth/LoginModal/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal/RegisterModal";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal/ResetPasswordModal";
import { useAuthStore } from "@/store/auth";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { useState } from "react";
import {
  EmailIcon,
  InstagramIcon,
  LocationIcon,
  LogoHeader,
  TelegramIcon,
} from "../../Icons/Icons";
import s from "./Footer.module.css";

const Footer = () => {
  const { t } = useTranslation();
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

  return (
    <footer className={s.footer}>
      <div className={s.footerMain}>
        <div className={s.footerLeft}>
          <div className={s.footerLeftMain}>
            <div className={s.logoRightsBlock}>
              <div className={s.logoIconLarge}>
                <LogoHeader />
              </div>
              <p className={s.copyrightText}>{t("footer.copyright")}</p>
            </div>
          </div>
        </div>

        <div className={s.footerRight}>
          <nav className={s.quickLinks}>
            <Link href="/products" className={s.quickLink}>
              {t("nav.shop")}
            </Link>
            <Link href="/about" className={s.quickLink}>
              {t("nav.about")}
            </Link>
            <Link href="/contacts" className={s.quickLink}>
              {t("nav.contacts")}
            </Link>
          </nav>
          <div className={s.footerContacts}>
          <h3 className={s.findTitle}>{t("footer.findUs")}</h3>
          <div className={s.findList}>
            <a
              href="https://www.instagram.com/secret_garden_dnipro"
              target="_blank"
              rel="noopener noreferrer"
              className={s.findItem}
            >
              <span className={s.findIcon}>
                <InstagramIcon />
              </span>
              <span>secret_garden_dnipro</span>
            </a>
            <a
              href="https://t.me/Secret_Garden_shop420"
              target="_blank"
              rel="noopener noreferrer"
              className={s.findItem}
            >
              <span className={s.findIcon}>
                <TelegramIcon />
              </span>
              <span>Secret_Garden_shop420</span>
            </a>
            <a href="mailto:secretgardendp57@gmail.com" className={s.findItem}>
              <span className={s.mailIcon}>
                {" "}
                <EmailIcon />
              </span>
              <span>secretgardendp57@gmail.com</span>
            </a>
            <div className={s.findItem}>
              <span className={s.findIcon}>
                <LocationIcon />
              </span>
              <span>{t("footer.address")}</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
