"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguageStore } from "@/store/language";

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLanguageStore((s) => s.locale);
  const isHydrated = useLanguageStore((s) => s.isHydrated);
  const setHydrated = useLanguageStore((s) => s.setHydrated);
  const queryClient = useQueryClient();
  const router = useRouter();
  const prevLocale = useRef(locale);

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

  useEffect(() => {
    if (!isHydrated) return;
    if (prevLocale.current === locale) return;
    prevLocale.current = locale;
    queryClient.invalidateQueries();
    router.refresh();
  }, [locale, isHydrated, queryClient, router]);

  return <>{children}</>;
}
