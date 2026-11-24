---
index: 2
title: Guide
---

## Integrate province, city and district selection

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getChinaArea, getChinaAreaOptions } from '@idux/geo-areas/china'
import type { AreaOption } from '@idux/geo-areas/types'
import type { CascaderData } from '@idux/components/cascader'

function toCascaderData(options: AreaOption[]): CascaderData[] {
  return options.map(({ value, label, children }) => ({
    key: value,
    label,
    children: children && toCascaderData(children),
  }))
}

setLocale('en')
const options = toCascaderData(getChinaAreaOptions(3))
const area = getChinaArea('440305')
```

### Selection depth and saved values

A `depth` of `1` includes provinces only, `2` includes cities, and `3` includes districts. Actual levels follow the data's `children`; do not pad every path to three levels.

With `full-path` enabled, `IxCascader` returns a code path. Pass its final code to `getChinaArea` to read the selected node. Store adcodes as strings, clear details when selection is cleared, and show an empty state for unknown codes.

### Languages and map boundaries

Call `getChinaAreaOptions()` again when the application language changes to regenerate cascader options. `setLocale` does not rewrite existing options.

The administrative tree and map boundaries come from different sources. Finding an area does not guarantee a same-code map. Check with `hasGeoJSON` before loading; retain the current map or show an unavailable message when boundaries are missing. Center coordinates can be absent, and English names can be pinyin transliterations. Display the actual field values.

## Examples on this page

- Province/city/district selection and node details.
- Switch `depth=1/2/3` and optionally add the country root from `chinaAreaTree`. Structural changes clear the previous selection. The country root does not count toward `depth`, which always starts at the province level.
- The depth example allows selecting intermediate nodes, including the country root with code `100000` and `parentCode = null`.
