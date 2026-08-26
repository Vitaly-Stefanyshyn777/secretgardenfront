import type { Locale } from "@/i18n";
import { getCurrentLocale } from "@/store/language";

const PHRASES: Array<[string, string]> = [
  ["H4CBD масло", "H4CBD oil"],
  ["CBGA масло", "CBGA oil"],
  ["CBD масло", "CBD oil"],
  [
    "Перший кофешоп у Дніпрі",
    "The first coffeeshop in Dnipro",
  ],
  [
    "Ми створили простір для тих, хто цінує якість, атмосферу та правильний сервіс. Сучасний підхід і перевірений продукт — усе в одному місці",
    "We created a space for those who value quality, atmosphere, and proper service. A modern approach and a proven product — all in one place",
  ],
  ["Якість, якій довіряють", "Quality you can trust"],
  [
    "Ми ретельно відбираємо продукцію та співпрацюємо лише з перевіреними постачальниками, щоб ви отримували стабільний результат і впевненість у кожному замовленні",
    "We carefully select products and work only with trusted suppliers so you get a consistent result and confidence in every order",
  ],
  ["Швидко та зручно", "Fast and convenient"],
  [
    "Оформлюйте замовлення онлайн за кілька хвилин. Зрозумілий процес, швидке підтвердження та оперативна доставка — без зайвих кроків.",
    "Place an order online in a few minutes. A clear process, quick confirmation, and prompt delivery — without extra steps.",
  ],
  ["Кількість капсул в упаковці", "Quantity of capsules in package"],
  ["Вага однієї капсули", "Weight of one capsule"],
  ["Грам мухомору в одній капсулі", "Grams of fly agaric in one capsule"],
  ["Біологічно активні сполуки", "Bioactive compounds"],
  ["Умови зберігання", "Storage conditions"],
  ["Важливі застереження", "Important precautions"],
  ["не є лікарським засобом", "is not a medicinal product"],
  [
    "зберігати в сухому, недоступному для дітей місці",
    "store in a dry place out of reach of children",
  ],
  [
    "Мікродозинг 100 капсул Червоний мухомор",
    "Microdosing 100 capsules Red fly agaric",
  ],
  ["Червоний мухомор", "Red fly agaric"],
  ["Характеристика та особливості", "Characteristics and features"],
  ["Короткий опис товару у два рядки.", "A short product description in two lines."],
  ["Категорії та фільтри", "Categories and filters"],
  ["Всі товари", "All products"],
  ["В наявності", "In stock"],
  ["Немає в наявності", "Out of stock"],
  ["Додати в кошик", "Add to cart"],
  ["Мікродозинг", "Microdosing"],
  ["мухомору", "fly agaric"],
  ["мухомора", "fly agaric"],
  ["Мухомори", "Fly agarics"],
  ["Гриби", "Mushrooms"],
  ["гриби", "mushrooms"],
  ["капсули", "capsules"],
  ["Капсули", "Capsules"],
  ["капсула", "capsule"],
  ["капсулу", "capsule"],
  ["капсулі", "capsule"],
  ["капсул", "capsules"],
  ["упаковці", "package"],
  ["Масло", "Oil"],
  ["масло", "oil"],
  ["Склад", "Composition"],
  ["Опис", "Description"],
  ["Вага", "Weight"],
  ["Кількість", "Quantity"],
  ["Мінімалістичний склад", "Minimalist composition"],
  ["Натуральна сировина", "Natural raw materials"],
  ["Без ароматизаторів та барвників", "No flavors or colorants"],
  ["Естетичний формат зберігання", "Aesthetic storage format"],
  ["Це не про поспіх. Це про спокій, уважність і вибір якості.", "This is not about rushing. It is about calm, mindfulness, and choosing quality."],
  ["порошок сушеного червоного мухомору", "dried red fly agaric powder"],
  ["мусцимол, іботенова кислота (природні компоненти червоного мухомора)", "muscimol, ibotenic acid (natural components of red fly agaric)"],
  ["100% порошок сушеного червоного мухомору (Amanita muscaria)", "100% dried red fly agaric powder (Amanita muscaria)"],
  ["Капсули з порошком червоного мухомора — це вибір для тих, хто цінує натуральне походження, мінімалістичний склад і естетику усвідомленого підходу", "Capsules with red fly agaric powder are a choice for those who value natural origin, a minimalist composition, and the aesthetics of a mindful approach"],
  ["Продукт створений на основі ретельно підготовленої сировини без домішок і синтетичних добавок. Делікатна обробка дозволяє зберегти природний склад гриба та його автентичні властивості в первинному вигляді.", "The product is made from carefully prepared raw materials without impurities or synthetic additives. Gentle processing preserves the natural composition of the mushroom and its authentic properties in their original form."],
  ["Формат capsules — це чистота, зручність і акуратність. Нічого зайвого: лише порошок природного походження в охайному, продуманому виконанні. Такий продукт органічно вписується у філософію релаксу, балансу та поваги до природних джерел", "The capsule format is about purity, convenience, and neatness. Nothing extra: only naturally sourced powder in a tidy, thoughtful presentation. Such a product fits naturally into a philosophy of relaxation, balance, and respect for natural sources"],
  ["Формат капсул — це чистота, зручність і акуратність. Нічого зайвого: лише порошок природного походження в охайному, продуманому виконанні. Такий продукт органічно вписується у філософію релаксу, балансу та поваги до природних джерел", "The capsule format is about purity, convenience, and neatness. Nothing extra: only naturally sourced powder in a tidy, thoughtful presentation. Such a product fits naturally into a philosophy of relaxation, balance, and respect for natural sources"],
  ["Quantity capsules в package", "Quantity of capsules in package"],
  ["Вага однієї capsulesи", "Weight of one capsule"],
  ["Грам мухомору в одній capsulesі", "Grams of fly agaric in one capsule"],
  ["в package", "in package"],
  ["однієї capsulesи", "of one capsule"],
  ["одній capsulesі", "in one capsule"],
  ["Категорії", "Categories"],
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function translateUkToEn(input: string): string {
  if (!input?.trim()) return input;
  let out = input;
  const sorted = [...PHRASES].sort((a, b) => b[0].length - a[0].length);
  for (const [uk, en] of sorted) {
    if (!uk) continue;
    if (uk.length <= 12 && !uk.includes(" ")) {
      const re = new RegExp(`(?<!\\p{L})${escapeRegExp(uk)}(?!\\p{L})`, "gu");
      out = out.replace(re, en);
    } else {
      out = out.split(uk).join(en);
    }
  }
  return out;
}

export function localizeDynamicText(
  value: string | null | undefined,
  locale?: Locale,
): string {
  const text = value ?? "";
  const lang = locale ?? getCurrentLocale();
  if (lang !== "en" || !text.trim()) return text;
  if (!/[а-яіїєґА-ЯІЇЄҐ]/.test(text)) return text;
  return translateUkToEn(text);
}

export function getLocaleHeaders(
  locale?: Locale,
): Record<string, string> {
  const lang = locale ?? getCurrentLocale();
  return {
    "Accept-Language": lang === "en" ? "en" : "uk",
  };
}

type LocalizedRecord = Record<string, unknown>;

export function getLocalizedField(
  record: LocalizedRecord | null | undefined,
  field: string,
  locale?: Locale,
): string {
  if (!record) return "";
  const lang = locale ?? getCurrentLocale();
  const enKey = `${field}En`;
  const ukKey = `${field}Uk`;
  const enAlt = `${field}_en`;
  const ukAlt = `${field}_uk`;

  const asString = (v: unknown) =>
    typeof v === "string" ? v : v == null ? "" : String(v);

  if (lang === "en") {
    const enValue = asString(
      record[enKey] ?? record[enAlt] ?? record[`${field}EN`],
    ).trim();
    if (enValue) return enValue;
    const source = asString(
      record[ukKey] ?? record[ukAlt] ?? record[field],
    ).trim();
    return source ? translateUkToEn(source) : "";
  }

  const ukValue = asString(record[ukKey] ?? record[ukAlt]).trim();
  if (ukValue) return ukValue;
  return asString(record[field]);
}

export function getLocalizedName(
  record: LocalizedRecord | null | undefined,
  locale?: Locale,
): string {
  return getLocalizedField(record, "name", locale);
}

export function getLocalizedDescription(
  record: LocalizedRecord | null | undefined,
  locale?: Locale,
): string {
  return getLocalizedField(record, "description", locale);
}

export function getLocalizedShortDescription(
  record: LocalizedRecord | null | undefined,
  locale?: Locale,
): string {
  return getLocalizedField(record, "shortDescription", locale);
}

export function getLocalizedLabel(
  record: LocalizedRecord | null | undefined,
  locale?: Locale,
): string {
  return getLocalizedField(record, "label", locale);
}

export function localizeProductRecord<T extends LocalizedRecord>(
  record: T,
  locale?: Locale,
): T {
  return {
    ...record,
    name: getLocalizedName(record, locale),
    shortDescription: getLocalizedShortDescription(record, locale),
    description: getLocalizedDescription(record, locale),
    label: getLocalizedLabel(record, locale),
  };
}

export function localizeCategoryRecord<
  T extends LocalizedRecord & { children?: T[]; filters?: unknown[] },
>(record: T, locale?: Locale): T {
  const lang = locale ?? getCurrentLocale();
  const filters = Array.isArray(record.filters)
    ? record.filters.map((f) => {
        if (!f || typeof f !== "object") return f;
        const row = f as Record<string, unknown>;
        const values = Array.isArray(row.values)
          ? row.values.map((v) => {
              if (!v || typeof v !== "object") return v;
              const val = v as Record<string, unknown>;
              return {
                ...val,
                value:
                  getLocalizedField(val, "value", lang) ||
                  String(val.value ?? ""),
              };
            })
          : row.values;
        return {
          ...row,
          name: getLocalizedField(row, "name", lang) || String(row.name ?? ""),
          values,
        };
      })
    : record.filters;

  return {
    ...record,
    name: getLocalizedName(record, locale),
    filters,
    children: record.children?.map((child) =>
      localizeCategoryRecord(child, locale),
    ),
  };
}

export function withMapLanguage(mapSrc: string, locale?: Locale): string {
  const lang = locale ?? getCurrentLocale();
  const hl = lang === "en" ? "en" : "uk";
  try {
    const url = new URL(mapSrc);
    url.searchParams.set("hl", hl);
    url.searchParams.set("language", hl);
    // Force English map tiles/labels when possible for embed URLs.
    if (hl === "en" && !url.searchParams.has("gl")) {
      url.searchParams.set("gl", "us");
    }
    return url.toString();
  } catch {
    const join = mapSrc.includes("?") ? "&" : "?";
    return `${mapSrc}${join}hl=${hl}&language=${hl}${hl === "en" ? "&gl=us" : ""}`;
  }
}
