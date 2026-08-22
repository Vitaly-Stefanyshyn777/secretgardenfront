import uk from "./locales/uk";
import en from "./locales/en";
import type { Messages } from "./locales/uk";

export type Locale = "uk" | "en";

export const locales: Locale[] = ["uk", "en"];
export const defaultLocale: Locale = "uk";

const dictionaries: Record<Locale, Messages> = { uk, en };

export type TranslationPath = Join<PathsToStringProps<Messages>>;

type PathsToStringProps<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : PathsToStringProps<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

type Join<T extends string> = T;

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`,
  );
}

export function translate(
  locale: Locale,
  key: TranslationPath,
  params?: Record<string, string | number>,
): string {
  const messages = dictionaries[locale] ?? dictionaries.uk;
  const value = getNestedValue(messages as Record<string, unknown>, key);
  if (typeof value === "string") {
    return interpolate(value, params);
  }
  return key;
}

export function getLocaleFromStorage(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = window.localStorage.getItem("preferredLanguage");
  return stored === "en" || stored === "uk" ? stored : defaultLocale;
}

export { uk, en };
export type { Messages };
