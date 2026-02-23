"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

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
          const response = await fetch("/api/set-user-cookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          // Синхронізуємо токен у localStorage для клієнтських запитів axios
          try {
            localStorage.setItem("bfb_token", token);
            // лишаємо сумісність зі старими ключами
            localStorage.setItem("bfb_token_old", token);
          } catch {}
        }
      } catch (error) {
        // Silent error handling
      }
    })();
  }, [token]);

  // Перевірка валідності токену після гідратації
  useEffect(() => {
    if (!isHydrated) return;

    (async () => {
      if (token) {
        const isValid = await checkTokenValidity();
        if (!isValid) {
          // Токен невалідний - очищаємо авторизацію та відкриваємо модалку логіну
          clear();
          openLoginModal();

          // Якщо користувач на сторінці профілю, middleware покаже 404 при наступному запиті
          // Тут просто очищаємо авторизацію, редирект не потрібен
        }
      }
    })();
  }, [isHydrated, token, checkTokenValidity, clear, openLoginModal]);

  return <>{children}</>;
}
