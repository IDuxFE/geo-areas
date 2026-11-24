import { groupByContinent } from './continents.js'
import { phoneData } from './generated/phone.js'
import { getLocale } from './locale.js'
import type { PhoneRegion } from './types.js'
export const phoneRegions: readonly PhoneRegion[] = phoneData
export function getPhoneRegion(countryCode: string): PhoneRegion | undefined {
  return phoneRegions.find((item) => item.countryCode === countryCode.toUpperCase())
}
export function getRegionsByCallingCode(callingCode: string): PhoneRegion[] {
  const code = callingCode.startsWith('+') ? callingCode : `+${callingCode}`
  return phoneRegions.filter((item) => item.callingCode === code)
}
export function getPhoneOptions() {
  const locale = getLocale()
  return phoneRegions.map((item) => ({
    value: item.countryCode,
    label: `${item.name[locale]} (${item.callingCode})`,
    callingCode: item.callingCode,
  }))
}

/** Group options by continent using the current locale. */
export function getGroupedPhoneOptions() {
  return groupByContinent(getPhoneOptions())
}
