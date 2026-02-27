"use client";

import React from "react";
import styles from "./PersonalData.module.css";
import {
  InstagramIcon,
  TelegramIcon,
  EmailIcon,
  LocationIcon,
} from "@/components/Icons/Icons";

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
          <div className={styles.contactItem}>
            <div className={styles.iconCircle}>
              <InstagramIcon />
            </div>
            <div className={styles.contactText}>@secret_garden_dnipro</div>
          </div>

          <div className={styles.contactItem}>
            <div className={styles.iconCircle}>
              <TelegramIcon />
            </div>
            <div className={styles.contactText}>@Secret_Garden_shop420</div>
          </div>
        </div>

        <div className={styles.contactBlock}>
          <div className={styles.contactItem}>
            <div className={styles.iconCircle}>
              <EmailIcon />
            </div>
            <div>
              <div className={styles.contactText}>
                secretgardendp57@gmail.com
              </div>
            </div>
          </div>

          <div className={styles.contactItem}>
            <div className={styles.iconCircle}>
              <LocationIcon />
            </div>
            <div>
              <div className={styles.contactText}>
                Україна, Дніпро, просп. Дмитра Яворницького, 57
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalData;
