<!-- Generated from packages/site/src/0-guide/GettingStarted*.md and DataSources*.md by pnpm docs:sync. Edit the site source documents, not this file. -->

# @idux/geo-areas

English | [简体中文](README.zh.md)

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

[Explore the examples](https://iduxfe.github.io/geo-areas/) · [Full API reference](API.md)

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

For complete types, subpath exports and error behavior, see the [API reference](API.md). Data coverage and third-party terms are described in the [sources and licensing guide](README.md#sources-and-licensing).

## Sources and licensing

Code is MIT licensed; third-party data retains its own terms. Links below identify upstream sources and the license texts retained in the package.

| Source                                                                                                             | Data use                                              | License / notice                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [Unicode CLDR](https://github.com/unicode-org/cldr-json)                                                           | Country names, code mappings and continent membership | [CLDR core](licenses/unicode-cldr-core.txt) / [localenames](licenses/unicode-cldr-localenames.txt)               |
| [i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries)                                     | ISO country entries                                   | [MIT](licenses/i18n-iso-countries.txt)                                                                           |
| [Vant area-data](https://github.com/vant-ui/vant/tree/main/packages/vant-area-data)                                | China administrative hierarchy                        | [MIT](licenses/vant-area-data.txt)                                                                               |
| [Google libphonenumber](https://github.com/google/libphonenumber)                                                  | Phone metadata via libphonenumber-js                  | [Apache-2.0](licenses/google-libphonenumber-Apache-2.0.txt)                                                      |
| [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)                                           | Calling-code generation                               | [MIT](licenses/libphonenumber-js.txt)                                                                            |
| [Apache ECharts repository test data](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json) | World overview                                        | [Apache-2.0](licenses/echarts-world-Apache-2.0.txt) / [NOTICE](licenses/echarts-world-NOTICE.txt)                |
| [Apache ECharts 3.8.5](https://raw.githubusercontent.com/apache/echarts/3.8.5/map/json/china.json)                 | CN-provinces overview, decoded to GeoJSON             | [BSD-3-Clause](licenses/echarts-3.8.5-BSD-3-Clause.txt)                                                          |
| [Natural Earth](https://github.com/nvkelso/natural-earth-vector)                                                   | Country outlines and non-China subdivisions           | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/)                                            |
| [pinyin-pro](https://github.com/zh-lx/pinyin-pro)                                                                  | Pinyin fallback, not official translations            | [MIT](licenses/pinyin-pro.txt)                                                                                   |
| [DataV GeoAtlas](https://datav.aliyun.com/portal/school/atlas/area_selector)                                       | China administrative centers and boundaries           | [Review upstream terms before use](https://help.aliyun.com/zh/datav/datav-6-0/user-guide/datav-geoatlas-widget/) |

Upstream projects maintain the data. This project acquires, transforms and validates it, preserving upstream geometry while normalizing identifiers and bilingual names. No handwritten data tables are maintained. The packaged manifest records source URLs, versions, hashes and coverage gaps.

## World map source

`world` uses [`test/data/map/json/world.json`](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json) from the `master` branch of the Apache ECharts repository. The update script downloads the corresponding [GitHub Raw file](https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json) directly.

Generation preserves valid upstream polygon coordinates, removes empty polygon members, and adds country/territory codes, bilingual names and the original `sourceName`. The packaged `world.json` therefore differs from the upstream file at the byte level. Independent country outlines such as `CN` and `US` still come from Natural Earth, rather than being extracted from this world overview.

The licensing basis is the upstream [LICENSE](https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/LICENSE) and [NOTICE](https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/NOTICE). The repository declares Apache-2.0; its listed separate-license exceptions do not include this world map, and no additional license declaration was found in its directory hierarchy. This package retains the corresponding license and attribution notice. The code, name and empty-polygon transformations above are this project's modifications to the original file.

## Coverage and limitations

The [China map drill-down coverage list](CHINA_MAP_COVERAGE.md) details coverage by region, regions without child-boundary endpoints, and links to their own outline JSON files.

- The country catalogue includes territories and is not a list of sovereign states. Non-China subdivisions cover the first administrative level; text and map coverage may differ.
- China maps cover national, province and city levels. District boundaries come from city maps; townships are excluded. Missing child boundaries do not imply no administrative children.
- Chinese administrative names use upstream English names where available, otherwise pinyin. Non-China subdivisions without Chinese translations retain their original names. Missing coordinates remain null.
- Coordinates retain upstream values without inferring or converting coordinate systems. Maps from different sources may not align.

## Updates

Every Monday at 01:00 Asia/Shanghai (Sunday 17:00 UTC), CI checks upstream sources, refreshes data, and runs validation and auditing. Changes create or update a single data-update PR; no changes produce no PR. Manual runs are also supported. Maintainers review and merge updates, and may accumulate changes before preparing a release. Update PRs do not generate Changesets or change package versions. Release notes, versioning and publishing are prepared separately after code review.

Data is a fixed snapshot shipped with each package version. Freshness depends on upstream releases and may lag administrative changes. Updates replace the snapshot only after successful acquisition and validation; failures preserve existing data.

`master` is a moving branch. Each update records the SHA-256 of the downloaded snapshot; `manifest.sources` contains the source URL, first retrieval time and hash. Before switching sources, the GitHub file was verified to be byte-identical to the previous website example file, so the download URL change did not alter map geometry.

## Usage notes

DataV-derived China boundaries and administrative coordinates come from GeoAtlas. See the [upstream documentation](https://help.aliyun.com/en/datav/datav-7-0/user-guide/datav-geoatlas-widgets/) for source information and applicable terms.

China maps have not been checked segment by segment against standard maps. For public display requiring an approved standard map, use the [Ministry of Natural Resources standard map service](https://bzdt.tianditu.gov.cn/) or reviewed data.
