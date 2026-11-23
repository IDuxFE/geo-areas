# @idux/geo-areas

从公开上游自动生成的地理数据包。提供国家／地区、国际电话呼叫码、中国省市区、全球一级行政区，以及可传给 ECharts 的 GeoJSON。ESM + TypeScript；运行时不请求外网。

完整接口签名、数据字段和查询行为见 [API 文档](./API.md)。

本项目维护获取、转换、校验和发布代码，**不维护手写地理或电话数据表**。生成文件不应手工修改；错误应反馈到上游。

```sh
pnpm add @idux/geo-areas
```

```ts
import { getCountryOptions } from '@idux/geo-areas/countries'
import { getPhoneOptions, getRegionsByCallingCode } from '@idux/geo-areas/phone'
import { getChinaArea, getChinaAreaOptions } from '@idux/geo-areas/china'
import { getSubdivisions } from '@idux/geo-areas/subdivisions'

getCountryOptions('en') // { value: 'CN', label: 'China' }, …
getPhoneOptions('zh-CN') // value 是国家／地区代码，另有 callingCode
getRegionsByCallingCode('+1') // 美国、加拿大、牙买加等，保留各地区身份
getChinaAreaOptions('zh-CN') // 省 → 市 → 区县的级联选项
getChinaArea('370000') // 山东省，含 DataV 提供的 center、centroid
getSubdivisions('US') // 全球一级行政区资料，例如 US-CA
```

所有 `name` 都提供 `{ 'zh-CN': string, en: string }`；国家列表覆盖 ISO 3166-1 的国家和地区，不能将条目总数当作主权国家数量。代码字段保留字符串及前导零。电话额外包含 libphonenumber 支持的非 ISO 地区代码。

行政数据统一提供 `level: 'country' | 'province' | 'city' | 'district'`。全球州、省、邦等一级行政区统一为 `province`，并用 `administrativeType` 保留上游原始类型（例如 `State`、`Province`、`Canton`）。`chinaAreas` 从省开始；`chinaAreaTree` 提供 `country` 根节点（adcode `100000`）及完整下级树，`getChinaArea('100000')` 可获取该根节点。中国省级节点的 `parentCode` 为 `100000`。行政边界 GeoJSON 的 `properties.level` 保留相同层级；南海附图等辅助几何不虚构行政层级。

中国行政名称的 `en` 优先匹配 Natural Earth 的公开英文名；匹配不到时自动拼音转写，并标记 `englishNameKind: 'pinyin'`，不会把它声称为官方英文译名。全球一级行政区直接采用 Natural Earth 的中英文；上游无中文时展示原名，`chineseName: null`，并在 manifest 列出缺口。部分地区上游无边界或坐标时保留 `null`，不通过手工坐标表补齐。

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

地图通过独立 ESM 文件异步导入，不在主入口加载全部几何数据；没有运行时 CDN 依赖。`availableMaps` 枚举已打包地图，`hasGeoJSON(id)` 检查覆盖范围。`loadGeoJSON` 只接受生成的地图 ID，返回标准 GeoJSON 类型。每次返回独立副本，修改地图不会污染缓存。浏览器构建工具可据静态 import 路径拆分地图文件。

实体文件按代码命名：中国为 `100000.json`、`370000.json`、`632700.json` 等，全球为 `world.json`，单个国家／地区为 `US.json`、`JP.json` 等。Natural Earth 的 1:50m 一级行政区边界覆盖哪些国家，就自动生成对应的 `US-provinces.json` 等文件，不人工维护国家清单。全球一级行政区的文字资料比这一比例尺的边界覆盖更广，以 `availableMaps` 和 manifest 为准。

支持直接导入原始双语 JSON（默认 `properties.name` 为中文），无需通过加载器：

```ts
import yushu from '@idux/geo-areas/geojson/632700.json' with { type: 'json' }
import usa from '@idux/geo-areas/geojson/US.json' with { type: 'json' }
```

直接 JSON 导入同样有 GeoJSON 类型声明；需要英文显示或独立副本时使用 `loadGeoJSON`。

`properties.name` 随语言切换，`properties.names` 同时保留两种语言；`properties.code` 是稳定标识。ECharts 默认通过 name 匹配数据项，业务数据的名称需与当前语言一致，也可用 `nameProperty: 'code'` 按代码匹配：

```ts
echarts.registerMap('china', await loadGeoJSON('china'))
const series = {
  type: 'map',
  map: 'china',
  nameProperty: 'code',
  data: [{ name: '370000', value: 100 }],
}
```

全球总览 `world` 使用 [Apache ECharts 示例地图](https://echarts.apache.org/examples/data/asset/geo/world.json)，按地区代码提供中英文标签。独立国家／地区轮廓和中国以外的一级行政区地图仍来自 Natural Earth。总览与 ISO 名录的覆盖存在差异，部分未在总览中单独绘制的地区可通过独立地图访问，具体以 `availableMaps` 为准。

包中有两种中国省级地图，覆盖范围和边界口径不同。`china` 是 `CN-provinces` 的别名，复用相同数据和加载器；可用 `loadGeoJSON('china')` 或直接导入 `@idux/geo-areas/geojson/china.json`。注册为 ECharts 的 `china` 地图时，会自动补上内置南海诸岛附图。

| 地图 ID        | 来源与覆盖                                                                                                                          | 适用场景                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `100000`       | DataV，34 个省级要素和南海诸岛附图                                                                                                  | DataV 版总览，按 adcode 加载省、市地图                     |
| `CN-provinces` | [ECharts 3.8.5 中国地图](https://raw.githubusercontent.com/apache/echarts/3.8.5/map/json/china.json)，34 个省级要素，无南海诸岛附图 | Playground 的中国总览，按 adcode 下钻到 DataV 的省、市地图 |

这两份 GeoJSON 均未逐段与标准地图核验。需要按中国标准版图公开展示时，请使用[自然资源部标准地图服务](https://bzdt.tianditu.gov.cn/)提供的适用地图，或采用经审核的地图数据。

坐标均为 `[经度, 纬度]`，保持上游原值。`center` 是 DataV 标注的行政中心，`centroid` 是几何中心，两者不会互相填充。省级 `center` 可用于省会／行政中心标注，但不等同于独立维护的省会 POI 坐标。全球总览使用 ECharts 源文件的经纬度，独立国家轮廓和一级地区使用 Natural Earth 经纬度；DataV 中国地图沿用 DataV 原始坐标，`CN-provinces` 使用 ECharts 3.8.5 解码后的坐标，不推断或转换坐标系，不应直接混合用于测绘或导航。

## 中国地图支持深度

完整地区清单见 [中国地图下钻覆盖](./CHINA_MAP_COVERAGE.md)，该文件随每次数据更新生成并打入 npm 包。开发者可从公开 manifest 读取相同信息：

```ts
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }

const dongguan = manifest.coverage.chinaMaps.find((map) => map.code === '441900')
// fullEndpointStatus: available / not-found（404） / error（其他错误）
// hasChildBoundaries: 是否提供下级边界；childMapIds: 可继续打开的子地图
// featureLevels: 当前地图实际包含的下级边界层级
manifest.coverage.chinaMapsWithoutFull // 确认返回 404 的地区代码
manifest.coverage.chinaMapsWithFullErrors // 非 404 错误回退，不能认定无下级数据
```

`chinaOutlineOnlyMaps` 表示实际采用本级轮廓的地图，可能源于 404 或其他错误；不要把它直接当作“没有下一级”的清单。缺少 `_full.json` 只表示 DataV 未提供该地区的下级边界，不代表行政上没有下级单位。当前只请求全国、省和市级地图；区县边界作为市级地图要素提供，区县自身的 `_full.json` 未检查，镇街地图不在下载范围。

## 数据源与更新

| 数据                         | 公开上游                                                                 | 更新方式                     |
| ---------------------------- | ------------------------------------------------------------------------ | ---------------------------- |
| ISO 国家／地区及中英文       | Unicode 官方 CLDR 的名称与代码映射；i18n-iso-countries 提供 ISO 条目筛选 | 更新上游 npm 版本后生成      |
| 国际电话呼叫码               | Google libphonenumber 元数据，经 libphonenumber-js 维护发布              | 更新上游 npm 版本后生成      |
| 中国省市区层级               | `@vant/area-data` 的 `useCascaderAreaData()`                             | 更新 Vant 数据版本后生成     |
| 中国坐标与边界               | 阿里云 DataV GeoAtlas `areas_v3/bound/{adcode}_full.json`                | 按真实边界层级遍历请求       |
| 全球总览                     | Apache ECharts 示例 `world.json`                                         | 获取公开 GeoJSON 后生成      |
| 中国省级总览 `CN-provinces`  | Apache ECharts 3.8.5 `china.json`                                        | 获取固定版本并解码为 GeoJSON |
| 独立国家轮廓和海外一级行政区 | Natural Earth 官方数据仓库                                               | 获取最新公开 GeoJSON 后生成  |

这些来源由各自的上游组织或社区维护，更新频率取决于上游，并非实时政府公报订阅。Vant 层级与 DataV 边界分别记录，遇到虚拟市节点、区划变更或缺失区域时，不伪造对应关系。一级行政区不是全球二级市县全量数据。

```sh
pnpm install --frozen-lockfile
pnpm update:data            # 获取公网数据，全部成功且校验通过才替换快照
pnpm check                  # 构建、运行测试、消费者 TS 类型检查
pnpm --dir packages/geo-areas pack # 本地生成发布包
```

默认获取全国、省级与市级地图。每个 DataV 地图先请求 `{adcode}_full.json`，获取或校验失败后尝试 `{adcode}.json`，不因 `childrenNum: 0` 跳过请求。两者都失败则本次更新失败并保留原快照。无 `_full` 后缀的文件只表示本级轮廓，不代表已补齐下级边界；这些文件在 manifest 的 `chinaOutlineOnlyMaps` 中列出。市级地图包含区县边界，不单独下载每个区县文件。`pnpm update:data --province-only` 仅生成全国和各省地图（全球地图不受该选项影响）。`--cached` 显式使用已下载的本地缓存，适合下载失败后重试；定时更新不使用旧缓存。`pnpm update:data --cached --refresh-datav` 可复用全球源缓存，同时强制重新请求全部 DataV 地图接口。

`data-manifest.json` 保存来源 URL、SHA-256、数据依赖版本、ICU/CLDR 版本、更新时间及覆盖缺口。`updatedAt` 是当前整体数据版本的生成时间；每个直接下载来源的 `firstRetrievedAt` 是当前内容版本首次获取的时间，内容不变时保留。`fingerprint` 同时覆盖来源元数据及实际生成的数据文件内容，名称转换或几何处理结果变化也会改变指纹；获取／检查时间不参与指纹。完整刷新失败会返回非零状态，保留原快照；不会将不完整下载发布成新数据。

每次执行另写 `.cache/update-report.json`，记录本次 `checkedAt`、成功／失败、是否发生内容变化，以及每个来源实际缓存时间 `retrievedAt` 和获取方式 `network`／`cache`。每次请求失败（包括重试后恢复的请求）都在终端打印 URL 和原因，并写入 `requestFailures`；HTTP 错误保留状态码。并发请求会收集本批全部失败，最终失败时返回非零状态并保留快照，`details` 保留完整错误树。`sourceFallbacks` 记录从 `_full.json` 切换到 `.json` 的原因与最终结果，回退成功也保留原请求失败记录。这份检查日志不打进 npm 包、不制造无变化 PR；Actions 将其作为运行附件保存 30 天。发布包中的 manifest 可直接导入：

```ts
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }
console.log(manifest.updatedAt, manifest.packages, manifest.fingerprint)
```

GitHub Actions 每周一 UTC 02:23（北京时间 10:23）自动更新上游数据依赖，拉取数据、校验、创建更新 PR。需启用 Actions 的创建 PR 权限；如果组织禁止 `GITHUB_TOKEN` 创建 PR，需给该步骤配置具备对应权限的凭证。更新 PR 由维护者审阅并合并，不自动合并。

## 发布

对外发布前，需先解决[第三方说明中的地图数据再分发待确认项](./THIRD_PARTY_NOTICES.md#public-release-status)；当前发布脚本只提供技术流程，不表示数据授权已确认。

包名为 `@idux/geo-areas`。仓库接入 GitHub 后，在 npm 为该包配置 GitHub Actions Trusted Publisher，工作流文件填写 `publish.yml`，environment 填 `npm`。首次创建包需要拥有 `@idux` scope 发布权限的账号完成一次发布／配置。

升级数据包的 `packages/geo-areas/package.json` 版本并提交后推送同名标签（例如 `v0.1.0`），发布工作流会核对标签、重新校验、使用 OIDC provenance 发布。仅合并数据 PR 不会发布新版本。也可由有权限的维护者运行 `pnpm --dir packages/geo-areas publish --access public`。

代码为 MIT；第三方数据适用各自的条件，尤其 DataV 不应被本项目的 MIT 声明覆盖。见 [第三方来源说明](./THIRD_PARTY_NOTICES.md)。

全量数据源核对：在工作区运行 `pnpm audit:data`，逐项比对已记录哈希的本地源缓存、行政层级、地图代码与几何。检查范围和全部覆盖差异见 [数据核对报告](./audit/README.md)，逐项代码与名称见 [JSON 清单](./audit/data-audit.json)。该报告不替代现行行政区划认证。
