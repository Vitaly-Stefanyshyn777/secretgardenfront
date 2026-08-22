"use client";

import { useForm } from "react-hook-form";
import { useNodeRegister } from "@/lib/useNodeAuth";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useRegisterResult } from "./useRegisterResult";
import RegisterModalHeader from "./RegisterModalHeader";
import RegisterForm from "./RegisterForm";
import RegisterResultModal from "../RegisterResultModal/RegisterResultModal";
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

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<RegisterFormValues>();

  const registerMutation = useNodeRegister();
  const { result, setSuccess, setError, clearResult } = useRegisterResult();
  const { t } = useTranslation();

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const submit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
        firstname: values.first_name,
        lastname: values.last_name,
        phone: values.phone,
      });
      setSuccess();
    } catch {
      setError();
    }
  };

  const handleResultClose = () => {
    clearResult();
    if (result?.type === "success") onClose();
  };

  const handlePrimaryAction = () => {
    if (result?.type === "success") {
      window.location.href = "/";
    } else {
      window.location.href = "mailto:support@bfb.ua";
    }
  };

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <RegisterModalHeader onClose={onClose} />
        <RegisterForm
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={submit}
          isSubmitting={isSubmitting}
          isPending={registerMutation.isPending}
          isError={registerMutation.isError}
          getValues={getValues}
        />
        <RegisterResultModal
          isOpen={!!result}
          type={result?.type === "success" ? "success" : "error"}
          title={
            result?.type === "success"
              ? t("auth.registerSuccess")
              : t("auth.registerFailed")
          }
          description={
            result?.type === "success"
              ? t("auth.registerSuccessDescription")
              : t("auth.registerFailedDescription")
          }
          primaryText={
            result?.type === "success"
              ? t("common.home")
              : t("common.contactSupport")
          }
          onPrimary={handlePrimaryAction}
          onClose={handleResultClose}
        />
      </div>
    </div>
  );
}
