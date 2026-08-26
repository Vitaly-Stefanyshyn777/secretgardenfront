"use client";

import Image from "next/image";
import Link from "next/link";
import type { ContentContacts } from "@/lib/contentApi";
import { useTranslation } from "@/hooks/useTranslation";
import { withMapLanguage, localizeDynamicText } from "@/lib/localizedContent";
import s from "./ContactsPageSection.module.css";

type Props = {
  contacts?: ContentContacts | null;
};

const ContactsPageSection = ({ contacts }: Props) => {
  const { t, locale } = useTranslation();

  const fallback: ContentContacts = {
    introTitle: t("contactsPage.introTitle"),
    introText: t("contactsPage.introText"),
    scheduleTitle: t("contactsPage.scheduleTitle"),
    hoursTime: "12:00 - 21:00",
    daysOff: t("contactsPage.daysOff"),
    holidayNote: t("contactsPage.holidayNote"),
    address:
      locale === "en"
        ? "Dnipro, Dmytra Yavornytskoho Ave, 57"
        : "м. Дніпро, Проспект Дмитра Яворницького 57",
    email: "secretgardendp57@gmail.com",
    instagramUrl: "https://www.instagram.com/secret_garden_dnipro",
    instagramLabel: "secret_garden_dnipro",
    telegramUrls: [
      "https://t.me/secret_Garden_shop420",
      "https://t.me/secret_garden_manager",
    ],
    telegramLabels: ["secret_Garden_shop420", "secret_garden_manager"],
    mapSrc:
      "https://www.google.com/maps?q=48.463662,35.046347&z=17&output=embed",
    venuePhotoUrl: "/фото.png",
  };

  const raw = contacts ?? fallback;
  const c = {
    ...raw,
    introTitle: localizeDynamicText(raw.introTitle, locale),
    introText: localizeDynamicText(raw.introText, locale),
    scheduleTitle: localizeDynamicText(raw.scheduleTitle, locale),
    daysOff: localizeDynamicText(raw.daysOff, locale),
    holidayNote: raw.holidayNote
      ? localizeDynamicText(raw.holidayNote, locale)
      : raw.holidayNote,
    address: localizeDynamicText(raw.address, locale),
  };
  const introLines = c.introText.split("\n").filter(Boolean);
  const telegramUrls = Array.isArray(c.telegramUrls) ? c.telegramUrls : [];
  const telegramLabels = Array.isArray(c.telegramLabels)
    ? c.telegramLabels
    : [];

  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.topMainBlock}>
          <div className={s.introBlock}>
            <h2 className={s.introTitle}>{c.introTitle}</h2>
            <p className={s.introText}>
              {introLines.map((line, i) => (
                <span key={i}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
          </div>

          <div className={s.scheduleBlock}>
            <div className={s.hoursGroup}>
              <h2 className={s.scheduleTitle}>{c.scheduleTitle}</h2>
              <p className={s.hoursTime}>{c.hoursTime}</p>
            </div>
            <div className={s.daysGroup}>
              <p className={s.daysOff}>{c.daysOff}</p>
              {c.holidayNote ? (
                <p className={s.holidayNote}>{c.holidayNote}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className={s.bottomMainBlock}>
          <div className={s.mediaRow}>
            <div className={s.mapWrapper}>
              <iframe
                title={t("contactsPage.mapTitle")}
                className={s.mapFrame}
                src={withMapLanguage(c.mapSrc, locale)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className={s.photoWrapper}>
              <Image
                src={c.venuePhotoUrl || "/фото.png"}
                alt={t("contactsPage.photoAlt")}
                fill
                sizes="100vw"
                className={s.photo}
                unoptimized={Boolean(
                  c.venuePhotoUrl?.startsWith("http") ||
                    c.venuePhotoUrl?.startsWith("data:"),
                )}
              />
            </div>
          </div>

          <div className={s.contactsRow}>
            <div className={s.contactsColumn}>
              <div className={s.infoBlock}>
                <h3 className={s.infoTitle}>{t("contactsPage.ourAddress")}</h3>
                <p className={s.infoValue}>{c.address}</p>
              </div>

              <div className={s.infoBlock}>
                <h3 className={s.infoTitle}>Instagram:</h3>
                <Link
                  href={c.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.infoLink}
                >
                  {c.instagramLabel || c.instagramUrl}
                </Link>
              </div>
            </div>

            <div className={s.contactsColumn}>
              <div className={s.infoBlock}>
                <h3 className={s.infoTitle}>Email:</h3>
                <Link href={`mailto:${c.email}`} className={s.infoLink}>
                  {c.email}
                </Link>
              </div>

              <div className={s.infoBlock}>
                <h3 className={s.infoTitle}>Telegram:</h3>
                <div className={s.telegramLinks}>
                  {telegramUrls.map((url, i) => (
                    <Link
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={s.infoLink}
                    >
                      {telegramLabels[i] || url}
                    </Link>
                  ))}
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
