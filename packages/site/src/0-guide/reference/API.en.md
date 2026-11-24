---
index: 2
title: Conventions (English)
---

Public JavaScript/TypeScript interfaces and data formats, matching the package exports. All data is a packaged snapshot; counts, names and map coverage can change after updates. Consult the installed version's manifest.

## Entry points

| Entry                | Exports                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| `@idux/geo-areas`    | All runtime APIs and public types below, except the manifest default export                              |
| `/locale`            | `setLocale`, `getLocale`                                                                                 |
| `/countries`         | `countries`, `getCountry`, `getCountryOptions`, `getGroupedCountryOptions`                               |
| `/phone`             | `phoneRegions`, `getPhoneRegion`, `getRegionsByCallingCode`, `getPhoneOptions`, `getGroupedPhoneOptions` |
| `/china`             | `chinaAreas`, `chinaAreaTree`, `getChinaArea`, `getChinaAreaOptions`                                     |
| `/subdivisions`      | `subdivisions`, `getSubdivisions`                                                                        |
| `/geojson`           | `availableMaps`, `hasGeoJSON`, `loadGeoJSON`, `localizeGeoJSON`; type `MapId`                            |
| `/types`             | Public data types below, excluding `MapId`; use `import type`                                            |
| `/manifest`          | Default JSON export typed as `DataManifest`                                                              |
| `/geojson/<id>.json` | Default raw map JSON typed as `MapGeoJSON`                                                               |

Paths beginning with `/` are relative to `@idux/geo-areas`. The package uses ESM. Browser projects use a bundler; Node.js environments support 20.19+. Maps load asynchronously on demand from bundled data, without external data services.

```ts
import { getCountry } from '@idux/geo-areas/countries'
import type { Country, ChinaArea, MapGeoJSON } from '@idux/geo-areas/types'
import type { MapId } from '@idux/geo-areas/geojson'
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }
```

## Shared conventions

```ts
export type Locale = 'zh-CN' | 'en'

export type AdministrativeLevel = 'country' | 'province' | 'city' | 'district'

export interface LocalizedName {
  'zh-CN': string
  en: string
}

export type Coordinate = [longitude: number, latitude: number]

export interface OptionGroup<T> {
  value: string
  label: string
  children: T[]
}
```

- Option generation, map loading and localization APIs all read `getLocale()`, initially `zh-CN`, and do not accept locale arguments. Only the two declared locales are supported; arbitrary strings have no runtime validation or fallback guarantee.
- Country, administrative and calling codes are strings, retaining leading zeros. Different systems such as `CN` and `100000` are not interchangeable.
- Global first-level subdivisions use `province`; China continues with `city` and `district`. Country/territory entities use `country`.
- Names retain both languages. Display values may fall back to upstream original names or pinyin as described below.
- Coordinates are upstream decimal-degree `[longitude, latitude]` values. Coordinate systems are neither inferred nor converted; sources are not guaranteed to align for surveying or navigation.
- Required `null` fields indicate unavailable upstream data, not zero coordinates, empty text or a replacement field. Optional fields may be absent; absent children do not establish that administrative children do not exist.
- Missing single-item queries return `undefined`; collection queries return `[]`; unknown map loads reject.
- Only explicitly described normalization occurs. Queries do not trim whitespace; China codes and map IDs are not zero-padded.
- `readonly` arrays are a TypeScript constraint, not a runtime freeze. Queries share entry references; copy before editing.

### Shared locale configuration

Import from `/locale` or the main entry.

```ts
export function setLocale(locale: Locale): void
export function getLocale(): Locale
```

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getCountryOptions } from '@idux/geo-areas/countries'
import { loadGeoJSON } from '@idux/geo-areas/geojson'

setLocale('en') // Configure once at application startup.
getCountryOptions() // English labels.
await loadGeoJSON('world') // English map names.
```

The main entry and subpath imports share the same default within one package instance. Changes apply to subsequent calls; existing results and raw bilingual data/JSON remain unchanged. Rebuild options or reload maps after switching languages. `loadGeoJSON` captures the locale when called, before awaiting its import. For China option depth, use `getChinaAreaOptions(2)`. Locale configuration is package-instance state shared by all calls within that instance.
