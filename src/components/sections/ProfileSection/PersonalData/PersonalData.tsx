"use client";

import React from "react";
import styles from "./PersonalData.module.css";
import {
  InstagramIcon,
  TelegramIcon,
  EmailIcon,
  LocationIcon,
} from "@/components/Icons/Icons";

const CONTACT_ITEMS = [
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
    label: "Україна, Дніпро, просп. Дмитра Яворницького, 57",
    Icon: LocationIcon,
  },
] as const;

const PersonalData: React.FC = () => {
  return (
    <div className={styles.personalData}>
      <div className={styles.header}>
        <h2 className={styles.title}>Зв’язатися з нами</h2>
        <div className={styles.subtitleBlock}>
          <h3 className={styles.subtitleTitle}>
            Маєте питання? Ми на зв’язку!
          </h3>
          <p className={styles.subtitleText}>
            Ми з радістю допоможемо з вибором товарів, замовленням або доставкою
          </p>
        </div>
      </div>

      <div className={styles.contactBlocksRow}>
        <div className={styles.contactBlock}>
          {CONTACT_ITEMS.slice(0, 2).map(({ key, href, label, Icon }) => (
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
          {CONTACT_ITEMS.slice(2).map(({ key, href, label, Icon }) => (
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
