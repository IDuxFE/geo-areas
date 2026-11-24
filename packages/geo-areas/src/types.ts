import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'

/** Recursive readonly view of exported reference snapshots. */
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }

export type Locale = 'zh-CN' | 'en'
/** States, provinces, regions and equivalent admin-1 units normalize to province. */
export type AdministrativeLevel = 'country' | 'province' | 'city' | 'district'
export interface LocalizedName {
  'zh-CN': string
  en: string
}
/** Longitude, latitude in decimal degrees. No coordinate-system conversion is applied. */
export type Coordinate = [longitude: number, latitude: number]
export interface Country {
  level: 'country'
  code: string
  alpha3: string
  numeric: string
  name: LocalizedName
}
export interface PhoneRegion {
  /** ISO alpha-2 plus libphonenumber's AC/TA/XK extensions. Use as the unique option key. */
  countryCode: string
  name: LocalizedName
  /** E.164 country calling code; shared codes intentionally repeat. */
  callingCode: string
}
export interface Subdivision {
  level: 'province'
  /** Original upstream unit type, e.g. State, Province, Canton, Region. */
  administrativeType: string | null
  code: string
  countryCode: string
  name: LocalizedName
  /** A missing upstream Chinese translation remains null rather than a fabricated translation. */
  chineseName: string | null
  /** Natural Earth representative label point, not a capital location. */
  center: Coordinate | null
}
export interface ChinaArea {
  adcode: string
  parentCode: string | null
  level: AdministrativeLevel
  name: LocalizedName
  /** Upstream English where available; otherwise explicitly marked pinyin transliteration. */
  englishNameKind: 'english' | 'pinyin'
  center: Coordinate | null
  centroid: Coordinate | null
  children?: ChinaArea[]
}
export interface MapProperties {
  name: string
  names: LocalizedName
  code: string
  adcode?: string
  countryCode?: string
  /** Auxiliary inset features have no administrative level. */
  level?: AdministrativeLevel
  center?: Coordinate
  centroid?: Coordinate
  [key: string]: unknown
}
export type MapGeoJSON = FeatureCollection<Polygon | MultiPolygon, MapProperties>
export interface AreaOption {
  value: string
  label: string
  level: AdministrativeLevel
  children?: AreaOption[]
}
export interface DataSourceSnapshot {
  url: string
  sha256: string
  firstRetrievedAt: string
}
/** Requested DataV map coverage; absent district ids have not been probed. */
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
    /** Only HTTP 404s, not transient network/server/validation failures. */
    chinaMapsWithoutFull: string[]
    chinaMapsWithFullErrors: string[]
  }
}

/** A localized option group; empty groups are omitted by grouped option APIs. */
export interface OptionGroup<T> {
  value: string
  label: string
  children: T[]
}
