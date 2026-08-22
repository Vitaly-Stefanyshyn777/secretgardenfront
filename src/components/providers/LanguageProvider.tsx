"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/language";

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLanguageStore((s) => s.locale);
  const isHydrated = useLanguageStore((s) => s.isHydrated);
  const setHydrated = useLanguageStore((s) => s.setHydrated);

  useEffect(() => {
    if (!isHydrated) {
      setHydrated(true);
    }
  }, [isHydrated, setHydrated]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return <>{children}</>;
}
