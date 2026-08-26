"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useScrollLock } from "../../hooks/useScrollLock";
import {
  requestPasswordReset,
  setPasswordWithResetCode,
  validatePasswordResetCode,
} from "@/lib/nodeAuth";
import ResetPasswordEmailForm, {
  type ResetPasswordEmailFormValues,
} from "./ResetPasswordEmailForm";
import ResetPasswordConfirm from "./ResetPasswordConfirm";
import ResetPasswordCodeForm, {
  type ResetPasswordCodeFormValues,
} from "./ResetPasswordCodeForm";
import ResetPasswordNewPasswordForm, {
  type ResetPasswordNewPasswordFormValues,
} from "./ResetPasswordNewPasswordForm";
import ResetPasswordSuccessModal from "./ResetPasswordSuccessModal";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./ResetPasswordModal.module.css";

type ResetPasswordStep = "email" | "code" | "newPassword" | "success";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  initialStep?: "email" | "newPassword";
}

function ResetPasswordModal({
  isOpen,
  onClose,
  onOpenLogin,
  initialStep = "email",
}: ResetPasswordModalProps) {
  const [step, setStep] = useState<ResetPasswordStep>(initialStep);
  const [userEmail, setUserEmail] = useState("");
  const [resetCode, setResetCode] = useState("");

  useScrollLock(isOpen);

  // Скидаємо step при відкритті модалки з новим initialStep
  React.useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    }
  }, [isOpen, initialStep]);

  const emailForm = useForm<ResetPasswordEmailFormValues>();
  const codeForm = useForm<ResetPasswordCodeFormValues>();
  const newPasswordForm = useForm<ResetPasswordNewPasswordFormValues>();
  const { t } = useTranslation();

  const handleEmailSubmit = async (data: ResetPasswordEmailFormValues) => {
    try {
      await requestPasswordReset(data.email);
      setUserEmail(data.email);
      setStep("code");
    } catch (error) {
      console.error("Error sending reset password email:", error);
      emailForm.setError("email", {
        message: t("auth.sendEmailError"),
      });
    }
  };

  const handleCodeSubmit = async (data: ResetPasswordCodeFormValues) => {
    try {
      await validatePasswordResetCode(userEmail, data.code);
      setResetCode(data.code);
      setStep("newPassword");
    } catch (error) {
      console.error("Error validating reset code:", error);
      codeForm.setError("code", {
        message: t("auth.invalidCode"),
      });
    }
  };

  const handleNewPasswordSubmit = async (
    data: ResetPasswordNewPasswordFormValues
  ) => {
    try {
      await setPasswordWithResetCode(userEmail, resetCode, data.password);
      setStep("success");
    } catch (error) {
      console.error("Error setting new password:", error);
      newPasswordForm.setError("password", {
        message: t("auth.resetPasswordError"),
      });
    }
  };

  const handleBackToLogin = () => {
    setStep("email");
    emailForm.reset();
    codeForm.reset();
    newPasswordForm.reset();
    setUserEmail("");
    setResetCode("");
    onClose(); // Закриваємо ResetPasswordModal перед відкриттям LoginModal
    onOpenLogin();
  };

  const handleBackToEmail = () => {
    setStep("email");
    codeForm.reset();
    newPasswordForm.reset();
    setResetCode("");
    onClose(); // Закриваємо ResetPasswordModal перед відкриттям LoginModal
    onOpenLogin();
  };

  const handleBackToCode = () => {
    setStep("code");
    newPasswordForm.reset();
  };

  const handleResendEmail = async () => {
    try {
      await requestPasswordReset(userEmail);
    } catch (error) {
      console.error("Error resending reset code:", error);
    }
  };

  const handleSuccessClose = () => {
    setStep("email");
    emailForm.reset();
    codeForm.reset();
    newPasswordForm.reset();
    setUserEmail("");
    setResetCode("");
    onOpenLogin();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Основна модалка */}
      <div className={s.backdrop} onClick={onClose}>
        <div
          className={`${s.modal} ${
            step === "code"
              ? s.modalCode
              : step === "newPassword"
              ? s.modalNewPassword
              : s.modalEmail
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {step === "email" && (
            <ResetPasswordEmailForm
              form={emailForm}
              onSubmit={handleEmailSubmit}
              onBackToLogin={handleBackToLogin}
              onClose={onClose}
            />
          )}

          {step === "code" && (
            <ResetPasswordCodeForm
              form={codeForm}
              email={userEmail}
              onSubmit={handleCodeSubmit}
              onBackToEmail={handleBackToEmail}
              onResendEmail={handleResendEmail}
              onClose={onClose}
            />
          )}

          {step === "newPassword" && (
            <ResetPasswordNewPasswordForm
              form={newPasswordForm}
              onSubmit={handleNewPasswordSubmit}
              onBackToEmail={handleBackToEmail}
              onClose={onClose}
            />
          )}
        </div>
      </div>

      {/* Попап успіху */}
      {step === "success" && (
        <ResetPasswordSuccessModal isOpen={true} onClose={handleSuccessClose} />
      )}
    </>
  );
}

export default ResetPasswordModal;
