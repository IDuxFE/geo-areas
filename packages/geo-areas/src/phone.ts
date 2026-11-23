import { phoneData } from './generated/phone.js'
import type { Locale, PhoneRegion } from './types.js'
export const phoneRegions: readonly PhoneRegion[] = phoneData
export function getPhoneRegion(countryCode: string): PhoneRegion | undefined {
  return phoneRegions.find((item) => item.countryCode === countryCode.toUpperCase())
}
export function getRegionsByCallingCode(callingCode: string): PhoneRegion[] {
  const code = callingCode.startsWith('+') ? callingCode : `+${callingCode}`
  return phoneRegions.filter((item) => item.callingCode === code)
}
export function getPhoneOptions(locale: Locale = 'zh-CN') {
  return phoneRegions.map((item) => ({
    value: item.countryCode,
    label: `${item.name[locale]} (${item.callingCode})`,
    callingCode: item.callingCode,
  }))
}
