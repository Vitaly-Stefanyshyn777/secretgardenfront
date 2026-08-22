"use client";

import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { EmailIcon, CloseButtonIcon } from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./ResetPasswordModal.module.css";

export interface ResetPasswordEmailFormValues {
  email: string;
}

interface ResetPasswordEmailFormProps {
  form: {
    register: UseFormRegister<ResetPasswordEmailFormValues>;
    handleSubmit: UseFormHandleSubmit<ResetPasswordEmailFormValues>;
    formState: {
      errors: FieldErrors<ResetPasswordEmailFormValues>;
      isSubmitting: boolean;
    };
  };
  onSubmit: (data: ResetPasswordEmailFormValues) => Promise<void>;
  onBackToLogin: () => void;
  onClose: () => void;
}

export default function ResetPasswordEmailForm({
  form: {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  },
  onSubmit,
  onBackToLogin,
  onClose,
}: ResetPasswordEmailFormProps) {
  const { t } = useTranslation();

  return (
    <>
      <button className={s.close} onClick={onClose}>
        <CloseButtonIcon />
      </button>

      <div className={s.headerBlock}>
        <div className={s.header}>
          <h2 className={s.headerTitle}>{t("auth.resetPassword")}</h2>
        </div>
      </div>

      <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={s.inputGroup}>
          <InputField
            icon={<EmailIcon />}
            label={t("auth.email")}
            type="email"
            hasError={!!errors.email}
            supportingText={(errors.email?.message as string) || ""}
            labelClassName={s.inputLabel}
            inputBlockClassName={s.inputBlock}
            {...register("email", {
              required: t("auth.enterEmail"),
              pattern: {
                value: /^\S+@\S+$/i,
                message: t("auth.enterValidEmail"),
              },
            })}
          />
        </div>

        <div className={s.actionsBlock}>
          <button className={s.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.sendingEmail") : t("auth.send")}
          </button>

          <button
            type="button"
            className={s.backButton}
            onClick={onBackToLogin}
          >
            {t("auth.backToAuth")}{" "}
            <span className={s.authLink}>{t("auth.authorization")}</span>
          </button>
        </div>
      </form>
    </>
  );
}
