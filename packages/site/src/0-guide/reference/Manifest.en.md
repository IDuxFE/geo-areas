---
index: 4
title: Data metadata (English)
---

## Data metadata (Manifest)

Inspect the current data version, sources and coverage. `manifest` is a metadata object shipped with the package, containing the generation time, data fingerprint, source versions, coverage and gaps.

Default-import from `@idux/geo-areas/manifest`:

```ts
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }

console.log(manifest.schemaVersion, manifest.updatedAt, manifest.fingerprint)
console.log(manifest.coverage.maps)
```

### Type definitions

The following TypeScript interfaces describe the object's structure. Import types from the main entry or `/types`.

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

The developer log `.cache/update-report.json` is not packaged and is not part of this public API. See the [data sources and licensing](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/README.md) for sources, updates and usage terms.
