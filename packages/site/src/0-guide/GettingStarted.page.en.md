---
index: 0
title: Getting started
type: page
---

# iDux Geo Areas

Geographic reference data for JavaScript and TypeScript applications: country and region selectors, international calling codes, administrative hierarchies, and GeoJSON maps loaded on demand.

Use the data with your own UI or mapping library. The package is framework-independent and ships ESM modules with TypeScript declarations; Vue, iDux and ECharts power the example site and are installed separately when needed.

## Capabilities

| Capability                      | What you can build                                                      | Main APIs                                                              |
| ------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Countries and regions           | Country selectors, code lookup and options grouped by continent         | `getCountry`, `getCountryOptions`, `getGroupedCountryOptions`          |
| International calling codes     | Telephone region selectors and calling-code lookup                      | `getPhoneOptions`, `getGroupedPhoneOptions`, `getRegionsByCallingCode` |
| China administrative divisions  | Province → city → district cascaders and adcode lookup                  | `getChinaAreaOptions`, `getChinaArea`, `chinaAreaTree`                 |
| Global first-level subdivisions | State, province and equivalent administrative selectors                 | `getSubdivisions`                                                      |
| GeoJSON boundaries              | World and regional maps, with drill-down where boundaries are available | `loadGeoJSON`, `hasGeoJSON`, `availableMaps`                           |
| Chinese and English labels      | Consistent display names across options and maps                        | `setLocale`, `getLocale`                                               |
| Source traceability             | Inspect source versions, hashes and coverage for the installed snapshot | `/manifest`                                                            |

[Explore the examples](https://iduxfe.github.io/geo-areas/) · [Full API reference](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/API.md)

## Installation

The package is being prepared for its first npm release. Until it is published, use the repository workspace to try the examples. Once available on npm, install it with your preferred package manager:

```sh
npm install @idux/geo-areas
# or
pnpm add @idux/geo-areas
```

Use an ESM-compatible bundler for browser applications, or Node.js 20.19+ for server-side scripts. Browser consumers do not need a Node.js runtime. Import individual entry points to select the datasets your application uses.

## Quick start

### Country and region selectors

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getCountry, getCountryOptions, getGroupedCountryOptions } from '@idux/geo-areas/countries'

setLocale('en')

const options = getCountryOptions()
// China: { value: 'CN', label: 'China', level: 'country' }

const groups = getGroupedCountryOptions()
// [{ value: '142', label: 'Asia', children: [...] }, ...]

const china = getCountry('CHN') // Also accepts 'CN' and '156'.
console.log(china?.name.en) // 'China'
```

Flat options use `value` and `label`; grouped options add a `children` array. Adapt these fields to your select component. Continent groups follow CLDR membership with Antarctica as a separate group; empty groups are omitted.

### Telephone region selectors

```ts
import { getPhoneOptions, getRegionsByCallingCode } from '@idux/geo-areas/phone'

const options = getPhoneOptions()
// China: { value: 'CN', label: 'China (+86)', callingCode: '+86' }

const regions = getRegionsByCallingCode('+1')
// Multiple regions share +1; use the region code as the option key.
```

For grouped selectors, use `getGroupedPhoneOptions()`. These APIs provide reference metadata; use a telephone-number library when you need number parsing or validation.

### China province, city and district selectors

```ts
import { getChinaAreaOptions, getChinaArea } from '@idux/geo-areas/china'

const options = getChinaAreaOptions() // Province → city → district.
const provinces = getChinaAreaOptions(1) // Province only.
const cities = getChinaAreaOptions(2) // Province → city.

const district = getChinaArea('110101')
console.log(district?.name['zh-CN']) // '东城区'
```

Each option has `value` (adcode), `label`, `level` and optional `children`. `chinaAreas` starts at province level; `chinaAreaTree` adds the country root when your UI needs it.

### Global first-level subdivisions

```ts
import { getSubdivisions } from '@idux/geo-areas/subdivisions'

const states = getSubdivisions('US')
const california = states.find((area) => area.code === 'US-CA')
console.log(california?.name.en) // 'California'
```

Subdivisions retain their country code, bilingual names and upstream administrative type. Availability of subdivision records and map boundaries may differ.

### Load and display a map

```ts
import { hasGeoJSON, loadGeoJSON } from '@idux/geo-areas/geojson'

const world = await loadGeoJSON('world')
const china = await loadGeoJSON('CN-provinces')

if (hasGeoJSON('US-provinces')) {
  const states = await loadGeoJSON('US-provinces')
  console.log(states.features.length)
}
```

`china` is an alias of `CN-provinces`; DataV's national map is available separately as `100000`. Use `availableMaps` or `hasGeoJSON` to check the installed snapshot's map IDs before building drill-down navigation.

To display the data with ECharts, install `echarts` separately and register the loaded map:

```ts
import { init, registerMap, use } from 'echarts/core'
import { GeoComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { loadGeoJSON } from '@idux/geo-areas/geojson'

use([GeoComponent, CanvasRenderer])
registerMap('world', await loadGeoJSON('world'))

// Provide a visible element with explicit dimensions.
const element = document.getElementById('map')!
const chart = init(element)
chart.setOption({ geo: { map: 'world', roam: true } })
// Call chart.resize() when its container changes size; chart.dispose() on teardown.
```

Maps are loaded asynchronously from package assets, without calls to an external geographic-data service. In browser builds, loading a map may fetch its generated asset chunk. Each `loadGeoJSON` call returns an independent localized copy.

## Language configuration

The initial locale is `zh-CN`; supported values are `zh-CN` and `en`. Configure it once at application startup with `setLocale`. Options and map-loading APIs read the shared locale and do not accept a locale argument.

Changing the locale affects subsequent calls. Regenerate options or reload maps to update existing views; raw records retain both names in `name`, and raw map JSON retains them in `properties.names`. Frameworks should connect their reactive locale state to these calls. On servers, locale state is shared within a package instance: avoid changing it per concurrent request.

For complete types, subpath exports and error behavior, see the [API reference](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/API.md). Data coverage and third-party terms are described in the [sources and licensing guide](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/README.md#sources-and-licensing).
