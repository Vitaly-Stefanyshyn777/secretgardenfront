import type { TranslationPath } from "@/i18n";

export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
}

export interface NavigationConfigItem {
  href: string;
  labelKey: TranslationPath;
  description?: string;
}

export const getLearningFormatsAnchor = (): string => {
  if (typeof window === "undefined") return "/#LearningFormats";
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  return isMobile ? "/#LearningMobileFormats" : "/#LearningFormats";
};

export const mainNavigationConfig: NavigationConfigItem[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/products", labelKey: "nav.shop" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/contacts", labelKey: "nav.contacts" },
];

export const additionalNavigationConfig: NavigationConfigItem[] = [
  { href: "/courses", labelKey: "nav.workshops" },
  { href: "/courses", labelKey: "nav.programs" },
  { href: "/contacts", labelKey: "nav.contacts" },
];

export const burgerMenuNavigationConfig = {
  main: [
    { href: "/", labelKey: "nav.home" as TranslationPath },
    { href: "/about-bfb", labelKey: "nav.aboutBfb" as TranslationPath },
    {
      href: "/courses-landing",
      labelKey: "nav.instructing" as TranslationPath,
    },
    { href: "/trainers", labelKey: "nav.trainersCatalog" as TranslationPath },
    { href: "/products", labelKey: "nav.productsCatalog" as TranslationPath },
  ],
  additional: [
    { href: "/courses", labelKey: "nav.workshops" as TranslationPath },
    { href: "/our-courses", labelKey: "nav.programs" as TranslationPath },
    { href: "/contacts", labelKey: "nav.contacts" as TranslationPath },
  ],
};
