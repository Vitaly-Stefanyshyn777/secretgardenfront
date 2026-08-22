"use client";

import React from "react";
import { FormData } from "./types";
import s from "./CheckoutSection.module.css";
import Multiline from "@/components/ui/FormFields/Multiline";
import multilineStyles from "@/components/ui/FormFields/Multiline.module.css";
import { useTranslation } from "@/hooks/useTranslation";

interface CommentFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export default function CommentForm({
  formData,
  setFormData,
}: CommentFormProps) {
  const { t } = useTranslation();

  return (
    <div className={s.commentBlock}>
      <h2 className={s.sectionTitle}>{t("checkout.orderComment")}</h2>
      <Multiline
        label={t("checkout.orderCommentPlaceholder")}
        value={formData.comment}
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
        textareaClassName={multilineStyles.textareaWhite}
      />
    </div>
  );
}
