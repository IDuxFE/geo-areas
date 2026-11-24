---
index: 3
title: API (English)
---

## Chinese administrative divisions

Import from `/china` or the main entry.

```ts
import type { DeepReadonly } from '@idux/geo-areas/types'
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
export const chinaAreas: DeepReadonly<ChinaArea[]>
export const chinaAreaTree: DeepReadonly<ChinaArea>

export function getChinaArea(adcode: string | number): ChinaArea | undefined

export function getChinaAreaOptions(depth?: 1 | 2 | 3): AreaOption[]
```

- `chinaAreas`: full tree starting at provinces, excluding the country root.
- `chinaAreaTree`: root `100000`, `parentCode = null`, `level = 'country'`, both coordinates `null`. Its children share data with `chinaAreas`.
- `getChinaArea(adcode)`: converts to a string, then matches exactly, including the root; missing values return `undefined`.
- `getChinaAreaOptions(depth = 3)`: builds new options from provinces, excluding the root. Depth 1 includes provinces, 2 adds cities, 3 adds districts. Omits `children` at the depth limit or when no children exist.

Virtual municipality city nodes are retained: Beijing includes `110000 → 110100 → 110101`. Tree and boundary sources differ; a node does not guarantee a same-code map. Use `hasGeoJSON` before drill-down. District boundaries are generally city-map features, not separate district files.
