import { groupByContinent } from './continents.js'
import { countryData } from './generated/countries.js'
import { getLocale } from './locale.js'
import type { Country } from './types.js'
export const countries: readonly Country[] = countryData
export function getCountry(code: string): Country | undefined {
  const key = code.toUpperCase()
  return countries.find(
    (item) => item.code === key || item.alpha3 === key || item.numeric === key.padStart(3, '0'),
  )
}
export function getCountryOptions() {
  const locale = getLocale()
  return countries.map((item) => ({
    value: item.code,
    label: item.name[locale],
    level: item.level,
  }))
}

/** Group options by continent using the current locale. */
export function getGroupedCountryOptions() {
  return groupByContinent(getCountryOptions())
}
