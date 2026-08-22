"use client";

import { useCallback } from "react";
import { translate, type Locale, type TranslationPath } from "@/i18n";
import { useLanguageStore } from "@/store/language";

export function useTranslation() {
  const locale = useLanguageStore((s) => s.locale);

  const t = useCallback(
    (key: TranslationPath, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  return { t, locale };
}

export type { Locale, TranslationPath };
