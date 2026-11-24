---
index: 3
title: API (English)
---

## Countries and regions

Import from `/countries` or the main entry.

```ts
export interface Country {
  level: 'country'
  code: string
  alpha3: string
  numeric: string
  name: LocalizedName
}
```

`level` is always `country`. `code` is the unique uppercase ISO 3166-1 alpha-2 code, `alpha3` its uppercase three-letter code and `numeric` the three-digit ISO numeric string, including leading zeros. `name` contains display names. Entries include territories; the count is not a count of sovereign states.

```ts
export const countries: readonly Country[]

export function getCountry(code: string): Country | undefined

export function getCountryOptions(): {
  value: string
  label: string
  level: 'country'
}[]
```

- `countries`: the full country/territory catalogue.
- `getCountry(code)`: accepts alpha-2, alpha-3 or numeric strings. Letters are case-insensitive; numeric strings are padded to three digits. Numbers are not accepted by the declared type. No match returns `undefined`.
- `getCountryOptions()`: a new array with `value = code`, `label = name[getLocale()]` and `level = 'country'`; calling codes are excluded.

### Options grouped by continent

```ts
import { getGroupedCountryOptions } from '@idux/geo-areas/countries'

const groups = getGroupedCountryOptions()
// { value: '142', label: 'Asia', children: [...] }[]
```

`getGroupedCountryOptions()` returns `OptionGroup<ReturnType<typeof getCountryOptions>[number]>[]`. Each group has `value`, `label` and `children`; leaves retain all flat option fields and their relative order. Labels follow `getLocale()`. Each call returns new groups and leaf options.

Groups are ordered as Asia (`142`), Europe (`150`), North America (`003`, including Central America and the Caribbean), South America (`005`), Africa (`002`), Oceania (`009`), and Antarctica (`010`). Empty groups are omitted; unmatched regions appear last under `other` (Other regions). There is no built-in common/favorite regions list.

Membership follows the bundled CLDR territory-containment snapshot, assigning each region to one continent (for example, RU to Europe and TR to Asia), rather than splitting cross-continent countries by geometry. For this seven-continent presentation, AQ is explicitly assigned to Antarctica instead of CLDR’s Outlying Oceania. CLDR is only needed during data generation, not at runtime.

## Global first-level subdivisions

Import from `/subdivisions` or the main entry.

```ts
export interface Subdivision {
  level: 'province'
  administrativeType: string | null
  code: string
  countryCode: string
  name: LocalizedName
  chineseName: string | null
  center: Coordinate | null
}

export const subdivisions: readonly Subdivision[]

export function getSubdivisions(countryCode: string): Subdivision[]
```

| Field                | Meaning                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `level`              | Always `province`, the normalized first-level subdivision                                             |
| `administrativeType` | Upstream type such as State, Province or Canton; `null` if missing                                    |
| `code`               | Upstream ISO 3166-2 code such as `US-CA`, unique in the text catalogue                                |
| `countryCode`        | Uppercase parent ISO alpha-2 code                                                                     |
| `name`               | Chinese/English where available, otherwise original upstream name                                     |
| `chineseName`        | Original Chinese translation or `null`, indicating display fallback                                   |
| `center`             | Natural Earth representative label point or `null`; neither a capital location nor geometric centroid |

`subdivisions` exposes all text records. `getSubdivisions(countryCode)` filters case-insensitively, returns a new array of shared records or `[]`, and does not accept alpha-3/numeric aliases. It provides neither global second-level divisions nor boundary geometry. Text coverage exceeds boundary coverage; it does not guarantee a `<countryCode>-provinces` map.
