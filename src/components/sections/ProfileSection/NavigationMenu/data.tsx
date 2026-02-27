import {
  HouseIcon,
  User2Icon,
  DumbbellsIcon,
  BagIcon,
  DocumentIcon,
  BagMoneyIcon,
  LockIcon2,
  EntranceIcon,
  QuestionBorderIcon,
} from "@/components/Icons/Icons";
import type { NavigationItem } from "./types";

export const navigationItems: NavigationItem[] = [
  {
    id: "trainer-profile",
    label: "Ваш кабінет",
    href: "/profile/trainer-profile",
    icon: "/icons/icon-6.svg",
    badge: 0,
  },
  {
    id: "courses",
    label: "Мова",
    href: "/profile/courses",
    icon: "/icons/icon-11.svg",
  },
  {
    id: "orders",
    label: "Ваші замовлення",
    href: "/profile/orders",

    icon: "/icons/icon-7.svg",
  },
  {
    id: "personal-data",
    label: "Зв'язатися з нами",
    href: "/profile/personal-data",
    icon: "/icons/icon-8.svg",
  },
  {
    id: "change-password",
    label: "Змінити пароль",
    href: "/profile/change-password",
    icon: LockIcon2,
  },

  { id: "logout", label: "Вийти", href: "/logout", icon: "/icons/icon-9.svg" },
];
