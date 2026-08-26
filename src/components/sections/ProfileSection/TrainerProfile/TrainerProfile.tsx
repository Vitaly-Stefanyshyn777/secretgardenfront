"use client";

import React, { useEffect, useState } from "react";
import styles from "./TrainerProfile.module.css";
import InputField from "@/components/ui/FormFields/InputField";
import {
  UserIcon,
  NumberIcon,
  EmailIcon,
  EmailTwoIcon,
  InstagramIcon,
  TelegramIcon,
} from "@/components/Icons/Icons";
import TrainerProfileSkeleton from "./TrainerProfileSkeleton";
import { useTranslation } from "@/hooks/useTranslation";

type ApiUser = {
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  telegram?: string;
};

const TrainerProfile: React.FC = () => {
  const { t, locale } = useTranslation();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    instagram: "",
    telegram: "",
  });

  const [initialUser, setInitialUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (typeof window === "undefined") return;
      const token = window.localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/user/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.status === 401) {
          return;
        }

        if (!res.ok) {
          throw new Error("Не вдалося завантажити профіль");
        }

        const user: ApiUser = await res.json();
        setInitialUser(user);
        setForm({
          first_name: user.firstname || "",
          last_name: user.lastname || "",
          phone: user.phone || "",
          email: user.email || "",
          instagram: user.instagram || "",
          telegram: user.telegram || "",
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    console.log("TrainerProfile: handleSave clicked");
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("accessToken");
    console.log("TrainerProfile: accessToken =", token);

    const trimmed = {
      firstname: form.first_name.trim(),
      lastname: form.last_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      instagram: form.instagram.trim(),
      telegram: form.telegram.trim(),
    };

    // Відправляємо всі поля завжди, щоб бекенд гарантовано отримував актуальні дані
    const body: ApiUser = {
      firstname: trimmed.firstname || undefined,
      lastname: trimmed.lastname || undefined,
      phone: trimmed.phone || undefined,
      email: trimmed.email || undefined,
      instagram: trimmed.instagram || undefined,
      telegram: trimmed.telegram || undefined,
    };

    try {
      setIsSaving(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/user/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Помилка збереження профілю", err);
        throw new Error("Не вдалося зберегти дані");
      }

      const updated: ApiUser = await res.json();
      setInitialUser(updated);
      setForm({
        first_name: updated.firstname || trimmed.firstname,
        last_name: updated.lastname || trimmed.lastname,
        phone: updated.phone || trimmed.phone,
        email: updated.email || trimmed.email,
        instagram: updated.instagram || trimmed.instagram,
        telegram: updated.telegram || trimmed.telegram,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!initialUser) return;
    setForm({
      first_name: initialUser.firstname || "",
      last_name: initialUser.lastname || "",
      phone: initialUser.phone || "",
      email: initialUser.email || "",
      instagram: initialUser.instagram || "",
      telegram: initialUser.telegram || "",
    });
  };

  if (isLoading) {
    return <TrainerProfileSkeleton />;
  }

  return (
    <div className={styles.trainerProfile}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t("profile.personalDataTitle")}</h2>
      </div>

      <div className={styles.form}>
        <div className={styles.section}>
          <div className={styles.inputGroup}>
            <InputField
              icon={<UserIcon />}
              label={t("profile.firstName")}
              type="text"
              id="trainer-first-name"
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            <InputField
              icon={<UserIcon />}
              label={t("profile.lastName")}
              type="text"
              id="trainer-last-name"
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <InputField
              icon={<NumberIcon />}
              label={t("profile.phoneNumber")}
              type="tel"
              id="trainer-phone"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <InputField
              icon={<EmailTwoIcon />}
              label={t("profile.emailLabel")}
              type="email"
              id="trainer-email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <InputField
              icon={<InstagramIcon />}
              label={locale === "en" ? "Instagram username" : "Нікнейм Instagram"}
              type="text"
              id="trainer-instagram"
              value={form.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
            />
            <InputField
              icon={<TelegramIcon />}
              label={locale === "en" ? "Telegram username" : "Нікнейм Telegram"}
              type="text"
              id="trainer-telegram"
              value={form.telegram}
              onChange={(e) => handleChange("telegram", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.bottomActions}>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {t("profile.saveData")}
          </button>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleReset}
            disabled={isSaving || isLoading}
          >
            {t("profile.clearAllInfo")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;
