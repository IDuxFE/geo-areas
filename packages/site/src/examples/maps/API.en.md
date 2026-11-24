---
index: 3
title: API (English)
---

## GeoJSON maps

Import from `/geojson` or the main entry.

```ts
export type MapId = GeneratedMapId | 'china'
```

`GeneratedMapId` is internal. IDs are case-sensitive; their format alone does not guarantee coverage. `china` aliases `CN-provinces` and supports both loader and direct JSON imports. `availableMaps` includes the alias; `manifest.coverage.maps` lists source assets only.

| ID                      | Content                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `world`                 | World overview from [Apache ECharts repository test data](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json) |
| Six-digit adcode        | DataV China national/province/city map; some are outlines only                                                                         |
| Country code, e.g. `US` | Natural Earth independent country/territory outline, not its subdivisions                                                              |
| `<code>-provinces`      | Available Natural Earth non-China first-level subdivision boundaries                                                                   |
| `china`                 | Alias of `CN-provinces`; registering under ECharts' `china` map name adds its built-in South China Sea inset                           |
| `CN-provinces`          | ECharts 3.8.5 China province map, a special source for this suffix                                                                     |

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
| `name`               | Current display label; raw JSON defaults to Chinese, loaders/localization follow `getLocale()`                                                                   |
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

export function loadGeoJSON(id: MapId): Promise<MapGeoJSON>

export function localizeGeoJSON(map: MapGeoJSON): MapGeoJSON
```

- `availableMaps`: all registered IDs without loading all geometry. Treat the unfrozen array as read-only.
- `hasGeoJSON(id)`: uses `String(id)` without changing case. The string overload narrows to `MapId`; the numeric overload returns only boolean.
- `loadGeoJSON(id)`: imports a registered map and returns a localized deep copy. Each result is independent; its declared input is a `MapId` string.
- `localizeGeoJSON(map)`: deep-copies a conforming input and sets each feature's `name = names[getLocale()]`. Does not mutate input or validate/fill arbitrary third-party `names`.

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
