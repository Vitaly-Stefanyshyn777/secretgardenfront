"use client";

import { useThemeSettingsQuery } from "@/components/hooks/useWpQueries";
import { getContactData } from "@/lib/themeSettingsUtils";
import Link from "next/link";
import { useMemo } from "react";
import {
  ApplePayIcon,
  FacebookIcon,
  GooglePayIcon,
  InstagramIcon,
  MonoPayIcon,
  PrivateIcon,
  TelegramIcon,
  VisardIcon,
  WhatsappIcon,
} from "../../Icons/Icons";
import s from "./CheckoutFooter.module.css";

export default function CheckoutFooter() {
  // Отримуємо контактні дані з theme_settings
  const { data: themeSettings } = useThemeSettingsQuery();
  const contactData = useMemo(
    () => getContactData(themeSettings),
    [themeSettings]
  );

  // Розбираємо розклад на частини (розділений \r\n або комою)
  const scheduleParts = useMemo(() => {
    if (!contactData.schedule) return { weekdays: "", weekends: "" };
    
    // Розділяємо по \r\n або комі
    const parts = contactData.schedule
      .split(/\r?\n|,\s*/)
      .map((p) => p.trim())
      .filter(Boolean);
    
    // Знаходимо будні та вихідні
    let weekdays = "";
    let weekends = "";
    
    parts.forEach((part) => {
      const lowerPart = part.toLowerCase();
      if (
        lowerPart.includes("понеділок") ||
        lowerPart.includes("п'ятниця") ||
        lowerPart.includes("пятниця") ||
        lowerPart.includes("будні")
      ) {
        weekdays = part.replace(/^[^:]+:\s*/, ""); // Видаляємо "понеділок - п'ятниця: "
      } else if (
        lowerPart.includes("субота") ||
        lowerPart.includes("неділя") ||
        lowerPart.includes("вихідні")
      ) {
        weekends = part.replace(/^[^:]+:\s*/, ""); // Видаляємо "субота - неділя: "
      }
    });
    
    return { weekdays, weekends };
  }, [contactData.schedule]);

  // Отримуємо посилання на соціальні мережі
  const getSocialLink = (name: string): string => {
    const social = contactData.socialLinks.find(
      (link) => link.name.toLowerCase() === name.toLowerCase()
    );
    return social?.link || "";
  };
  return (
    <footer className={s.footer}>
      <div className={s.footerContent}>
        {/* Контакти */}
        <div className={s.contactsBlock}>
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
              {getSocialLink("Instagram") && (
                <a
                  href={getSocialLink("Instagram")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.iconButton}
                >
                  <InstagramIcon />
                </a>
              )}
              {getSocialLink("Facebook") && (
                <a
                  href={getSocialLink("Facebook")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.iconButton}
                >
                  <FacebookIcon />
                </a>
              )}
              {getSocialLink("Telegram") && (
                <a
                  href={getSocialLink("Telegram")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.iconButton}
                >
                  <TelegramIcon />
                </a>
              )}
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
            </div>
          </div>

          {/* Адреса */}
          <div className={s.addressSection}>
            <h3 className={s.sectionTitle}>АДРЕСА:</h3>
            <address className={s.address}>
              {contactData.address && (
                <p className={s.addressText}>{contactData.address}</p>
              )}
              {(scheduleParts.weekdays || scheduleParts.weekends) && (
                <div className={s.scheduleItemsBlock}>
                  {scheduleParts.weekdays && (
                    <p className={s.scheduleItem}>
                      {scheduleParts.weekdays}
                      {scheduleParts.weekends && ","}
                    </p>
                  )}
                  {scheduleParts.weekends && (
                    <p className={s.scheduleItem}>{scheduleParts.weekends}</p>
                  )}
                </div>
              )}
            </address>
          </div>
        </div>

        {/* Документація */}
        <div className={s.documentationSection}>
          <h3 className={s.sectionTitle}>ДОКУМЕНТАЦІЯ</h3>
          <ul className={s.list}>
            <li>
              <Link href="/privacy-policy" className={s.listLink}>
                Політика конфіденційності
              </Link>
            </li>
            <li>
              <Link href="/terms" className={s.listLink}>
                Умови співпраці
              </Link>
            </li>
            <li>
              <Link href="/return" className={s.listLink}>
                Умови повернення, обміну та оплати
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={s.divider}></div>

      {/* Нижня частина футера */}
      <div className={s.footerBottom}>
        <p className={s.copyright}>©2024 bfb. All Rights Reserved.</p>
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
            href="https://www.monobank.ua/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <MonoPayIcon />
          </a>
        </div>
        <p className={s.credits}>
          Сайт розроблено агенством{" "}
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
    </footer>
  );
}
