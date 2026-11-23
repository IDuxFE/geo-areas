# @idux/geo-areas

English | [简体中文](README.zh.md)

Geographic data generated from public upstream sources: countries and regions, calling codes, Chinese administrative divisions, global first-level subdivisions and ECharts-ready GeoJSON. ESM with TypeScript declarations; no external requests at runtime.

See the [API reference](API.md) for complete signatures, fields and query behavior. The package is under development and has not been published to npm. Use it through the workspace until the first release.

This project maintains acquisition, transformation, validation and release tooling, **not handwritten geographic or telephone tables**. Do not edit generated snapshots manually; report source errors upstream.

## Usage

Once the package is published:

```sh
pnpm add @idux/geo-areas
```

```ts
import { getCountryOptions } from '@idux/geo-areas/countries'
import { getPhoneOptions, getRegionsByCallingCode } from '@idux/geo-areas/phone'
import { getChinaArea, getChinaAreaOptions } from '@idux/geo-areas/china'
import { getSubdivisions } from '@idux/geo-areas/subdivisions'

getCountryOptions('en') // { value: 'CN', label: 'China' }, …
getPhoneOptions('zh-CN') // country/region code as value; callingCode is separate
getRegionsByCallingCode('+1') // preserves individual region identities
getChinaAreaOptions('zh-CN') // province → city → district options
getChinaArea('370000') // Shandong, including DataV center and centroid
getSubdivisions('US') // first-level subdivisions such as US-CA
```

Names expose `{ 'zh-CN': string, en: string }`. Country entries follow ISO 3166-1 countries and territories; their count is not a count of sovereign states. Codes remain strings, including leading zeros. Phone metadata also includes non-ISO region codes supported by libphonenumber.

Administrative levels are `country | province | city | district`. Global first-level subdivisions use `province`; `administrativeType` retains the upstream type such as State, Province or Canton. `chinaAreas` starts at the province level. `chinaAreaTree` includes a country root (`100000`), also returned by `getChinaArea('100000')`. Province `parentCode` values reference that root. Administrative GeoJSON uses the same levels; auxiliary geometry is not assigned an invented administrative level.

English names for Chinese divisions prefer matching public Natural Earth names. Unmatched names use automatic pinyin with `englishNameKind: 'pinyin'`, rather than claiming official translations. Global subdivisions use Natural Earth names. Where Chinese names are missing, display falls back to the original name, `chineseName` is `null`, and the manifest records the gap. Missing upstream boundaries or coordinates remain `null`.

## ECharts GeoJSON

```ts
import * as echarts from 'echarts'
import { loadGeoJSON } from '@idux/geo-areas/geojson'

echarts.registerMap('world', await loadGeoJSON('world', 'en'))
echarts.registerMap('china', await loadGeoJSON('china', 'zh-CN'))
echarts.registerMap('shandong', await loadGeoJSON('370000', 'zh-CN'))
echarts.registerMap('yushu', await loadGeoJSON('632700', 'en'))
echarts.registerMap('usa', await loadGeoJSON('US', 'en'))
echarts.registerMap('us-states', await loadGeoJSON('US-provinces', 'en'))
```

Maps load through separate ESM imports, without loading all geometry in the main entry or using a runtime CDN. `availableMaps` enumerates packaged maps; `hasGeoJSON(id)` checks coverage. `loadGeoJSON` accepts generated map IDs and returns standard GeoJSON types. Each call returns an independent copy, so edits cannot pollute the cache. Bundlers can split the static import paths into separate chunks.

Files use stable code-based names such as `100000.json`, `370000.json`, `632700.json`, `world.json`, `US.json` and `JP.json`. Subdivision maps such as `US-provinces.json` are generated for countries covered by Natural Earth's 1:50m boundary dataset. Text metadata covers more subdivisions than the boundary dataset; consult `availableMaps` and the manifest.

Raw JSON contains both languages, with Chinese as the default `properties.name`:

```ts
import yushu from '@idux/geo-areas/geojson/632700.json' with { type: 'json' }
import usa from '@idux/geo-areas/geojson/US.json' with { type: 'json' }
```

Direct JSON imports also have GeoJSON declarations. Use the loader for English labels or independent copies. `properties.name` follows the selected language, `properties.names` retains both languages and `properties.code` is stable. ECharts matches data by name by default; match localized names or set `nameProperty: 'code'`:

```ts
echarts.registerMap('china', await loadGeoJSON('china'))
const series = {
  type: 'map',
  map: 'china',
  nameProperty: 'code',
  data: [{ name: '370000', value: 100 }],
}
```

The `world` overview uses [Apache ECharts example data](https://echarts.apache.org/examples/data/asset/geo/world.json), with labels assigned by region code. Individual country outlines and non-China subdivision maps use Natural Earth. Overview coverage differs from the ISO catalogue; some regions absent from the overview have individual maps. Check `availableMaps`.

There are two China province maps with different coverage and boundary conventions. `china` aliases `CN-provinces`, sharing its data and loader. Use `loadGeoJSON('china')` or import `@idux/geo-areas/geojson/china.json`. Registering it under the ECharts map name `china` adds ECharts' built-in South China Sea inset.

| Map ID         | Source and coverage                                                                                                                   | Usage                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `100000`       | DataV: 34 province features and a South China Sea inset                                                                               | DataV overview; load province/city maps by adcode                       |
| `CN-provinces` | [ECharts 3.8.5 China map](https://raw.githubusercontent.com/apache/echarts/3.8.5/map/json/china.json): 34 province features, no inset | Playground overview; drill down into DataV province/city maps by adcode |

Neither GeoJSON has been checked segment by segment against standard maps. If public display requires an approved standard map of China, use an appropriate map from the [Ministry of Natural Resources standard map service](https://bzdt.tianditu.gov.cn/) or reviewed map data.

Coordinates remain upstream `[longitude, latitude]` values. DataV `center` represents its administrative center and `centroid` its geometric center; neither fills gaps in the other. Province centers can be used as administrative-center markers but are not a separately maintained capital-city POI dataset. The world overview uses ECharts coordinates, independent country/subdivision maps use Natural Earth, DataV maps retain DataV coordinates, and `CN-provinces` uses decoded ECharts 3.8.5 coordinates. Coordinate systems are not inferred or converted; do not directly mix them for surveying or navigation.

## China drill-down coverage

[China map coverage](CHINA_MAP_COVERAGE.md) is regenerated with the data and included in the package. The same information is available in the public manifest:

```ts
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }

const dongguan = manifest.coverage.chinaMaps.find((map) => map.code === '441900')
// fullEndpointStatus: available / not-found (404) / error (other failures)
// hasChildBoundaries: whether child boundaries are provided
// childMapIds: maps available for further drill-down
// featureLevels: levels actually represented by this map
manifest.coverage.chinaMapsWithoutFull // confirmed 404 responses
manifest.coverage.chinaMapsWithFullErrors // other errors; not proof of missing data
```

`chinaOutlineOnlyMaps` lists maps using their own outlines after a 404 or another failure; it is not a list of areas with no administrative children. Missing `_full.json` only means DataV did not provide child boundaries. Acquisition covers national, province and city maps. Districts are features within city maps; district `_full.json` endpoints are not checked, and township maps are out of scope.

## Sources and updates

| Data                                                   | Public upstream                                                  | Update method                               |
| ------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------- |
| ISO country/region names and codes                     | Unicode CLDR; i18n-iso-countries filters ISO entries             | Update npm data dependencies and regenerate |
| Calling codes                                          | Google libphonenumber metadata through libphonenumber-js         | Update npm data dependencies and regenerate |
| China administrative hierarchy                         | `@vant/area-data` `useCascaderAreaData()`                        | Update Vant data and regenerate             |
| China coordinates and boundaries                       | Alibaba Cloud DataV GeoAtlas `areas_v3/bound/{adcode}_full.json` | Traverse the upstream boundary hierarchy    |
| World overview                                         | Apache ECharts example `world.json`                              | Fetch public GeoJSON and regenerate         |
| China overview `CN-provinces`                          | Apache ECharts 3.8.5 `china.json`                                | Fetch the fixed version and decode GeoJSON  |
| Individual country outlines and non-China subdivisions | Official Natural Earth data repository                           | Fetch public GeoJSON and regenerate         |

Updates depend on upstream maintainers, rather than real-time government announcements. Vant hierarchy and DataV boundaries are tracked separately; virtual city nodes, changes and missing areas do not lead to invented relationships. Global first-level subdivisions are not a complete global city/district dataset.

```sh
pnpm install --frozen-lockfile
pnpm update:data                  # fetch and validate before replacing snapshots
pnpm check                        # build, tests and consumer type checks
pnpm --dir packages/geo-areas pack # build a local archive without publishing
```

By default the updater requests national, province and city maps. For each DataV map it tries `{adcode}_full.json`, then `{adcode}.json` on acquisition or validation failure, regardless of `childrenNum: 0`. Failure of both preserves the existing snapshot and fails the update. Plain `.json` is an outline, not proof of complete child boundaries; these maps appear in `chinaOutlineOnlyMaps`. District features come from city maps; individual district files are not downloaded.

`pnpm update:data --province-only` limits China maps to national/province levels, without changing global maps. `--cached` explicitly reuses local downloads for retries; scheduled updates do not use stale caches. `pnpm update:data --cached --refresh-datav` reuses global caches but fetches all DataV map endpoints again.

`data-manifest.json` records source URLs, SHA-256 hashes, dependency and ICU/CLDR versions, generation time and coverage gaps. `updatedAt` is the snapshot generation time. Each direct source's `firstRetrievedAt` is preserved while that content remains unchanged. `fingerprint` covers source metadata and actual generated files, including name/geometry processing changes, but excludes retrieval/check times. Failed refreshes exit nonzero and preserve the previous snapshot.

Each attempt also writes `.cache/update-report.json` with `checkedAt`, success/failure, whether content changed, per-source `retrievedAt`, and `network`/`cache` acquisition mode. Failed requests, including retries that later recover, print their URL/reason and appear in `requestFailures`; HTTP status codes are retained. Concurrent batches collect all failures; the final `details` tree retains nested errors. `sourceFallbacks` records transitions from `_full.json` to `.json` and their outcomes. This log is excluded from npm archives and does not create no-change PRs. Actions retains it as an artifact for 30 days.

```ts
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }
console.log(manifest.updatedAt, manifest.packages, manifest.fingerprint)
```

On Mondays at 02:23 UTC, GitHub Actions refreshes upstream dependencies and data, validates them and opens a PR containing a patch Changeset. Actions needs permission to create PRs. If the organization blocks `GITHUB_TOKEN` PR creation, a separately authorized credential is required. Maintainers review and merge updates; no automatic merge or publication occurs. PRs opened with `GITHUB_TOKEN` may require a maintainer to close/reopen them to trigger PR CI.

## Releases

Before public package publication, resolve the [outstanding map redistribution checks](THIRD_PARTY_NOTICES.md#public-release-status). Build/publish tooling does not establish data licensing permission.

Changesets record future changes. Maintainers run `pnpm version:packages` from the workspace to prepare a release PR; this updates the package version and [CHANGELOG.md](CHANGELOG.md) without publishing. npm publishing is disabled by default through the `NPM_PUBLISH_ENABLED` repository variable, and the workflow is disabled in GitHub settings during development.

When publication is explicitly approved, enable the workflow and variable, configure an npm Trusted Publisher for `IDuxFE/geo-areas`, workflow `publish.yml`, environment `npm`, and confirm `@idux` scope permissions. The first package publication requires an authorized npm account. A matching `v<version>` tag then triggers version validation, checks, packaging and OIDC provenance publication. Merging data PRs alone does not publish.

Code is MIT licensed; third-party datasets have their own conditions, particularly DataV. See [third-party notices](THIRD_PARTY_NOTICES.md).

`pnpm audit:data` compares cached source hashes, hierarchy, map codes and geometry. See the [audit report](audit/README.md) and [JSON findings](audit/data-audit.json). These checks do not certify current administrative divisions.
