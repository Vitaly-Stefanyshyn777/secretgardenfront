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
  Icon1,
  Icon2,
  Icon3,
  Icon4,
} from "@/components/Icons/Icons";
import type { NavigationItem } from "./types";

export const navigationItems: NavigationItem[] = [
  {
    id: "trainer-profile",
    label: "Ваш кабінет",
    href: "/profile/trainer-profile",
    icon: Icon1,
    badge: 0,
  },
  {
    id: "courses",
    label: "Мова",
    href: "/profile/courses",
    icon: Icon2,
  },
  {
    id: "orders",
    label: "Ваші замовлення",
    href: "/profile/orders",

    icon: Icon3,
  },
  {
    id: "personal-data",
    label: "Зв'язатися з нами",
    href: "/profile/personal-data",
    icon: Icon4,
  },
  {
    id: "change-password",
    label: "Змінити пароль",
    href: "/profile/change-password",
    icon: LockIcon2,
  },

  { id: "logout", label: "Вийти", href: "/logout", icon: "/icons/icon-9.svg" },
];
