"use client";

import { useForm } from "react-hook-form";
import { useNodeLogin } from "@/lib/useNodeAuth";
import { useScrollLock } from "../../hooks/useScrollLock";
import LoginModalHeader from "./LoginModalHeader";
import LoginForm, { type LoginFormValues } from "./LoginForm";
import s from "./LoginModal.module.css";
import { useCallback, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { LoginPayload } from "@/lib/nodeAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: LoginFormValues) => Promise<void>;
  onOpenRegister: () => void;
  onOpenResetPassword?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenResetPassword,
}: LoginModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<LoginFormValues>({
    mode: "onTouched",
  });

  const loginMutation = useNodeLogin();
  const { t } = useTranslation();
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      reset();
      loginMutation.reset();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSwitchToRegister = () => {
    onClose(); // 1. Закриваємо модалку логіну через пропс
    onOpenRegister();
  };

  const handleForgotPassword = useCallback(() => {
    onClose(); // Закриваємо модалку логіну
    onOpenResetPassword?.(); // Відкриваємо модалку скидання пароля (якщо функція існує)
  }, [onClose, onOpenResetPassword]);

  if (!isOpen) return null;

  const submit = async (values: LoginFormValues) => {
    const email = values.email?.trim() || "";
    const phone = values.phone?.trim() || "";

    if (!email && !phone) {
      setError("email", {
        type: "manual",
        message: t("auth.emailOrPhoneRequired"),
      });
      setError("phone", {
        type: "manual",
        message: t("auth.emailOrPhoneRequired"),
      });
      return;
    }

    try {
      const payload: LoginPayload = {
        password: values.password,
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
      };
      await loginMutation.mutateAsync(payload);
      onClose();
    } catch {
      const field = email ? "email" : "phone";
      setError(field, {
        type: "manual",
        message: t("auth.invalidCredentials"),
      });
      setError("password", {
        type: "manual",
        message: t("auth.invalidCredentials"),
      });
    }
  };

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <LoginModalHeader onClose={onClose} />
        <LoginForm
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={submit}
          isSubmitting={isSubmitting}
          isPending={loginMutation.isPending}
          onSwitchToRegister={handleSwitchToRegister}
          onForgotPassword={handleForgotPassword}
          isError={loginMutation.isError}
        />
      </div>
    </div>
  );
}
