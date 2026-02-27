"use client";

import React, { useEffect, useState } from "react";
import styles from "./TrainerProfile.module.css";
import InputField from "@/components/ui/FormFields/InputField";
import {
  UserIcon,
  NumberIcon,
  EmailIcon,
  InstagramIcon,
  TelegramIcon,
} from "@/components/Icons/Icons";
import {
  useUserProfileQuery,
  useUpdateUserProfile,
  type WpUserMe,
} from "@/components/hooks/useUserProfileQuery";

const TrainerProfile: React.FC = () => {
  const { data: profile } = useUserProfileQuery();
  const { mutateAsync: updateUser, isPending } = useUpdateUserProfile();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    instagram: "",
    telegram: "",
  });

  useEffect(() => {
    if (!profile) return;
    const user = profile as WpUserMe;
    const meta = user.meta || {};

    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone:
        user.social_phone ||
        meta.input_text_social_phone ||
        meta.social_phone ||
        "",
      email: (user.email || user.user_email || "") ?? "",
      instagram:
        user.social_instagram ||
        meta.input_text_social_instagram ||
        meta.social_instagram ||
        "",
      telegram:
        user.social_telegram ||
        meta.input_text_social_telegram ||
        meta.social_telegram ||
        "",
    });
  }, [profile]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    const user = profile as WpUserMe;
    const currentMeta = user.meta || {};

    const nextMeta: Record<string, unknown> = {
      ...currentMeta,
      input_text_social_phone: form.phone.trim(),
      input_text_social_instagram: form.instagram.trim(),
      input_text_social_telegram: form.telegram.trim(),
    };

    await updateUser({
      id: user.id as number | string,
      body: {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        meta: nextMeta,
      },
    });
  };

  const handleReset = () => {
    if (!profile) return;
    const user = profile as WpUserMe;
    const meta = user.meta || {};

    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone:
        user.social_phone ||
        meta.input_text_social_phone ||
        meta.social_phone ||
        "",
      email: (user.email || user.user_email || "") ?? "",
      instagram:
        user.social_instagram ||
        meta.input_text_social_instagram ||
        meta.social_instagram ||
        "",
      telegram:
        user.social_telegram ||
        meta.input_text_social_telegram ||
        meta.social_telegram ||
        "",
    });
  };

  return (
    <div className={styles.trainerProfile}>
      <div className={styles.header}>
        <h2 className={styles.title}>Особисті дані</h2>
      </div>

      <div className={styles.form}>
        <div className={styles.section}>
          <div className={styles.inputGroup}>
            <InputField
              icon={<UserIcon />}
              label="Ім'я"
              type="text"
              id="trainer-first-name"
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            <InputField
              icon={<UserIcon />}
              label="Прізвище"
              type="text"
              id="trainer-last-name"
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <InputField
              icon={<NumberIcon />}
              label="Номер телефону"
              type="tel"
              id="trainer-phone"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <InputField
              icon={<EmailIcon />}
              label="Email"
              type="email"
              id="trainer-email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <InputField
              icon={<InstagramIcon />}
              label="Нікнейм Instagram"
              type="text"
              id="trainer-instagram"
              value={form.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
            />
            <InputField
              icon={<TelegramIcon />}
              label="Нікнейм Telegram"
              type="text"
              id="trainer-telegram"
              value={form.telegram}
              onChange={(e) => handleChange("telegram", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.bottomActions}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={isPending}
          >
            Зберегти дані
          </button>
          <button
            className={styles.clearBtn}
            type="button"
            onClick={handleReset}
            disabled={isPending}
          >
            Стерти всю інформацію
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;
