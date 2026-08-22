"use client";

import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormGetValues,
} from "react-hook-form";
import {
  EmailTwoIcon,
  NumberIcon,
  UserIcon,
  PasswordsIcon,
} from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import PasswordField from "@/components/ui/FormFields/PasswordField";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./RegisterModal.module.css";

export interface RegisterFormValues {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface RegisterFormProps {
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  handleSubmit: UseFormHandleSubmit<RegisterFormValues>;
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  isSubmitting: boolean;
  isPending: boolean;
  isError: boolean;
  getValues: UseFormGetValues<RegisterFormValues>;
}

export default function RegisterForm({
  register,
  errors,
  handleSubmit,
  onSubmit,
  isSubmitting,
  isPending,
  isError,
  getValues,
}: RegisterFormProps) {
  const { t } = useTranslation();

  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={s.row}>
        <div className={s.inputGroup}>
          <InputField
            icon={<UserIcon />}
            label={t("auth.firstName")}
            type="text"
            id="register-form-first-name-field"
            hasError={!!errors.first_name}
            supportingText={t("auth.firstNameRequired")}
            {...register("first_name", { required: true })}
          />
        </div>

        <div className={s.inputGroup}>
          <InputField
            icon={<UserIcon />}
            label={t("auth.lastName")}
            type="text"
            id="register-form-last-name-field"
            hasError={!!errors.last_name}
            supportingText={t("auth.lastNameRequired")}
            {...register("last_name", { required: true })}
          />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.rowSingle}>
          <InputField
            icon={<EmailTwoIcon />}
            label={t("auth.email")}
            type="email"
            id="register-form-email-field"
            hasError={!!errors.email}
            supportingText={
              (errors.email?.message as string) || t("auth.emailInvalid")
            }
            {...register("email", {
              required: t("auth.emailRequired"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("auth.emailInvalid"),
              },
            })}
          />
        </div>

        <div className={s.rowSingle}>
          <InputField
            icon={<NumberIcon />}
            label={t("auth.phone")}
            type="tel"
            id="register-form-phone-field"
            onlyDigits
            hasError={!!errors.phone}
            supportingText={t("auth.phoneRequired")}
            {...register("phone", { required: true })}
          />
        </div>
      </div>
      <div className={s.row}>
        <div className={s.rowSingle}>
          <PasswordField
            icon={<PasswordsIcon />}
            label={t("auth.password")}
            hasError={!!errors.password}
            supportingText={
              (errors.password?.message as string) || t("auth.passwordMin6")
            }
            {...register("password", {
              required: true,
              minLength: {
                value: 6,
                message: t("auth.passwordMin6"),
              },
            })}
          />
        </div>

        <div className={s.rowSingle}>
          <PasswordField
            icon={<PasswordsIcon />}
            label={t("auth.repeatPassword")}
            hasError={!!errors.confirm_password}
            supportingText={
              (errors.confirm_password?.message as string) ||
              t("auth.passwordsMustMatch")
            }
            {...register("confirm_password", {
              required: t("auth.confirmPasswordRequired"),
              validate: (value) =>
                value === getValues("password") || t("auth.passwordsMustMatch"),
            })}
          />
        </div>
      </div>

      {isError && <p className={s.error}>{t("auth.registerError")}</p>}

      <div className={s.privacyLinkBlock}>
        <div className={s.submitBlock}>
          <button
            className={s.submit}
            type="submit"
            disabled={isSubmitting || isPending}
          >
            {isPending ? t("auth.sending") : t("auth.haveAccount")}
          </button>
          <button
            className={s.submitTwo}
            type="submit"
            disabled={isSubmitting || isPending}
          >
            {isPending ? t("auth.sending") : t("auth.continue")}
          </button>
        </div>

        <p className={s.privacyText}>
          {t("common.privacyAgree")}{" "}
          <a href="/privacy-policy" className={s.privacyLink}>
            {t("common.privacyPolicy")}
          </a>
        </p>
      </div>
    </form>
  );
}
