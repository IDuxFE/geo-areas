---
index: 3
title: API (English)
---

## Calling codes

Import from `/phone` or the main entry.

```ts
export interface PhoneRegion {
  countryCode: string
  name: LocalizedName
  callingCode: string
}
```

`countryCode` is the unique region key: ISO alpha-2 plus libphonenumber extensions `AC`, `TA` and `XK`. `name` holds display names. `callingCode` is an E.164 country calling code with `+`; multiple regions can share it. It is not a city area code or NANP region prefix: Jamaica returns `+1`. Extension regions may be absent from `getCountry`.

```ts
export const phoneRegions: readonly PhoneRegion[]

export function getPhoneRegion(countryCode: string): PhoneRegion | undefined

export function getRegionsByCallingCode(callingCode: string): PhoneRegion[]

export function getPhoneOptions(): {
  value: string
  label: string
  callingCode: string
}[]
```

- `phoneRegions`: all supported telephone regions.
- `getPhoneRegion(countryCode)`: case-insensitive region lookup; no alpha-3/numeric aliases; returns `undefined` if absent.
- `getRegionsByCallingCode(callingCode)`: accepts `+1` or `1` (adds `+`), returning all matching regions or `[]`. Does not parse complete phone numbers.
- `getPhoneOptions()`: new options with `value = countryCode`, `label = name[getLocale()] + ' (' + callingCode + ')'`, plus `callingCode`. No `level` field.

### Options grouped by continent

```ts
import { getGroupedPhoneOptions } from '@idux/geo-areas/phone'

const groups = getGroupedPhoneOptions()
// { value: '142', label: 'Asia', children: [...] }[]
```

`getGroupedPhoneOptions()` returns `OptionGroup<ReturnType<typeof getPhoneOptions>[number]>[]`. Each group has `value`, `label` and `children`; leaves retain all flat option fields and their relative order. Labels follow `getLocale()`. Each call returns new groups and leaf options.

Groups are ordered as Asia (`142`), Europe (`150`), North America (`003`, including Central America and the Caribbean), South America (`005`), Africa (`002`), Oceania (`009`), and Antarctica (`010`). Empty groups are omitted; unmatched regions appear last under `other` (Other regions). There is no built-in common/favorite regions list.

Membership follows the bundled CLDR territory-containment snapshot, assigning each region to one continent (for example, RU to Europe and TR to Asia), rather than splitting cross-continent countries by geometry. For this seven-continent presentation, AQ is explicitly assigned to Antarctica instead of CLDR’s Outlying Oceania. CLDR is only needed during data generation, not at runtime.
