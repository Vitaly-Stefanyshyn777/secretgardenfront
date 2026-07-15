"use client";

import Image from "next/image";
import Link from "next/link";
import s from "./ContactsPageSection.module.css";

const ContactsPageSection = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.topMainBlock}>
          <div className={s.topInnerBlock}>
            <h2 className={s.mainTitle}>Ми завжди на зв&apos;язку</h2>
            <p className={s.topText}>
              підкажемо, допоможемо з вибором і зорієнтуємо в асортименті.
              <br />
              Також будемо раді бачити вас у нашому просторі за чашкою кави та в
              атмосфері спокою.
            </p>
          </div>

          <div className={s.topInnerBlock}>
            <h2 className={s.mainTitleTwo}>Графік роботи</h2>
            <p className={s.scheduleTime}>12:00 - 21:00</p>
            <p className={s.scheduleText}>Без вихідних</p>
            <p className={s.scheduleHint}>
              В святкові дні години роботи можуть змінюватися
            </p>
          </div>
        </div>

        <div className={s.bottomMainBlock}>
          <div className={s.mediaRow}>
            <div className={s.mapWrapper}>
              <iframe
                title="Мапа Secret Garden"
                className={s.mapFrame}
                src="https://www.google.com/maps?q=48.4647,35.0462&z=17&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className={s.photoWrapper}>
              <Image
                src="/фото.png"
                alt="Secret Garden, Дніпро"
                fill
                sizes="100vw"
                className={s.photo}
              />
            </div>
          </div>

          <div className={s.contactsRow}>
            <div className={s.contactsColumn}>
              <div className={s.infoBlock}>
                <h3 className={s.infoTitle}>Наша адреса:</h3>
                <p className={s.infoValue}>
                  м. Дніпро, Проспект Дмитра Яворницького 57
                </p>
              </div>

              <div className={s.infoBlock}>
                <h3 className={s.infoTitle}>Instagram:</h3>
                <Link
                  href="https://www.instagram.com/secret_garden_dnipro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.infoLink}
                >
                  secret_garden_dnipro
                </Link>
              </div>
            </div>

            <div className={s.contactsColumn}>
              <div className={s.infoBlock}>
                <h3 className={s.infoTitle}>Ел-пошта:</h3>
                <Link
                  href="mailto:secretgardendp57@gmail.com"
                  className={s.infoLink}
                >
                  secretgardendp57@gmail.com
                </Link>
              </div>

              <div className={s.infoBlock}>
                <h3 className={s.infoTitle}>Telegram:</h3>
                <div className={s.telegramLinks}>
                  <Link
                    href="https://t.me/secret_Garden_shop420"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.infoLink}
                  >
                    secret_Garden_shop420
                  </Link>
                  <Link
                    href="https://t.me/secret_garden_manager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.infoLink}
                  >
                    secret_garden_manager
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactsPageSection;
