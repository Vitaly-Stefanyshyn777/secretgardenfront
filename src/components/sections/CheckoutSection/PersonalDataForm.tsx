"use client";

import React from "react";
import { FormData } from "./types";
import s from "./CheckoutSection.module.css";
import InputField from "@/components/ui/FormFields/InputField";
import { useTranslation } from "@/hooks/useTranslation";

interface PersonalDataFormProps {
  formData: FormData;
  hasDifferentRecipient: boolean;
  setFormData: (data: FormData) => void;
  setHasDifferentRecipient: (value: boolean) => void;
  errors?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
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
  const { t } = useTranslation();

  return (
    <div className={s.titleFormBlock}>
      <h2 className={s.sectionTitle}>{t("checkout.personalData")}</h2>
      <div className={s.grid2}>
        <InputField
          label={t("checkout.yourFirstName")}
          id="checkout-form-name-field"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          hasError={!!errors.firstName}
          supportingText={errors.firstName || ""}
        />
        <InputField
          label={t("checkout.yourLastName")}
          id="checkout-form-lastname-field"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          hasError={!!errors.lastName}
          supportingText={errors.lastName || ""}
        />
        <InputField
          label={t("checkout.yourPatronymic")}
          id="checkout-form-middlename-field"
          value={formData.middleName}
          onChange={(e) =>
            setFormData({ ...formData, middleName: e.target.value })
          }
          hasError={!!errors.middleName}
          supportingText={errors.middleName || ""}
        />
        <InputField
          label={t("checkout.yourPhone")}
          id="checkout-form-phone-field"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          hasError={!!errors.phone}
          supportingText={errors.phone || ""}
        />
        <InputField
          label={t("checkout.yourEmail")}
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
          <span className={s.checkboxText}>
            {t("checkout.anotherRecipient")}
          </span>
        </label>
      </div>
      {hasDifferentRecipient && (
        <div className={s.titleFormBlock}>
          <h2 className={s.sectionTitle}>{t("checkout.recipientData")}</h2>
          <div className={s.grid2}>
            <InputField
              label={t("checkout.recipientFirstName")}
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
              label={t("checkout.recipientLastName")}
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
              label={t("checkout.recipientPhone")}
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
