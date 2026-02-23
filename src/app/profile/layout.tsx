"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import ProfileSectionSkeleton from "@/components/sections/ProfileSection/ProfileSectionSkeleton";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const token = useAuthStore((state) => state.token);
  const checkTokenValidity = useAuthStore((state) => state.checkTokenValidity);
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    (async () => {
      setIsChecking(true);
      
      // Якщо немає токену або користувач не залогінений, перенаправляємо на 404
      if (!token || !isLoggedIn) {
        setIsChecking(false);
        router.replace("/not-found");
        return;
      }

      // Перевіряємо валідність токену
      const tokenIsValid = await checkTokenValidity();
      setIsChecking(false);
      
      if (!tokenIsValid) {
        // Токен протух - перенаправляємо на 404
        router.replace("/not-found");
        return;
      }

      setIsValid(true);
    })();
  }, [isHydrated, token, isLoggedIn, checkTokenValidity, router]);

  // Показуємо skeleton під час завантаження або перевірки
  if (!isHydrated || isChecking) {
    return <ProfileSectionSkeleton />;
  }

  // Якщо токен невалідний, показуємо skeleton поки відбувається редирект
  if (!isValid || !token || !isLoggedIn) {
    return <ProfileSectionSkeleton />;
  }

  return <>{children}</>;
}
