"use client";

import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  additionalNavigationConfig,
  burgerMenuNavigationConfig,
  mainNavigationConfig,
  type NavigationConfigItem,
  type NavigationItem,
} from "@/lib/navigation";

function mapConfig(
  items: NavigationConfigItem[],
  t: ReturnType<typeof useTranslation>["t"],
): NavigationItem[] {
  return items.map(({ href, labelKey, description }) => ({
    href,
    label: t(labelKey),
    description,
  }));
}

export function useMainNavigation() {
  const { t } = useTranslation();
  return useMemo(() => mapConfig(mainNavigationConfig, t), [t]);
}

export function useAdditionalNavigation() {
  const { t } = useTranslation();
  return useMemo(() => mapConfig(additionalNavigationConfig, t), [t]);
}

export function useBurgerMenuNavigation() {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      main: mapConfig(burgerMenuNavigationConfig.main, t),
      additional: mapConfig(burgerMenuNavigationConfig.additional, t),
    }),
    [t],
  );
}
