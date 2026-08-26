"use client";

import React from "react";
import styles from "./PersonalData.module.css";
import {
  InstagramIcon,
  TelegramIcon,
  EmailIcon,
  LocationIcon,
} from "@/components/Icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";

const PersonalData: React.FC = () => {
  const { t } = useTranslation();

  const contactItems = [
    {
      key: "instagram",
      href: "https://www.instagram.com/secret_garden_dnipro",
      label: "@secret_garden_dnipro",
      Icon: InstagramIcon,
    },
    {
      key: "telegram",
      href: "https://t.me/Secret_Garden_shop420",
      label: "@Secret_Garden_shop420",
      Icon: TelegramIcon,
    },
    {
      key: "email",
      href: "mailto:secretgardendp57@gmail.com",
      label: "secretgardendp57@gmail.com",
      Icon: EmailIcon,
    },
    {
      key: "location",
      href: "https://maps.app.goo.gl/KSiWwNZVxFtByCw36",
      label: t("profile.contactAddress"),
      Icon: LocationIcon,
    },
  ] as const;

  return (
    <div className={styles.personalData}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t("profile.contactTitle")}</h2>
        <div className={styles.subtitleBlock}>
          <h3 className={styles.subtitleTitle}>{t("profile.contactSubtitle")}</h3>
          <p className={styles.subtitleText}>{t("profile.contactText")}</p>
        </div>
      </div>

      <div className={styles.contactBlocksRow}>
        <div className={styles.contactBlock}>
          {contactItems.slice(0, 2).map(({ key, href, label, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactItem}
            >
              <div className={styles.iconCircle}>
                <Icon />
              </div>
              <div className={styles.contactText}>{label}</div>
            </a>
          ))}
        </div>

        <div className={styles.contactBlock}>
          {contactItems.slice(2).map(({ key, href, label, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactItem}
            >
              <div className={styles.iconCircle}>
                <Icon />
              </div>
              <div className={styles.contactText}>{label}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalData;
