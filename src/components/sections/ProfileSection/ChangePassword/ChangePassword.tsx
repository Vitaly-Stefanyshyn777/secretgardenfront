"use client";
import React, { useState, useEffect } from "react";
import styles from "./ChangePassword.module.css";
import SectionDivider from "../SectionDivider/SectionDivider";

import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/auth";
import PasswordField from "@/components/ui/FormFields/PasswordField";
import { PasswordsIcon } from "@/components/Icons/Icons";
import SubmitButton from "@/components/ui/SubmitButton/SubmitButton";
import { toast } from "react-toastify";

const ChangePassword: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [isMobile, setIsMobile] = useState(false);

  type FormValues = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formValues = watch();
  const isFormFilled = !!(
    formValues.currentPassword &&
    formValues.newPassword &&
    formValues.confirmPassword
  );

  const onSubmit = handleSubmit(async (values) => {
    // Чекаємо на гідратацію перед перевіркою
    if (!isHydrated) return;

    if (!token) {
      toast.error("Потрібна авторизація для зміни пароля");
      return;
    }

    if (
      !values.currentPassword ||
      !values.newPassword ||
      !values.confirmPassword
    ) {
      toast.error("Заповніть усі поля форми");
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      toast.error("Нові паролі не співпадають");
      return;
    }
    if (values.newPassword.length < 8) {
      toast.error("Новий пароль має містити щонайменше 8 символів");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"}/api/user/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (!res.ok) {
        let message = "Не вдалося змінити пароль. Спробуйте ще раз.";
        try {
          const data = (await res.json()) as { message?: string; error?: string };
          if (data.message) message = data.message;
          else if (data.error) message = data.error;
        } catch {
          // ignore parse errors
        }
        toast.error(message);
        return;
      }

      toast.success("Пароль успішно змінено");
      reset();
    } catch {
      toast.error("Не вдалося змінити пароль. Спробуйте ще раз.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Зміна пароля</h1>
      </div>

      <SectionDivider />

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.inputGroup}>
          <PasswordField
            icon={<PasswordsIcon />}
            label="Поточний пароль"
            hasError={false}
            supportingText="Введіть поточний пароль"
            // inputStyle={{ backgroundColor: isMobile ? '#fff' : '#f9f9f9', borderColor: isMobile ? '#fff' : '#f9f9f9' }}
            eyeBtnClassName={isMobile ? styles.eyeBtnMobile : ""}
            {...register("currentPassword", { required: true })}
            autoComplete="current-password"
          />
        </div>

        <div className={styles.inputGroup}>
          <PasswordField
            icon={<PasswordsIcon />}
            label="Введіть новий пароль"
            hasError={false}
            supportingText="Новий пароль має містити щонайменше 8 символів та відрізнятися від поточного"
            // inputStyle={{
            //   backgroundColor: isMobile ? "#fff" : "#f9f9f9",
            //   borderColor: isMobile ? "#fff" : "#f9f9f9",
            // }}
            eyeBtnClassName={isMobile ? styles.eyeBtnMobile : ""}
            {...register("newPassword", { required: true, minLength: 8 })}
            autoComplete="new-password"
          />
        </div>

        <div className={styles.inputGroup}>
          <PasswordField
            icon={<PasswordsIcon />}
            label="Підтвердіть новий пароль"
            hasError={false}
            supportingText="Повторіть новий пароль без помилок"
            // inputStyle={{
            //   backgroundColor: isMobile ? "#fff" : "#f9f9f9",
            //   borderColor: isMobile ? "#fff" : "#f9f9f9",
            // }}
            eyeBtnClassName={isMobile ? styles.eyeBtnMobile : ""}
            {...register("confirmPassword", { required: true, minLength: 8 })}
            autoComplete="new-password"
          />
        </div>

        <SubmitButton
          className={styles.submitBtn}
          isSubmitting={submitting}
          isFormFilled={isFormFilled}
        >
          Змінити пароль
        </SubmitButton>
      </form>
    </div>
  );
};

export default ChangePassword;
