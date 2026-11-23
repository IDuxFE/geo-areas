# @idux/geo-areas API

English | [简体中文](API.zh.md)

Public JavaScript/TypeScript interfaces and data formats, matching the package exports. All data is a packaged snapshot; counts, names and map coverage can change after updates. Consult the installed version's manifest.

## 1. Entry points

| Entry                | Exports                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `@idux/geo-areas`    | All runtime APIs and public types below, except the manifest default export    |
| `/countries`         | `countries`, `getCountry`, `getCountryOptions`                                 |
| `/phone`             | `phoneRegions`, `getPhoneRegion`, `getRegionsByCallingCode`, `getPhoneOptions` |
| `/china`             | `chinaAreas`, `chinaAreaTree`, `getChinaArea`, `getChinaAreaOptions`           |
| `/subdivisions`      | `subdivisions`, `getSubdivisions`                                              |
| `/geojson`           | `availableMaps`, `hasGeoJSON`, `loadGeoJSON`, `localizeGeoJSON`; type `MapId`  |
| `/types`             | Public data types below, excluding `MapId`; use `import type`                  |
| `/manifest`          | Default JSON export typed as `DataManifest`                                    |
| `/geojson/<id>.json` | Default raw map JSON typed as `MapGeoJSON`                                     |

Paths beginning with `/` are relative to `@idux/geo-areas`. The package is ESM and requires Node.js 22+. Browser projects use a bundler. Maps are separate ESM imports without runtime external-data services.

```ts
import { getCountry } from '@idux/geo-areas/countries'
import type { Country, ChinaArea, MapGeoJSON } from '@idux/geo-areas/types'
import type { MapId } from '@idux/geo-areas/geojson'
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }
```

## 2. Shared conventions

```ts
export type Locale = 'zh-CN' | 'en'

export type AdministrativeLevel = 'country' | 'province' | 'city' | 'district'

export interface LocalizedName {
  'zh-CN': string
  en: string
}

export type Coordinate = [longitude: number, latitude: number]
```

- Functions accepting `locale` default to `zh-CN`. Only the two declared locales are supported; arbitrary strings have no runtime validation or fallback guarantee.
- Country, administrative and calling codes are strings, retaining leading zeros. Different systems such as `CN` and `100000` are not interchangeable.
- Global first-level subdivisions use `province`; China continues with `city` and `district`. Country/territory entities use `country`.
- Names retain both languages. Display values may fall back to upstream original names or pinyin as described below.
- Coordinates are upstream decimal-degree `[longitude, latitude]` values. Coordinate systems are neither inferred nor converted; sources are not guaranteed to align for surveying or navigation.
- Required `null` fields indicate unavailable upstream data, not zero coordinates, empty text or a replacement field. Optional fields may be absent; absent children do not establish that administrative children do not exist.
- Missing single-item queries return `undefined`; collection queries return `[]`; unknown map loads reject.
- Only explicitly described normalization occurs. Queries do not trim whitespace; China codes and map IDs are not zero-padded.
- `readonly` arrays are a TypeScript constraint, not a runtime freeze. Queries share entry references; copy before editing.

## 3. Countries and regions

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

export function getCountryOptions(locale?: Locale): {
  value: string
  label: string
  level: 'country'
}[]
```

- `countries`: the full country/territory catalogue.
- `getCountry(code)`: accepts alpha-2, alpha-3 or numeric strings. Letters are case-insensitive; numeric strings are padded to three digits. Numbers are not accepted by the declared type. No match returns `undefined`.
- `getCountryOptions(locale = 'zh-CN')`: a new array with `value = code`, `label = name[locale]` and `level = 'country'`; calling codes are excluded.

## 4. Calling codes

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

export function getPhoneOptions(locale?: Locale): {
  value: string
  label: string
  callingCode: string
}[]
```

- `phoneRegions`: all supported telephone regions.
- `getPhoneRegion(countryCode)`: case-insensitive region lookup; no alpha-3/numeric aliases; returns `undefined` if absent.
- `getRegionsByCallingCode(callingCode)`: accepts `+1` or `1` (adds `+`), returning all matching regions or `[]`. Does not parse complete phone numbers.
- `getPhoneOptions(locale = 'zh-CN')`: new options with `value = countryCode`, `label = name[locale] + ' (' + callingCode + ')'`, plus `callingCode`. No `level` field.

## 5. Chinese administrative divisions

Import from `/china` or the main entry.

```ts
export interface ChinaArea {
  adcode: string
  parentCode: string | null
  level: AdministrativeLevel
  name: LocalizedName
  englishNameKind: 'english' | 'pinyin'
  center: Coordinate | null
  centroid: Coordinate | null
  children?: ChinaArea[]
}
```

| Field             | Meaning                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `adcode`          | Six-digit code; country root is `100000`                                                              |
| `parentCode`      | Parent adcode; provinces reference `100000`; only the root is `null`                                  |
| `level`           | Root `country`, then `province`, `city`, `district`                                                   |
| `name`            | Upstream Chinese administrative name; English prefers a matched upstream name, otherwise pinyin       |
| `englishNameKind` | `english` means an upstream match; `pinyin` is automatic transliteration, not an official translation |
| `center`          | DataV administrative center or `null`; not a separately maintained capital POI dataset                |
| `centroid`        | DataV geometric center or `null`; does not substitute for `center` or vice versa                      |
| `children`        | Optional child nodes preserving the Vant hierarchy; usually absent on leaves                          |

```ts
export interface AreaOption {
  value: string
  label: string
  level: AdministrativeLevel
  children?: AreaOption[]
}
```

`AreaOption.value` is `adcode`, `label` is the selected name, and `level` matches the node. Recursive options omit coordinates, parent codes and English-name provenance.

```ts
export const chinaAreas: readonly ChinaArea[]
export const chinaAreaTree: ChinaArea

export function getChinaArea(adcode: string | number): ChinaArea | undefined

export function getChinaAreaOptions(locale?: Locale, depth?: 1 | 2 | 3): AreaOption[]
```

- `chinaAreas`: full tree starting at provinces, excluding the country root.
- `chinaAreaTree`: root `100000`, `parentCode = null`, `level = 'country'`, both coordinates `null`. Its children share data with `chinaAreas`.
- `getChinaArea(adcode)`: converts to a string, then matches exactly, including the root; missing values return `undefined`.
- `getChinaAreaOptions(locale = 'zh-CN', depth = 3)`: builds new options from provinces, excluding the root. Depth 1 includes provinces, 2 adds cities, 3 adds districts. Omits `children` at the depth limit or when no children exist.

Virtual municipality city nodes are retained: Beijing includes `110000 → 110100 → 110101`. Tree and boundary sources differ; a node does not guarantee a same-code map. Use `hasGeoJSON` before drill-down. District boundaries are generally city-map features, not separate district files.

## 6. Global first-level subdivisions

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

## 7. GeoJSON maps

Import from `/geojson` or the main entry.

```ts
export type MapId = GeneratedMapId | 'china'
```

`GeneratedMapId` is internal. IDs are case-sensitive; their format alone does not guarantee coverage. `china` aliases `CN-provinces` and supports both loader and direct JSON imports. `availableMaps` includes the alias; `manifest.coverage.maps` lists source assets only.

| ID                      | Content                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `world`                 | ECharts global overview                                                                                      |
| Six-digit adcode        | DataV China national/province/city map; some are outlines only                                               |
| Country code, e.g. `US` | Natural Earth independent country/territory outline, not its subdivisions                                    |
| `<code>-provinces`      | Available Natural Earth non-China first-level subdivision boundaries                                         |
| `china`                 | Alias of `CN-provinces`; registering under ECharts' `china` map name adds its built-in South China Sea inset |
| `CN-provinces`          | ECharts 3.8.5 China province map, a special source for this suffix                                           |

`100000` has 34 province features and a South China Sea inset. `CN-provinces` has 34 province features without that inset. Their sources differ. `CN` is an independent country outline, not a province overview. Outline-only maps appear in `coverage.chinaOutlineOnlyMaps`.

```ts
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'

export interface MapProperties {
  name: string
  names: LocalizedName
  code: string
  adcode?: string
  countryCode?: string
  level?: AdministrativeLevel
  center?: Coordinate
  centroid?: Coordinate
  [key: string]: unknown
}

export type MapGeoJSON = FeatureCollection<Polygon | MultiPolygon, MapProperties>
```

The top-level type is `FeatureCollection`; features have type `Feature`, the properties above and non-null Polygon/MultiPolygon geometry. Standard optional fields such as `id`/`bbox` remain optional.

| Property             | Meaning                                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | Current display label; raw JSON defaults to Chinese, loaders/localization follow `locale`                                                                        |
| `names`              | Both languages, retained during localization                                                                                                                     |
| `code`               | Stable feature code: adcode, alpha-2 or ISO 3166-2 where mapped; some features retain source identifiers rather than ISO codes                                   |
| `adcode`             | Optional China administrative code; not necessarily in the Vant tree                                                                                             |
| `countryCode`        | Optional parent country/region code; not present in every source                                                                                                 |
| `level`              | Optional administrative level; auxiliary inset geometry has no invented level                                                                                    |
| `center`, `centroid` | Optional upstream coordinates; unlike required nullable `ChinaArea` fields, they may be omitted                                                                  |
| Other keys           | Source extensions typed as `unknown`, such as `boundarySource`, `sourceName`, `administrativeType`, `chineseName` or DataV fields; narrow their types before use |

Polygon coordinates are rings of positions (outer ring first, then holes). MultiPolygon adds a polygon-array level. Geometry positions follow GeoJSON `number[]`, rather than the fixed two-item `Coordinate`; longitude precedes latitude.

```ts
export const availableMaps: MapId[]

export function hasGeoJSON(id: string): id is MapId
export function hasGeoJSON(id: number): boolean

export function loadGeoJSON(id: MapId, locale?: Locale): Promise<MapGeoJSON>

export function localizeGeoJSON(map: MapGeoJSON, locale?: Locale): MapGeoJSON
```

- `availableMaps`: all registered IDs without loading all geometry. Treat the unfrozen array as read-only.
- `hasGeoJSON(id)`: uses `String(id)` without changing case. The string overload narrows to `MapId`; the numeric overload returns only boolean.
- `loadGeoJSON(id, locale = 'zh-CN')`: imports a registered map and returns a localized deep copy. Each result is independent; its declared input is a `MapId` string.
- `localizeGeoJSON(map, locale = 'zh-CN')`: deep-copies a conforming input and sets each feature's `name = names[locale]`. Does not mutate input or validate/fill arbitrary third-party `names`.

Unknown IDs reject with `Error('Unknown map: <id>')`; import failures propagate. Registration does not guarantee that the runtime can load the file.

```ts
import map from '@idux/geo-areas/geojson/370000.json' with { type: 'json' }
// map: MapGeoJSON; Chinese name by default, both languages in names
```

Direct imports do not localize or create a new copy per access. The runtime/bundler must support JSON imports. Missing paths fail resolution/loading; wildcard type declarations do not establish file existence. Use `loadGeoJSON` or `localizeGeoJSON` for independent mutable results.

ECharts matches by name by default; match the current label language, or use `nameProperty: 'code'`:

```ts
import * as echarts from 'echarts'
import { loadGeoJSON } from '@idux/geo-areas/geojson'

echarts.registerMap('china', await loadGeoJSON('china'))
const series = {
  type: 'map',
  map: 'china',
  nameProperty: 'code',
  data: [{ name: '370000', value: 100 }],
}
```

## 8. Data manifest

Default-import from `/manifest`; import types from the main entry or `/types`.

```ts
export interface DataSourceSnapshot {
  url: string
  sha256: string
  firstRetrievedAt: string
}

export interface ChinaMapCoverage {
  code: string
  names: LocalizedName
  /** Vant administrative tree level where available; may differ from DataV hierarchy. */
  level: AdministrativeLevel
  parentCode: string | null
  fullEndpointStatus: 'available' | 'not-found' | 'error'
  fullHttpStatus: number | null
  fullUrl: string
  sourceUrl: string
  content: 'children' | 'outline'
  hasChildBoundaries: boolean
  featureCount: number
  featureLevels: AdministrativeLevel[]
  childMapIds: string[]
}

export interface DataManifest {
  schemaVersion: number
  updatedAt: string
  fingerprint: string
  packages: Record<string, string>
  icu: string
  cldr: string
  sources: DataSourceSnapshot[]
  coverage: {
    countries: number
    phoneRegions: number
    subdivisions: number
    countriesWithoutWorldGeometry: string[]
    subdivisionsWithoutChineseTranslation: string[]
    chinaAreas: number
    chinaAreasWithoutCenter: string[]
    chinaAreasUsingPinyin: number
    chinaAreasWithoutBoundary: string[]
    dataVAdcodesAbsentFromVant: string[]
    maps: string[]
    chinaMapDepth: 'province' | 'prefecture'
    chinaOutlineOnlyMaps: string[]
    chinaMaps: ChinaMapCoverage[]
    chinaMapsWithoutFull: string[]
    chinaMapsWithFullErrors: string[]
  }
}
```

All fields above are required. Empty gap arrays mean no corresponding gap was found in the current snapshot.

| Field                        | Meaning                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion`              | Manifest schema version, currently 3; interpret fields according to version                                             |
| `updatedAt`                  | Snapshot generation time, ISO 8601 UTC; not the most recent check time                                                  |
| `fingerprint`                | SHA-256 of source metadata and generated contents, including transformation changes but excluding retrieval/check times |
| `packages`                   | Data-generation dependency versions, not the complete runtime dependency list                                           |
| `icu`, `cldr`                | Generation environment versions; npm data dependency versions are in `packages`                                         |
| `sources`                    | Direct-download metadata, without geometry contents                                                                     |
| `sources[].url`              | Source URL                                                                                                              |
| `sources[].sha256`           | Hex SHA-256 content digest                                                                                              |
| `sources[].firstRetrievedAt` | First retrieval time of this content version, ISO 8601 UTC; preserved while unchanged                                   |

### Coverage fields

| Field                                       | Meaning                                                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `countries`, `phoneRegions`, `subdivisions` | Catalogue sizes; subdivisions are deduplicated                                                                    |
| `countriesWithoutWorldGeometry`             | Country codes absent as independent code features in the world overview; independent outline maps may still exist |
| `subdivisionsWithoutChineseTranslation`     | Subdivision codes with `chineseName === null`                                                                     |
| `chinaAreas`                                | China tree node count, excluding the runtime `100000` root                                                        |
| `chinaAreasWithoutCenter`                   | Tree adcodes missing DataV administrative centers, excluding the root                                             |
| `chinaAreasUsingPinyin`                     | Count of tree nodes with `englishNameKind === 'pinyin'`                                                           |
| `chinaAreasWithoutBoundary`                 | Tree adcodes absent from collected DataV features; not a list of missing same-name map files                      |
| `dataVAdcodesAbsentFromVant`                | Six-digit DataV codes absent from the Vant tree, including source convention differences                          |
| `maps`                                      | Packaged source map IDs (`string[]`), excluding the `china` alias                                                 |
| `chinaMapDepth`                             | `province`: national/province maps; `prefecture`: also city maps; not tree pruning depth                          |
| `chinaOutlineOnlyMaps`                      | Map IDs using own-outline `.json` after `_full.json` failure; not completed child boundaries                      |
| `chinaMaps`                                 | Requested China-map coverage records; no unprobed district endpoints                                              |
| `chinaMapsWithoutFull`                      | `_full.json` HTTP 404 map IDs, excluding other failures                                                           |
| `chinaMapsWithFullErrors`                   | IDs falling back after non-404 requests or validation failures                                                    |

### ChinaMapCoverage fields

| Field                | Meaning                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `code`, `names`      | Map adcode and localized names                                                                                                  |
| `level`              | Prefer Vant tree level, otherwise DataV own-feature level; e.g. Jiyuan may be `district` in the tree and `city` in map features |
| `parentCode`         | Parent code; root is `null`                                                                                                     |
| `fullEndpointStatus` | `available`: successful child endpoint; `not-found`: HTTP 404; `error`: other request/validation failure                        |
| `fullHttpStatus`     | Child endpoint HTTP status; `null` if unavailable, e.g. a network failure                                                       |
| `fullUrl`            | Requested `_full.json` URL                                                                                                      |
| `sourceUrl`          | Final source, possibly a fallback own-outline `.json`                                                                           |
| `content`            | `children` for child boundaries, `outline` for own outline                                                                      |
| `hasChildBoundaries` | Whether actual child boundaries exist; do not infer solely from URL suffix                                                      |
| `featureCount`       | All map features                                                                                                                |
| `featureLevels`      | Distinct child administrative feature levels                                                                                    |
| `childMapIds`        | Registered map IDs available for further drill-down                                                                             |

The developer log `.cache/update-report.json` is not packaged and is not part of this public API. See the [package guide](README.md) and [third-party notices](THIRD_PARTY_NOTICES.md) for sources, updates and usage terms.
