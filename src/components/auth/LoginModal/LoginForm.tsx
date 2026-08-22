"use client";

import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { EmailTwoIcon, PasswordsIcon } from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import PasswordField from "@/components/ui/FormFields/PasswordField";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./LoginModal.module.css";

export interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginFormProps {
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  handleSubmit: UseFormHandleSubmit<LoginFormValues>;
  onSubmit: (data: LoginFormValues) => Promise<void>;
  onSwitchToRegister: () => void;
  onForgotPassword?: () => void;
  isSubmitting: boolean;
  isPending: boolean;
  isError: boolean;
}

export default function LoginForm({
  register,
  errors,
  handleSubmit,
  onSubmit,
  isSubmitting,
  isPending,
  onSwitchToRegister,
  onForgotPassword,
}: LoginFormProps) {
  const { t } = useTranslation();

  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={s.inputGroup}>
        <InputField
          icon={<EmailTwoIcon />}
          label={t("auth.emailOrUsername")}
          type="text"
          hasError={!!errors.username}
          supportingText={
            (errors.username?.message as string) ||
            t("auth.emailOrUsernameRequired")
          }
          labelClassName={s.loginInputLabel}
          inputBlockClassName={s.loginInputBlock}
          {...register("username", { required: true })}
        />

        <PasswordField
          icon={<PasswordsIcon />}
          label={t("auth.password")}
          hasError={!!errors.password}
          supportingText={
            (errors.password?.message as string) || t("auth.passwordRequired")
          }
          labelClassName={s.loginPasswordLabel}
          eyeBtnClassName={s.loginPasswordEyeBtn}
          inputBlockClassName={s.loginPasswordBlock}
          {...register("password", { required: true })}
        />
      </div>

      <div className={s.privacyLinkBlock}>
        <div className={s.submitBlock}>
          <button
            className={s.submit}
            type="button"
            disabled={isSubmitting || isPending}
            onClick={onSwitchToRegister}
          >
            {isPending ? t("auth.loggingIn") : t("auth.noAccount")}
          </button>

          <button
            className={s.submitTwo}
            type="submit"
            disabled={isSubmitting || isPending}
          >
            {isPending ? t("auth.loggingIn") : t("auth.login")}
          </button>
        </div>

        <div className={s.bottomLinksBlock}>
          {onForgotPassword && (
            <div className={s.forgotPasswordBlock}>
              <button
                type="button"
                className={s.forgotPasswordButton}
                onClick={onForgotPassword}
              >
                {t("auth.forgotPassword")}
              </button>
            </div>
          )}
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
