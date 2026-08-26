import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/i18n";
import { defaultLocale } from "@/i18n";

const LOCALE_COOKIE = "NEXT_LOCALE";

function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

export function getLocaleFromCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  return match?.[1] === "en" ? "en" : match?.[1] === "uk" ? "uk" : null;
}

interface LanguageState {
  locale: Locale;
  isHydrated: boolean;
  setLocale: (locale: Locale) => void;
  setHydrated: (value: boolean) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      isHydrated: false,
      setLocale: (locale) => {
        set({ locale });
        if (typeof window !== "undefined") {
          window.localStorage.setItem("preferredLanguage", locale);
          document.documentElement.lang = locale;
          setLocaleCookie(locale);
        }
      },
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "language-storage",
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (typeof window !== "undefined" && state?.locale) {
          document.documentElement.lang = state.locale;
          window.localStorage.setItem("preferredLanguage", state.locale);
          setLocaleCookie(state.locale);
        }
      },
    },
  ),
);

export function getCurrentLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  return useLanguageStore.getState().locale ?? defaultLocale;
}
