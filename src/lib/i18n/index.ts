import { cookies } from "next/headers";

import { defaultLocale, LOCALE_COOKIE, locales, type Locale } from "./config";
import { en } from "./dictionaries/en";
import { ko, type Dictionary } from "./dictionaries/ko";

const dictionaries: Record<Locale, Dictionary> = { ko, en };

/**
 * Resolve the active locale from a cookie on the request.
 * Defaults to Korean. Safe to call from Server Components.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (fromCookie && (locales as readonly string[]).includes(fromCookie)) {
    return fromCookie;
  }
  return defaultLocale;
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale];
}

export type { Dictionary, Locale };
export { defaultLocale, locales, LOCALE_COOKIE };
