"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { translate } from "@/i18n";
import { getCurrentLocale } from "@/store/language";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const checkTokenValidity = useAuthStore((state) => state.checkTokenValidity);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    (async () => {
      try {
        if (typeof window === "undefined") {
          return;
        }
        if (token) {
          await fetch("/api/set-user-cookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          try {
            localStorage.setItem("bfb_token", token);
            localStorage.setItem("bfb_token_old", token);
          } catch {}
        }
      } catch {
        // Silent error handling
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!isHydrated) return;

    (async () => {
      if (token) {
        const isValid = await checkTokenValidity();
        if (!isValid) {
          clear();
          const locale = getCurrentLocale();
          toast.info(translate(locale, "checkout.sessionExpired"));
          openLoginModal();
        }
      }
    })();
  }, [isHydrated, token, checkTokenValidity, clear, openLoginModal]);

  return <>{children}</>;
}
