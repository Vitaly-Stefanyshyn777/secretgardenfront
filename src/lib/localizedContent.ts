import type { Locale } from "@/i18n";
import { getCurrentLocale } from "@/store/language";

export function getLocaleHeaders(
  locale?: Locale,
): Record<string, string> {
  const lang = locale ?? getCurrentLocale();
  return {
    "Accept-Language": lang === "en" ? "en" : "uk",
  };
}

type LocalizedRecord = Record<string, unknown>;

/**
 * Picks localized field from API payload when backend provides *_En / *_Uk suffixes.
 * Falls back to the base field until backend i18n is implemented.
 */
export function getLocalizedField(
  record: LocalizedRecord | null | undefined,
  field: string,
  locale?: Locale,
): string {
  if (!record) return "";
  const lang = locale ?? getCurrentLocale();
  const capitalized = field.charAt(0).toUpperCase() + field.slice(1);
  const enKey = `${field}En`;
  const ukKey = `${field}Uk`;
  const enAlt = `${field}_en`;
  const ukAlt = `${field}_uk`;
  const enCap = `${field}${capitalized}En`;

  if (lang === "en") {
    const enValue =
      record[enKey] ?? record[enCap] ?? record[enAlt] ?? record[`${field}EN`];
    if (typeof enValue === "string" && enValue.trim()) return enValue;
  }

  const ukValue = record[ukKey] ?? record[ukAlt] ?? record[`${field}UK`];
  if (typeof ukValue === "string" && ukValue.trim()) return ukValue;

  const base = record[field];
  return typeof base === "string" ? base : "";
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
  const name = getLocalizedName(record, locale);
  const shortDescription = getLocalizedShortDescription(record, locale);
  const description = getLocalizedDescription(record, locale);
  const label = getLocalizedLabel(record, locale);

  return {
    ...record,
    name,
    shortDescription,
    description,
    label,
  };
}

export function localizeCategoryRecord<T extends LocalizedRecord & { children?: T[] }>(
  record: T,
  locale?: Locale,
): T {
  return {
    ...record,
    name: getLocalizedName(record, locale),
    children: record.children?.map((child) =>
      localizeCategoryRecord(child, locale),
    ),
  };
}
