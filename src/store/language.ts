import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/i18n";
import { defaultLocale } from "@/i18n";

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
        }
      },
    },
  ),
);

export function getCurrentLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  return useLanguageStore.getState().locale ?? defaultLocale;
}
