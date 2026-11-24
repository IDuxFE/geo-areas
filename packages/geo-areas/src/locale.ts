import type { Locale } from './types.js'

let currentLocale: Locale = 'zh-CN'

/** Sets the default for subsequent calls across the main entry and subpath imports. */
export function setLocale(locale: Locale): void {
  currentLocale = locale
}

/** Returns the shared default locale, initially zh-CN. */
export function getLocale(): Locale {
  return currentLocale
}
