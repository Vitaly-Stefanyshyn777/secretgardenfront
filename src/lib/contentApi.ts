import { getDefaultAboutBlocks } from "@/config/aboutBlocks";
import type { Locale } from "@/i18n";
import { getLocaleHeaders } from "@/lib/localizedContent";

const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api`;

export type ContentBanner = {
  id: string;
  title: string;
  titleSub?: string | null;
  description: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  order: number;
};

export type ContentAboutLink = {
  label: string;
  url: string;
  kind?: string;
};

export type ContentAboutTextBlock = {
  text: string;
  gap?: number;
};

export type ContentAboutBlock = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  imageLeft: boolean;
  ctaLabel: string | null;
  ctaUrl: string | null;
  links: ContentAboutLink[] | null;
  textPadding?: number | null;
  textBlocks?: ContentAboutTextBlock[] | null;
  buttonsLeft?: boolean | null;
  order: number;
};

export type ContentFaqItem = {
  id: string;
  title: string;
  body: string;
  order: number;
  isSplit?: boolean;
  isActive?: boolean;
};

export type ContentContacts = {
  introTitle: string;
  introText: string;
  scheduleTitle: string;
  hoursTime: string;
  daysOff: string;
  holidayNote?: string | null;
  address: string;
  email: string;
  instagramUrl: string;
  instagramLabel?: string | null;
  telegramUrls: string[];
  telegramLabels?: string[] | null;
  mapSrc: string;
  venuePhotoUrl?: string | null;
  certificateUrl?: string | null;
  donationUrl?: string | null;
};

export async function fetchPublicContent(locale?: Locale) {
  const res = await fetch(`${BASE}/content`, {
    cache: "no-store",
    headers: getLocaleHeaders(locale),
  });
  if (!res.ok) throw new Error("content fetch failed");
  return res.json() as Promise<{
    banners: ContentBanner[];
    aboutBlocks: ContentAboutBlock[];
    contacts: ContentContacts;
  }>;
}

export async function fetchBanners(locale?: Locale): Promise<ContentBanner[]> {
  try {
    const res = await fetch(`${BASE}/content/banners`, {
      cache: "no-store",
      headers: getLocaleHeaders(locale),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchAboutBlocks(locale?: Locale): Promise<ContentAboutBlock[]> {
  const lang = locale ?? "uk";
  const fallback = getDefaultAboutBlocks(lang);
  try {
    const res = await fetch(`${BASE}/content/about`, {
      cache: "no-store",
      headers: getLocaleHeaders(lang),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as ContentAboutBlock[];
    if (!Array.isArray(data) || data.length === 0) return fallback;

    // Якщо EN і в адмінці ще немає повного перекладу — підставляємо EN fallback по order
    if (lang === "en") {
      return data.map((block) => {
        const stillUk = /[а-яіїєґА-ЯІЇЄҐ]/.test(
          `${block.title || ""}${block.body || ""}${block.ctaLabel || ""}`,
        );
        if (!stillUk) return block;
        const fb =
          fallback.find((f) => f.order === block.order) ||
          fallback.find((f) => f.id === block.id);
        if (!fb) return block;
        return {
          ...block,
          title: fb.title,
          body: fb.body,
          ctaLabel: fb.ctaLabel ?? block.ctaLabel,
        };
      });
    }

    return data;
  } catch {
    return fallback;
  }
}

const DEFAULT_FAQ_ITEMS: ContentFaqItem[] = [
  {
    id: "fallback-cbd",
    order: 0,
    title: "Що таке CBD ?",
    body: [
      "CBD - це природна сполука, що міститься в рослині конопель. Він не має психоактивної дії та не викликає стану сп’яніння. CBD досліджують щодо можливого впливу на зниження стресу, покращення сну, загальне розслаблення.",
      "Ми пропонуємо лише легальну продукцію, яка відповідає чинному законодавству України.",
    ].join("\n\n"),
  },
  {
    id: "fallback-thc",
    order: 1,
    title: "Чим CBD відрізняється від THC ?",
    body: [
      "CBD та THC - це різні компоненти рослини конопель, які по різному впливають на організм.",
      "THC має психоактивний ефект - тобто змінює стан свідомості та може викликати відчуття сп’яніння.",
      "CBD не має психоактивної дії та не викликає “ефекту ейфорії”. Його зазвичай обирають ті, хто шукає розслаблення без зміни свідомості.",
    ].join("\n\n"),
  },
  {
    id: "fallback-mushrooms",
    order: 2,
    title: "В чому користь мухоморів? ?",
    body: [
      "Мухомори традиційно використовувалися в різних культурах у вигляді висушеної сировини. Їм приписують вплив на релаксацію, покращення настрою, загальне самопочуття.",
      "⚠️ Водночас важливо розуміти, що реакція організму індивідуальна. Перед вживанням будь-яких продуктів рослинного походження рекомендується ознайомитись з інформацією та дотримуватись обережності.",
    ].join("\n\n"),
    isSplit: true,
  },
  {
    id: "fallback-joints",
    order: 3,
    title: "Чи є у нас джойнти ?",
    body: [
      "Ні. Ми не продаємо джойнти або будь-яку продукцію сумнівного походження.",
      "Також ми не маємо відношення до інших магазинів чи сторонніх продавців.",
      "Ми працюємо виключно з перевіреною продукцією та дотримуємося чинного законодавства",
    ].join("\n\n"),
    isSplit: true,
  },
];

export async function fetchFaqItems(locale?: Locale): Promise<ContentFaqItem[]> {
  try {
    const res = await fetch(`${BASE}/content/faq`, {
      cache: "no-store",
      headers: getLocaleHeaders(locale),
    });
    if (!res.ok) return DEFAULT_FAQ_ITEMS;
    const data = (await res.json()) as ContentFaqItem[];
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_FAQ_ITEMS;
  } catch {
    return DEFAULT_FAQ_ITEMS;
  }
}

export async function fetchContacts(locale?: Locale): Promise<ContentContacts | null> {
  try {
    const res = await fetch(`${BASE}/content/contacts`, {
      cache: "no-store",
      headers: getLocaleHeaders(locale),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
