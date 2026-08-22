import {
  LockIcon2,
  Icon1,
  Icon2,
  Icon3,
  Icon4,
} from "@/components/Icons/Icons";
import type { TranslationPath } from "@/hooks/useTranslation";
import type { NavigationItem } from "./types";

export type NavigationItemConfig = Omit<NavigationItem, "label"> & {
  labelKey: TranslationPath;
};

export const navigationItems: NavigationItemConfig[] = [
  {
    id: "trainer-profile",
    labelKey: "profile.cabinet",
    href: "/profile/trainer-profile",
    icon: Icon1,
    badge: 0,
  },
  {
    id: "courses",
    labelKey: "profile.language",
    href: "/profile/courses",
    icon: Icon2,
  },
  {
    id: "orders",
    labelKey: "profile.orders",
    href: "/profile/orders",
    icon: Icon3,
  },
  {
    id: "personal-data",
    labelKey: "profile.contactUs",
    href: "/profile/personal-data",
    icon: Icon4,
  },
  {
    id: "change-password",
    labelKey: "profile.changePassword",
    href: "/profile/change-password",
    icon: LockIcon2,
  },
  {
    id: "logout",
    labelKey: "profile.logout",
    href: "/logout",
    icon: "/icons/icon-9.svg",
  },
];
