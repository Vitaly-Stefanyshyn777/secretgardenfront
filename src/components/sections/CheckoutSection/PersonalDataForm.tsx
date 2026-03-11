"use client";
import React from "react";
import { FormData } from "./types";
import s from "./CheckoutSection.module.css";
import InputField from "@/components/ui/FormFields/InputField";
import { UserIcon, NumberIcon, EmailIcon } from "@/components/Icons/Icons";

interface PersonalDataFormProps {
  formData: FormData;
  hasDifferentRecipient: boolean;
  setFormData: (data: FormData) => void;
  setHasDifferentRecipient: (value: boolean) => void;
  errors?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    billing?: string;
    recipientFirstName?: string;
    recipientLastName?: string;
    recipientPhone?: string;
  };
}

export default function PersonalDataForm({
  formData,
  hasDifferentRecipient,
  setFormData,
  setHasDifferentRecipient,
  errors = {},
}: PersonalDataFormProps) {
  return (
    <div className={s.titleFormBlock}>
      <h2 className={s.sectionTitle}>Особисті дані</h2>
      <div className={s.grid2}>
        <InputField
          icon={<UserIcon />}
          label="Ваше ім'я"
          id="checkout-form-name-field"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          hasError={!!errors.firstName}
          supportingText={errors.firstName || ""}
        />
        <InputField
          icon={<UserIcon />}
          label="Ваше прізвище"
          id="checkout-form-lastname-field"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          hasError={!!errors.lastName}
          supportingText={errors.lastName || ""}
        />
        <InputField
          icon={<NumberIcon />}
          label="Ваш номер телефону"
          id="checkout-form-phone-field"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          hasError={!!errors.phone}
          supportingText={errors.phone || ""}
        />
        <InputField
          icon={<EmailIcon />}
          label="Ваша пошта"
          id="checkout-form-email-field"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          hasError={!!errors.email}
          supportingText={errors.email || ""}
        />
      </div>
      <div className={s.checkboxBlock}>
        <label className={s.checkbox}>
          <input
            type="checkbox"
            checked={hasDifferentRecipient}
            onChange={(e) => setHasDifferentRecipient(e.target.checked)}
          />
          <span className={s.checkboxText}>Отримувати буде інша людина</span>
        </label>
      </div>
      {hasDifferentRecipient && (
        <div className={s.titleFormBlock}>
          <h2 className={s.sectionTitle}>Дані отримувача</h2>
          <div className={s.grid2}>
            <InputField
              icon={<UserIcon />}
              label="Ім'я отримувача"
              id="checkout-recipient-form-name-field"
              value={formData.recipientFirstName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recipientFirstName: e.target.value,
                })
              }
              hasError={!!errors.recipientFirstName}
              supportingText={errors.recipientFirstName || ""}
            />
            <InputField
              icon={<UserIcon />}
              label="Прізвище отримувача"
              id="checkout-recipient-form-lastname-field"
              value={formData.recipientLastName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recipientLastName: e.target.value,
                })
              }
              hasError={!!errors.recipientLastName}
              supportingText={errors.recipientLastName || ""}
            />
            <InputField
              icon={<NumberIcon />}
              label="Номер телефону отримувача"
              id="checkout-recipient-form-phone-field"
              type="tel"
              value={formData.recipientPhone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recipientPhone: e.target.value,
                })
              }
              hasError={!!errors.recipientPhone}
              supportingText={errors.recipientPhone || ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}
