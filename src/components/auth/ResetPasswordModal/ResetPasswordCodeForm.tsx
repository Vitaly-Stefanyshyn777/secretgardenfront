"use client";

import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { CloseButtonIcon, EmailIcon } from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./ResetPasswordModal.module.css";

export interface ResetPasswordCodeFormValues {
  code: string;
}

interface ResetPasswordCodeFormProps {
  form: {
    register: UseFormRegister<ResetPasswordCodeFormValues>;
    handleSubmit: UseFormHandleSubmit<ResetPasswordCodeFormValues>;
    formState: {
      errors: FieldErrors<ResetPasswordCodeFormValues>;
      isSubmitting: boolean;
    };
  };
  email: string;
  onSubmit: (data: ResetPasswordCodeFormValues) => Promise<void>;
  onBackToEmail: () => void;
  onResendEmail: () => void;
  onClose: () => void;
}

export default function ResetPasswordCodeForm({
  form: {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  },
  email,
  onSubmit,
  onBackToEmail,
  onResendEmail,
  onClose,
}: ResetPasswordCodeFormProps) {
  const { t } = useTranslation();

  return (
    <>
      <button className={s.close} onClick={onClose}>
        <CloseButtonIcon />
      </button>

      <div className={s.headerBlock}>
        <div className={s.header}>
          <h2 className={s.headerTitle}>{t("auth.enterCode")}</h2>
        </div>
      </div>

      <div className={s.confirmContent}>
        <div className={s.confirmText}>
          <p className={s.confirmDescription}>
            {t("auth.codeSentToEmail", { email })}
          </p>
        </div>
      </div>

      <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={s.inputGroup}>
          <InputField
            icon={<EmailIcon />}
            label={t("auth.confirmationCode")}
            type="text"
            placeholder={t("auth.enterCodePlaceholder")}
            hasError={!!errors.code}
            supportingText={
              (errors.code?.message as string) || t("auth.codeLength")
            }
            labelClassName={s.inputLabel}
            inputBlockClassName={s.inputBlock}
            {...register("code", {
              required: t("auth.enterConfirmationCode"),
              minLength: {
                value: 4,
                message: t("auth.codeMinLength"),
              },
              maxLength: {
                value: 6,
                message: t("auth.codeMaxLength"),
              },
            })}
          />
        </div>

        <div className={s.actionsBlock}>
          <button className={s.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.checking") : t("auth.confirm")}
          </button>

          <button
            type="button"
            className={s.backButton}
            onClick={onBackToEmail}
          >
            {t("auth.changeEmail")}
          </button>

          <button
            type="button"
            className={s.resendButton}
            onClick={onResendEmail}
          >
            {t("auth.resendCode")}
          </button>
        </div>
      </form>
    </>
  );
}
