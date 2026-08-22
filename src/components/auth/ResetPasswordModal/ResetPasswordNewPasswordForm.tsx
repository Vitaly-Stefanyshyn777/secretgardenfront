"use client";

import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { CloseButtonIcon, PasswordsIcon } from "@/components/Icons/Icons";
import PasswordField from "@/components/ui/FormFields/PasswordField";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./ResetPasswordModal.module.css";

export interface ResetPasswordNewPasswordFormValues {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordNewPasswordFormProps {
  form: {
    register: UseFormRegister<ResetPasswordNewPasswordFormValues>;
    handleSubmit: UseFormHandleSubmit<ResetPasswordNewPasswordFormValues>;
    formState: {
      errors: FieldErrors<ResetPasswordNewPasswordFormValues>;
      isSubmitting: boolean;
    };
  };
  onSubmit: (data: ResetPasswordNewPasswordFormValues) => Promise<void>;
  onBackToEmail: () => void;
  onClose: () => void;
}

export default function ResetPasswordNewPasswordForm({
  form: {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  },
  onSubmit,
  onBackToEmail,
  onClose,
}: ResetPasswordNewPasswordFormProps) {
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
          <PasswordField
            icon={<PasswordsIcon />}
            label={t("auth.createNewPassword")}
            hasError={!!errors.password}
            supportingText={
              (errors.password?.message as string) || t("auth.min6Chars")
            }
            labelClassName={s.inputLabel}
            eyeBtnClassName={s.eyeBtn}
            inputBlockClassName={s.inputBlock}
            {...register("password", {
              required: t("auth.enterNewPassword"),
              minLength: {
                value: 6,
                message: t("auth.passwordMin6Chars"),
              },
            })}
          />

          <PasswordField
            icon={<PasswordsIcon />}
            label={t("auth.confirmNewPassword")}
            hasError={!!errors.confirmPassword}
            supportingText={
              (errors.confirmPassword?.message as string) ||
              t("auth.repeatPasswordPlaceholder")
            }
            labelClassName={s.inputLabel}
            eyeBtnClassName={s.eyeBtn}
            inputBlockClassName={s.inputBlock}
            {...register("confirmPassword", {
              required: t("auth.confirmNewPassword"),
              validate: (value, formValues) => {
                if (value !== formValues.password) {
                  return t("auth.passwordsDoNotMatch");
                }
                return true;
              },
            })}
          />
        </div>

        <div className={s.actionsBlock}>
          <button className={s.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.saving") : t("auth.reset")}
          </button>

          <button
            type="button"
            className={s.backButton}
            onClick={onBackToEmail}
          >
            {t("auth.backToAuthorization")}
          </button>
        </div>
      </form>
    </>
  );
}
