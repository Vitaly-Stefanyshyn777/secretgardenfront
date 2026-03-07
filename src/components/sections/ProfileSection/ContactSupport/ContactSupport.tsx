"use client";

import React from "react";
import styles from "./ContactSupport.module.css";
import ContactHeader from "./ContactHeader";
import ContactInfoBlock from "./ContactInfoBlock";
import WorkingHoursBlock from "./WorkingHoursBlock";
import SocialIconsBlock from "./SocialIconsBlock";
import MapBlock from "./MapBlock";

const DEFAULT_PHONE = "+380 00 000 00 00";
const DEFAULT_EMAIL = "support@example.com";
const DEFAULT_WEEKDAYS = "Пн–Пт: 9:00–18:00";
const DEFAULT_WEEKENDS = "Сб–Нд: 10:00–16:00";
const DEFAULT_ADDRESS = "Україна, м. Київ";
const DEFAULT_MAP_URL = "https://www.google.com/maps";

const DEFAULT_LINKS = [
  { name: "Instagram", url: "https://instagram.com" },
  { name: "Facebook", url: "https://facebook.com" },
  { name: "Telegram", url: "https://t.me" },
  { name: "WhatsApp", url: "https://wa.me" },
];

export default function ContactSupport() {
  const handleSocialClick = (url: string) => {
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={styles.contactSupport}>
      <ContactHeader title="Зв'язатися з нами" />
      <div className={styles.subtitleBlock}>
        <h3 className={styles.subtitleTitle}>Маєте питання? Ми на зв'язку!</h3>
        <p className={styles.subtitleText}>
          Ми з радістю допоможемо з вибором товарів, замовленням або доставкою
        </p>
      </div>
      <div className={styles.blocksRow}>
        <div className={styles.contactBlock}>
          <ContactInfoBlock phone={DEFAULT_PHONE} email={DEFAULT_EMAIL} />
          <WorkingHoursBlock
            weekdays={DEFAULT_WEEKDAYS}
            weekends={DEFAULT_WEEKENDS}
            address={DEFAULT_ADDRESS}
          />
        </div>
        <div className={styles.contactBlock}>
          <SocialIconsBlock onClick={handleSocialClick} links={DEFAULT_LINKS} />
          <MapBlock mapUrl={DEFAULT_MAP_URL} />
        </div>
      </div>
    </div>
  );
}
