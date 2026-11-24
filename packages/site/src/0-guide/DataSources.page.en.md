---
index: 2
title: Data Sources and Licensing
type: page
---

# Data Sources and Licensing

## Sources and licensing

Code is MIT licensed; third-party data retains its own terms. Links below identify upstream sources and the license texts retained in the package.

| Source                                                                                                             | Data use                                              | License / notice                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Unicode CLDR](https://github.com/unicode-org/cldr-json)                                                           | Country names, code mappings and continent membership | [CLDR core](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/unicode-cldr-core.txt) / [localenames](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/unicode-cldr-localenames.txt) |
| [i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries)                                     | ISO country entries                                   | [MIT](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/i18n-iso-countries.txt)                                                                                                                              |
| [Vant area-data](https://github.com/vant-ui/vant/tree/main/packages/vant-area-data)                                | China administrative hierarchy                        | [MIT](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/vant-area-data.txt)                                                                                                                                  |
| [Google libphonenumber](https://github.com/google/libphonenumber)                                                  | Phone metadata via libphonenumber-js                  | [Apache-2.0](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/google-libphonenumber-Apache-2.0.txt)                                                                                                         |
| [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)                                           | Calling-code generation                               | [MIT](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/libphonenumber-js.txt)                                                                                                                               |
| [Apache ECharts repository test data](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json) | World overview                                        | [Apache-2.0](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/echarts-world-Apache-2.0.txt) / [NOTICE](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/echarts-world-NOTICE.txt)  |
| [Apache ECharts 3.8.5](https://raw.githubusercontent.com/apache/echarts/3.8.5/map/json/china.json)                 | CN-provinces overview, decoded to GeoJSON             | [BSD-3-Clause](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/echarts-3.8.5-BSD-3-Clause.txt)                                                                                                             |
| [Natural Earth](https://github.com/nvkelso/natural-earth-vector)                                                   | Country outlines and non-China subdivisions           | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/)                                                                                                                                                                |
| [pinyin-pro](https://github.com/zh-lx/pinyin-pro)                                                                  | Pinyin fallback, not official translations            | [MIT](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/pinyin-pro.txt)                                                                                                                                      |
| [DataV GeoAtlas](https://datav.aliyun.com/portal/school/atlas/area_selector)                                       | China administrative centers and boundaries           | [Review upstream terms before use](https://help.aliyun.com/zh/datav/datav-6-0/user-guide/datav-geoatlas-widget/)                                                                                                                     |

Upstream projects maintain the data. This project acquires, transforms and validates it, preserving upstream geometry while normalizing identifiers and bilingual names. No handwritten data tables are maintained. The packaged manifest records source URLs, versions, hashes and coverage gaps.

## World map source

`world` uses [`test/data/map/json/world.json`](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json) from the `master` branch of the Apache ECharts repository. The update script downloads the corresponding [GitHub Raw file](https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json) directly.

Generation preserves valid upstream polygon coordinates, removes empty polygon members, and adds country/territory codes, bilingual names and the original `sourceName`. The packaged `world.json` therefore differs from the upstream file at the byte level. Independent country outlines such as `CN` and `US` still come from Natural Earth, rather than being extracted from this world overview.

The licensing basis is the upstream [LICENSE](https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/LICENSE) and [NOTICE](https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/NOTICE). The repository declares Apache-2.0; its listed separate-license exceptions do not include this world map, and no additional license declaration was found in its directory hierarchy. This package retains the corresponding license and attribution notice. The code, name and empty-polygon transformations above are this project's modifications to the original file.

## Coverage and limitations

The [China map drill-down coverage list](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/CHINA_MAP_COVERAGE.md) details coverage by region, regions without child-boundary endpoints, and links to their own outline JSON files.

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
