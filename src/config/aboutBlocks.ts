import type { ContentAboutBlock } from "@/lib/contentApi";
import type { Locale } from "@/i18n";

const UK_BLOCKS: ContentAboutBlock[] = [
  {
    id: "fallback-policy",
    order: 0,
    title: "Наша політика",
    body: [
      "Secret Garden — це простір, створений на принципах натуральності, прозорості та відповідального підходу. Ми працюємо виключно з продуктами, що мають зрозуміле походження та відповідають чинним вимогам законодавства.",
      "У нашому магазині не представлені продукти, що містять THC, а також сполуки, отримані синтетичним шляхом. Ми свідомо обираємо натуральні формати та інгредієнти без сумнівних домішок.",
      "Ми розвиваємось як окремий, самостійний проєкт із власною філософією та підходом. Ми робимо акцент на легальних, перевірених продуктах і дотримуємося чіткої позиції щодо безпеки та відповідального використання.",
    ].join("\n\n"),
    imageUrl: "/images/Rectangle-12.png",
    imageLeft: true,
    ctaLabel: "Переглянути сертифікати",
    ctaUrl: "/certificates.pdf",
    links: [],
  },
  {
    id: "fallback-goal",
    order: 1,
    title: "Ціль",
    body: [
      "Наша мета — підтримати людей, які шукають м’яке заспокоєння, зниження напруги та фізичний комфорт, а також тих, хто надає перевагу натуральним способам розслаблення.",
      "Ми не обіцяємо миттєвих ефектів і не формуємо завищених очікувань. Натомість ми пропонуємо продукти та середовище, які можуть стати частиною особистих ритуалів відновлення, відпочинку й турботи про себе.",
    ].join("\n\n"),
    imageUrl: "/images/Rectangle-13.png",
    imageLeft: false,
    ctaLabel: null,
    ctaUrl: null,
    links: [],
  },
  {
    id: "fallback-services",
    order: 2,
    title: "Інші послуги",
    body: [
      "Secret Garden — це не лише магазин, а й живий простір. У нашому закладі ви можете:",
      "Випити каву в спокійній атмосфері\nСкористатися можливістю покурити легально\nВідвідати чайні церемонії, які проходять за попереднім записом.",
      "Записатися на церемонію ви можете нижче:",
    ].join("\n\n"),
    imageUrl: "/images/Rectangle-15.png",
    imageLeft: true,
    ctaLabel: null,
    ctaUrl: null,
    links: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/secret_garden_dnipro",
        kind: "instagram",
      },
      {
        label: "Telegram",
        url: "https://t.me/Secret_Garden_shop420",
        kind: "telegram",
      },
    ],
  },
  {
    id: "fallback-support",
    order: 3,
    title: "Підтримка та вдячність",
    body: [
      "Ми працюємо в Україні й усвідомлюємо відповідальність перед нашою спільнотою. Для військовослужбовців діє знижка 10% — її можна отримати у фізичному закладі у вигляді промокоду.",
      "Окрім цього, ми регулярно долучаємось до зборів на дрони для наших захисників. Це наш спосіб виразити нашу вдячність за можливість прокидатися кожного дня.",
    ].join("\n\n"),
    imageUrl: "/images/about-support.jpg",
    imageLeft: false,
    ctaLabel: "Підтримати збір",
    ctaUrl: "https://send.monobank.ua/jar/8w8VemE1nR",
    links: [],
  },
];

const EN_BLOCKS: ContentAboutBlock[] = [
  {
    id: "fallback-policy",
    order: 0,
    title: "Our policy",
    body: [
      "Secret Garden is a space built on naturalness, transparency, and a responsible approach. We work exclusively with products of clear origin that meet current legal requirements.",
      "Our store does not offer products that contain THC or compounds obtained synthetically. We consciously choose natural formats and ingredients without questionable additives.",
      "We grow as an independent project with our own philosophy and approach. We focus on legal, verified products and keep a clear position on safety and responsible use.",
    ].join("\n\n"),
    imageUrl: "/images/Rectangle-12.png",
    imageLeft: true,
    ctaLabel: "View certificates",
    ctaUrl: "/certificates.pdf",
    links: [],
  },
  {
    id: "fallback-goal",
    order: 1,
    title: "Goal",
    body: [
      "Our goal is to support people seeking gentle calm, reduced tension, and physical comfort, as well as those who prefer natural ways to relax.",
      "We do not promise instant effects or create inflated expectations. Instead, we offer products and an environment that can become part of personal rituals of recovery, rest, and self-care.",
    ].join("\n\n"),
    imageUrl: "/images/Rectangle-13.png",
    imageLeft: false,
    ctaLabel: null,
    ctaUrl: null,
    links: [],
  },
  {
    id: "fallback-services",
    order: 2,
    title: "Other services",
    body: [
      "Secret Garden is not only a shop, but also a living space. In our venue you can:",
      "Have a coffee in a calm atmosphere\nEnjoy the opportunity to smoke legally\nAttend tea ceremonies held by prior appointment.",
      "You can book a ceremony below:",
    ].join("\n\n"),
    imageUrl: "/images/Rectangle-15.png",
    imageLeft: true,
    ctaLabel: null,
    ctaUrl: null,
    links: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/secret_garden_dnipro",
        kind: "instagram",
      },
      {
        label: "Telegram",
        url: "https://t.me/Secret_Garden_shop420",
        kind: "telegram",
      },
    ],
  },
  {
    id: "fallback-support",
    order: 3,
    title: "Support and gratitude",
    body: [
      "We work in Ukraine and understand our responsibility to the community. Service members get a 10% discount — available at the physical venue as a promo code.",
      "We also regularly join fundraisers for drones for our defenders. This is our way to express gratitude for the chance to wake up every day.",
    ].join("\n\n"),
    imageUrl: "/images/about-support.jpg",
    imageLeft: false,
    ctaLabel: "Support the fundraiser",
    ctaUrl: "https://send.monobank.ua/jar/8w8VemE1nR",
    links: [],
  },
];

/** @deprecated use getDefaultAboutBlocks(locale) */
export const DEFAULT_ABOUT_BLOCKS = UK_BLOCKS;

export function getDefaultAboutBlocks(locale: Locale = "uk"): ContentAboutBlock[] {
  return locale === "en" ? EN_BLOCKS : UK_BLOCKS;
}
