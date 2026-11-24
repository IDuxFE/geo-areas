<!-- Generated from packages/site/src/ by pnpm docs:sync. Edit the site source documents, not this file. -->

# @idux/geo-areas API

[English](API.md) | 简体中文

本文定义数据包对外导出的 JavaScript / TypeScript API 和数据格式，对应当前源码及 `package.json` 的 `exports`。所有数据来自随包发布的快照；数据更新后，条目数量、名称和地图覆盖范围可能变化，以安装版本的 manifest 为准。

## 导入入口

| 入口                                | 导出内容                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `@idux/geo-areas`                   | 下述全部运行时 API 和类型；不包含 manifest 的默认导出                                                    |
| `@idux/geo-areas/locale`            | `setLocale`、`getLocale`                                                                                 |
| `@idux/geo-areas/countries`         | `countries`、`getCountry`、`getCountryOptions`、`getGroupedCountryOptions`                               |
| `@idux/geo-areas/phone`             | `phoneRegions`、`getPhoneRegion`、`getRegionsByCallingCode`、`getPhoneOptions`、`getGroupedPhoneOptions` |
| `@idux/geo-areas/china`             | `chinaAreas`、`chinaAreaTree`、`getChinaArea`、`getChinaAreaOptions`                                     |
| `@idux/geo-areas/subdivisions`      | `subdivisions`、`getSubdivisions`                                                                        |
| `@idux/geo-areas/geojson`           | `availableMaps`、`hasGeoJSON`、`loadGeoJSON`、`localizeGeoJSON`；类型 `MapId`                            |
| `@idux/geo-areas/types`             | 本文中的公共数据类型，不包含 `MapId`；使用 `import type`                                                 |
| `@idux/geo-areas/manifest`          | 默认导出 JSON 数据，类型为 `DataManifest`                                                                |
| `@idux/geo-areas/geojson/<id>.json` | 默认导出指定地图的原始双语 JSON，类型为 `MapGeoJSON`                                                     |

包采用 ESM，浏览器项目通过构建工具使用；Node.js 环境支持 20.19+。地图按需异步加载，数据随包提供，无需外部数据服务。

```ts
import { getCountry } from '@idux/geo-areas/countries'
import type { Country, ChinaArea, MapGeoJSON } from '@idux/geo-areas/types'
import type { MapId } from '@idux/geo-areas/geojson'
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }
```

## 通用数据约定

```ts
export type Locale = 'zh-CN' | 'en'

export type AdministrativeLevel = 'country' | 'province' | 'city' | 'district'

export interface LocalizedName {
  'zh-CN': string
  en: string
}

export type Coordinate = [longitude: number, latitude: number]

export interface OptionGroup<T> {
  value: string
  label: string
  children: T[]
}
```

| 约定     | 定义                                                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 语言     | 所有选项生成、地图加载和本地化接口统一读取 `getLocale()`，初始值为 `'zh-CN'`，接口不接收语言参数。仅支持简体中文和英文。没有对任意语言字符串的运行时校验或自动回退保证 |
| 编码     | 国家代码、行政区代码、电话呼叫码均返回字符串，保留前导零。不同编码体系不能直接等同，例如国家 `CN` 与中国根节点 `100000`                                                |
| 层级     | `country` 为国家／地区；全球州、省、邦等一级行政区统一为 `province`；中国后续层级为 `city`、`district`                                                                 |
| 双语名称 | `name` 对象包含两种语言，但中文字段可能是上游原名回退，英文字段可能是拼音，详见各类型                                                                                  |
| 坐标     | `[经度, 纬度]`，十进制度，保留上游值；不转换或推断坐标系。不同来源坐标不保证可直接叠加用于测绘或导航                                                                   |
| `null`   | 必填字段值为 `null` 表示缺少对应上游数据，不代表零坐标、空字符串或其他字段的替代值                                                                                     |
| `?`      | TypeScript 可选字段可能不存在。缺少 `children` 不应解释为现实中绝对没有下级行政区                                                                                      |
| 查询结果 | 单项未命中返回 `undefined`，集合查询未命中返回 `[]`；地图加载未命中返回 rejected Promise                                                                               |
| 输入处理 | 国家相关查询仅执行各函数说明的大小写／前缀处理，不会自动去除空格；中国代码和地图 ID 不做补零                                                                           |
| 数据引用 | 导出的原始快照在类型上深只读，并在运行时递归冻结。查询函数返回可独立编辑的副本，包括嵌套名称、坐标和子节点                                                             |

### 统一语言配置

从 `/locale` 或主入口导入。

```ts
export function setLocale(locale: Locale): void
export function getLocale(): Locale
```

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getCountryOptions } from '@idux/geo-areas/countries'
import { loadGeoJSON } from '@idux/geo-areas/geojson'

setLocale('en') // 应用启动时统一设置。
getCountryOptions() // 英文选项。
await loadGeoJSON('world') // 英文地图名称。
```

同一包实例内，主入口与各子入口共享默认语言。切换仅影响后续调用，已返回的结果和原始双语数据／JSON 保持原样；切换后需重新生成选项或加载地图。`loadGeoJSON` 在调用时确定语言，不受等待导入期间的切换影响。中国选项指定深度时调用 `getChinaAreaOptions(2)`。语言配置属于包实例级状态，同一实例中的调用共享该配置。

## 国家／地区

从 `@idux/geo-areas/countries` 或主入口导入。

### Country

```ts
import type { DeepReadonly } from '@idux/geo-areas/types'
export interface Country {
  level: 'country'
  code: string
  alpha3: string
  numeric: string
  name: LocalizedName
}
```

| 字段      | 含义                                          | 示例                               |
| --------- | --------------------------------------------- | ---------------------------------- |
| `level`   | 固定为 `'country'`                            | `'country'`                        |
| `code`    | ISO 3166-1 alpha-2 两位大写代码，条目唯一标识 | `'CN'`                             |
| `alpha3`  | ISO 3166-1 alpha-3 三位大写代码               | `'CHN'`                            |
| `numeric` | ISO 3166-1 三位数字字符串，保留前导零         | `'156'`、`'004'`                   |
| `name`    | 国家／地区的中英文展示名称                    | `{ 'zh-CN': '中国', en: 'China' }` |

国家列表包含 ISO 国家及地区，条目总数不能当作主权国家数量。

### 导出与签名

```ts
export const countries: DeepReadonly<Country[]>

export function getCountry(code: string): Country | undefined

export function getCountryOptions(): {
  value: string
  label: string
  level: 'country'
}[]
```

- `countries`：完整国家／地区列表。
- `getCountry(code)`：接受 alpha-2、alpha-3 或数字代码字符串。字母不区分大小写，数字字符串比较前会左补零至三位；未找到返回 `undefined`。参数类型不接受 number。
- `getCountryOptions()`：生成新的选项数组；`value = Country.code`，`label = Country.name[getLocale()]`，`level = 'country'`。不包含电话呼叫码。

```ts
getCountry('cn') // 中国 Country
getCountry('CHN') // 同一条目
getCountry('156') // 同一条目
getCountry('4')?.numeric // '004'
getCountry('ZZ') // undefined
setLocale('en') // 从 @idux/geo-areas/locale 导入，统一设置语言
getCountryOptions().find((item) => item.value === 'CN')
// { value: 'CN', label: 'China', level: 'country' }
```

### 按洲分组选项

```ts
import { getGroupedCountryOptions } from '@idux/geo-areas/countries'

const groups = getGroupedCountryOptions()
// { value: '142', label: '亚洲', children: [...] }[]
```

`getGroupedCountryOptions()` 返回 `OptionGroup<ReturnType<typeof getCountryOptions>[number]>[]`。每组包含 `value`、`label`、`children`；叶子保留平铺选项的全部字段和相对顺序。名称跟随 `getLocale()`，每次调用生成新的分组及叶子选项。

分组依次为亚洲（`142`）、欧洲（`150`）、北美洲（`003`，包含中美洲和加勒比地区）、南美洲（`005`）、非洲（`002`）、大洋洲（`009`）、南极洲（`010`）。省略空组；未匹配地区放在末尾的 `other`（其他地区）组。不内置「常用地区」名单。

归属采用随包发布的 CLDR 地区包含关系快照，每个地区只归一洲（例如 RU 属欧洲、TR 属亚洲），不按几何拆分跨洲国家。七大洲展示中特别将 AQ 归入南极洲，而非 CLDR 的大洋洲外围地区。CLDR 仅用于数据生成，无运行时依赖。

## 全球一级行政区

从 `@idux/geo-areas/subdivisions` 或主入口导入。

```ts
export interface Subdivision {
  level: 'province'
  administrativeType: string | null
  code: string
  countryCode: string
  name: LocalizedName
  chineseName: string | null
  center: Coordinate | null
}

export const subdivisions: DeepReadonly<Subdivision[]>

export function getSubdivisions(countryCode: string): Subdivision[]
```

| 字段                 | 含义                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| `level`              | 固定为 `'province'`，表示统一的一级行政层级                                   |
| `administrativeType` | 上游原始类型，例如 `'State'`、`'Province'`、`'Canton'`，缺失为 `null`         |
| `code`               | 上游 ISO 3166-2 行政区代码，例如 `'US-CA'`，在文字资料集合中唯一              |
| `countryCode`        | 所属国家／地区的 ISO alpha-2 大写代码，例如 `'US'`                            |
| `name`               | `'zh-CN'` 优先中文，否则上游原名；`en` 优先英文，否则上游原名                 |
| `chineseName`        | 上游提供的中文名，无翻译时为 `null`，可用于区分中文展示值是否发生回退         |
| `center`             | Natural Earth 代表性标注点，缺失为 `null`；不是首府／省会坐标，也不是几何中心 |

`subdivisions` 提供全部文字资料，`getSubdivisions(countryCode)` 按国家／地区筛选，不区分大小写，返回匹配条目的独立可编辑副本；未找到返回 `[]`。参数不接受 alpha-3／数字代码别名。此 API 不返回全球二级市县，也不返回边界几何。

```ts
const california = getSubdivisions('us').find((item) => item.code === 'US-CA')
california?.level // 'province'
getSubdivisions('ZZ') // []
```

文字资料覆盖范围大于一级行政区边界覆盖范围，不能依据此列表推定存在 `<countryCode>-provinces` 地图。

## 国际电话呼叫码

从 `@idux/geo-areas/phone` 或主入口导入。

### PhoneRegion

```ts
import type { DeepReadonly } from '@idux/geo-areas/types'
export interface PhoneRegion {
  countryCode: string
  name: LocalizedName
  callingCode: string
}
```

| 字段          | 含义                                                                 | 示例                                       |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `countryCode` | 地区唯一标识，ISO alpha-2 加 libphonenumber 的 `AC`、`TA`、`XK` 扩展 | `'US'`                                     |
| `name`        | 地区中英文名称                                                       | `{ 'zh-CN': '美国', en: 'United States' }` |
| `callingCode` | 带 `+` 的 E.164 国家呼叫码；多个地区可共享                           | `'+1'`                                     |

`countryCode` 可作选项唯一键，`callingCode` 不可作唯一键。此处的呼叫码不是城市区号或北美号码计划的地区前缀，例如牙买加返回 `'+1'`。扩展地区不保证能通过 `getCountry` 查到。

### 导出与签名

```ts
export const phoneRegions: DeepReadonly<PhoneRegion[]>

export function getPhoneRegion(countryCode: string): PhoneRegion | undefined

export function getRegionsByCallingCode(callingCode: string): PhoneRegion[]

export function getPhoneOptions(): {
  value: string
  label: string
  callingCode: string
}[]
```

- `phoneRegions`：全部受支持的电话地区。
- `getPhoneRegion(countryCode)`：按地区代码查询，不区分大小写；未找到返回 `undefined`。不接受 alpha-3 或数字国家代码作为别名。
- `getRegionsByCallingCode(callingCode)`：支持 `'+1'` 或 `'1'`；不带 `+` 时自动添加。返回共享该呼叫码的所有地区；未找到返回 `[]`。不解析完整电话号码。
- `getPhoneOptions()`：生成新选项；`value = countryCode`，`label = 名称 + ' (' + callingCode + ')'`，另保留 `callingCode`；无 `level` 字段。

```ts
getPhoneRegion('cn')?.callingCode // '+86'
getRegionsByCallingCode('1').map((item) => item.countryCode)
// 包含 US、CA、JM 等；返回所有匹配地区
setLocale('en') // 从 @idux/geo-areas/locale 导入，统一设置语言
getPhoneOptions().find((item) => item.value === 'CN')
// { value: 'CN', label: 'China (+86)', callingCode: '+86' }
```

### 按洲分组选项

```ts
import { getGroupedPhoneOptions } from '@idux/geo-areas/phone'

const groups = getGroupedPhoneOptions()
// { value: '142', label: '亚洲', children: [...] }[]
```

`getGroupedPhoneOptions()` 返回 `OptionGroup<ReturnType<typeof getPhoneOptions>[number]>[]`。每组包含 `value`、`label`、`children`；叶子保留平铺选项的全部字段和相对顺序。名称跟随 `getLocale()`，每次调用生成新的分组及叶子选项。

分组依次为亚洲（`142`）、欧洲（`150`）、北美洲（`003`，包含中美洲和加勒比地区）、南美洲（`005`）、非洲（`002`）、大洋洲（`009`）、南极洲（`010`）。省略空组；未匹配地区放在末尾的 `other`（其他地区）组。不内置「常用地区」名单。

归属采用随包发布的 CLDR 地区包含关系快照，每个地区只归一洲（例如 RU 属欧洲、TR 属亚洲），不按几何拆分跨洲国家。七大洲展示中特别将 AQ 归入南极洲，而非 CLDR 的大洋洲外围地区。CLDR 仅用于数据生成，无运行时依赖。

## 中国行政区划

从 `@idux/geo-areas/china` 或主入口导入。

### ChinaArea

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

| 字段              | 含义                                                                      |
| ----------------- | ------------------------------------------------------------------------- |
| `adcode`          | 六位行政区代码字符串，例如 `'370000'`；国家根节点为 `'100000'`            |
| `parentCode`      | 父节点 `adcode`；省级节点为 `'100000'`，仅国家根节点为 `null`             |
| `level`           | 国家根节点 `country`，其后为省 `province`、市 `city`、区县 `district`     |
| `name`            | 中文为上游行政名称；英文优先匹配上游英文，否则拼音转写                    |
| `englishNameKind` | `'english'` 为匹配到上游英文名；`'pinyin'` 为自动拼音转写，不代表官方译名 |
| `center`          | DataV 行政中心坐标；缺失为 `null`，不是独立维护的省会 POI 数据            |
| `centroid`        | DataV 几何中心坐标；缺失为 `null`，不会用 `center` 填充，反之亦然         |
| `children`        | 可选下级节点数组，保留 Vant 数据层级；叶节点通常不包含此字段              |

### AreaOption

```ts
export interface AreaOption {
  value: string
  label: string
  level: AdministrativeLevel
  children?: AreaOption[]
}
```

`value` 为 `adcode`，`label` 为所选语言名称，`level` 与行政节点一致，`children` 为递归选项。选项不包含原节点的坐标、父代码或英文来源标记。

### 导出与签名

```ts
export const chinaAreas: DeepReadonly<ChinaArea[]>
export const chinaAreaTree: DeepReadonly<ChinaArea>

export function getChinaArea(adcode: string | number): ChinaArea | undefined

export function getChinaAreaOptions(depth?: 1 | 2 | 3): AreaOption[]
```

| API                              | 行为                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `chinaAreas`                     | 从省级开始的完整树数组，不含国家根节点                                                                                                      |
| `chinaAreaTree`                  | 单个国家根节点，`adcode = '100000'`、`parentCode = null`、`level = 'country'`、两种中心坐标均为 `null`；`children` 与 `chinaAreas` 共享数据 |
| `getChinaArea(adcode)`           | 将参数转成字符串后精确匹配，包含国家根节点；未找到返回 `undefined`                                                                          |
| `getChinaAreaOptions(depth = 3)` | 从省级开始创建选项树，不含国家根节点；`1` 最多省级，`2` 最多省市，`3` 最多省市区；到达深度限制或无下级时省略 `children`                     |

```ts
getChinaArea(370000)?.name['zh-CN'] // '山东省'
getChinaArea('370102')?.parentCode // '370100'
getChinaArea('100000') === chinaAreaTree // true
getChinaArea('000000') // undefined
setLocale('en') // 从 @idux/geo-areas/locale 导入，统一设置语言
getChinaAreaOptions(1).find((item) => item.value === '370000')
// 只有 value、label、level，不包含 children
```

行政树保留直辖市等虚拟市节点，例如北京的树为 `110000 → 110100 → 110101`。行政树与地图分别来自不同上游，存在节点不等于存在同代码地图；下钻前应调用 `hasGeoJSON`。区县边界通常位于市级地图中，不单独提供每个区县的地图文件。

## GeoJSON 地图

从 `@idux/geo-areas/geojson` 或主入口导入。

### MapId 与地图覆盖

```ts
export type MapId = GeneratedMapId | 'china'
```

`MapId` 包含构建时生成的已打包 ID 字符串字面量联合类型及 `china` 别名；`GeneratedMapId` 为内部类型，不对外导出。ID 的格式不意味着对应地图一定存在，应以 `availableMaps`／`hasGeoJSON` 为准。ID 区分大小写。`china` 是 `CN-provinces` 的别名，复用相同数据和加载器，支持 `loadGeoJSON('china')` 和直接导入 `@idux/geo-areas/geojson/china.json`。`availableMaps` 包含该别名；`manifest.coverage.maps` 仅列出源地图资产。

| ID 格式            | 示例                               | 内容                                                                                                                      |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `world`            | `'world'`                          | 来自 [Apache ECharts 仓库测试数据](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json)的全球总览 |
| 六位 adcode        | `'100000'`、`'370000'`、`'370100'` | DataV 中国全国、省级或市级地图；部分为仅本级轮廓                                                                          |
| 国家／地区代码     | `'US'`、`'JP'`                     | Natural Earth 独立国家／地区轮廓，不是下级行政区地图                                                                      |
| `<code>-provinces` | `'US-provinces'`                   | Natural Earth 有覆盖的中国以外一级行政区边界                                                                              |
| `china`            | `'china'`                          | `CN-provinces` 的别名，注册为 ECharts `china` 时自动补上内置南海附图                                                      |
| `CN-provinces`     | `'CN-provinces'`                   | ECharts 3.8.5 中国省级地图，是上述后缀的特殊来源                                                                          |

`100000` 含 34 个省级要素和南海诸岛附图；`CN-provinces` 含 34 个省级要素，无南海诸岛附图。二者边界来源不同。`CN` 是独立国家轮廓，不能代替中国省级总览。仅轮廓地图清单见 `manifest.coverage.chinaOutlineOnlyMaps`。

### MapGeoJSON 与 MapProperties

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

顶层 `type` 固定为 `'FeatureCollection'`，`features` 为要素数组。每个要素的 `type` 为 `'Feature'`，`properties` 遵循上式，`geometry` 为非空的 `Polygon` 或 `MultiPolygon`。标准 GeoJSON 的 `id`、`bbox` 等可选字段依其类型定义，不应视为必填业务字段。

| 字段                             | 含义                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `properties.name`                | 当前展示名称。原始 JSON 默认中文；加载器和本地化函数读取 `getLocale()` 设置                                                                                        |
| `properties.names`               | 同时保留两种语言名称，本地化不会删除它                                                                                                                             |
| `properties.code`                | 要素代码。中国行政要素为 adcode、国家通常为 alpha-2、海外一级行政区通常为 ISO 3166-2；无法映射标准国家码的要素可能使用来源标识，不应全按 ISO 代码解析              |
| `properties.adcode`              | 可选，中国行政区代码；不保证能在 Vant 行政树中找到                                                                                                                 |
| `properties.countryCode`         | 可选，所属国家／地区代码；不是所有来源都提供                                                                                                                       |
| `properties.level`               | 可选，行政层级；南海附图等辅助几何不虚构行政层级                                                                                                                   |
| `properties.center` / `centroid` | 可选，保留来源坐标；不同于 `ChinaArea` 的必填可空字段，地图中可能直接省略                                                                                          |
| 其他属性                         | `unknown` 类型的来源扩展，例如 `boundarySource`、`sourceName`、`administrativeType`、`chineseName`、DataV 原始属性；不保证跨地图存在或格式一致，使用前自行收窄类型 |

`Polygon.coordinates` 为“环 → 坐标点”的嵌套数组，首环为外环、后续为内环；`MultiPolygon.coordinates` 再增加一层多边形数组。几何点遵循 GeoJSON `Position`（`number[]`）类型，不等同于固定两项的 `Coordinate` 类型。数据坐标按经度、纬度顺序使用。

### 导出与签名

```ts
export const availableMaps: MapId[]

export function hasGeoJSON(id: string): id is MapId
export function hasGeoJSON(id: number): boolean

export function loadGeoJSON(id: MapId): Promise<MapGeoJSON>

export function localizeGeoJSON(map: MapGeoJSON): MapGeoJSON
```

| API                    | 参数与结果                                                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `availableMaps`        | 全部已打包地图 ID，不加载全部几何；与 manifest 的 `coverage.maps` 对应。数组未冻结，调用方应作为只读清单使用                                        |
| `hasGeoJSON(id)`       | 按 `String(id)` 检查地图是否存在，不改大小写；字符串重载可将动态字符串收窄为 `MapId`，数字重载仅返回 boolean                                        |
| `loadGeoJSON(id)`      | 异步导入指定地图并返回本地化的深拷贝；每次结果独立，修改结果不会污染缓存。类型上只接受 `MapId` 字符串                                               |
| `localizeGeoJSON(map)` | 对符合 `MapGeoJSON` 结构的输入深拷贝，并逐要素设置 `name = names[getLocale()]`；返回独立副本，不修改输入，不校验或补全任意第三方 GeoJSON 的 `names` |

`loadGeoJSON` 遇到未知 ID 时 Promise 以 `Error('Unknown map: <id>')` 拒绝；导入文件失败时会透传加载异常。`hasGeoJSON` 只证明地图已登记，不保证运行环境能够成功加载文件。

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { hasGeoJSON, loadGeoJSON, localizeGeoJSON } from '@idux/geo-areas/geojson'

const id: string = '370000'
if (hasGeoJSON(id)) {
  setLocale('zh-CN')
  const chinese = await loadGeoJSON(id)
  setLocale('en')
  const english = localizeGeoJSON(chinese)
  // chinese 与 english 的名称和几何均不共享可变对象
}

hasGeoJSON(370000) // true；调用 loadGeoJSON 时仍应使用字符串
hasGeoJSON('us') // false；应使用 'US'
```

### 直接 JSON 导入与 ECharts 数据匹配

```ts
import map from '@idux/geo-areas/geojson/370000.json' with { type: 'json' }
// map: MapGeoJSON，properties.name 默认为中文，properties.names 保留双语
```

直接导入不会执行本地化或每次返回深拷贝；运行环境／构建工具必须支持对应 JSON 导入语法。不存在的文件路径会导致模块解析或加载失败，不能通过声明的通配路径推定文件实际存在。需要独立可修改数据时使用 `loadGeoJSON` 或 `localizeGeoJSON`。

ECharts 默认通过名称匹配数据，应与 `properties.name` 的语言一致。需要按代码匹配时设置 `nameProperty: 'code'`：

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

## 数据元信息（Manifest）

查看当前数据的版本、来源与覆盖情况。`manifest` 是随包发布的数据元信息对象，包含生成时间、数据指纹、来源版本、覆盖范围与缺失情况。

通过 `@idux/geo-areas/manifest` 默认导入：

```ts
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }

console.log(manifest.schemaVersion, manifest.updatedAt, manifest.fingerprint)
console.log(manifest.coverage.maps)
```

### 类型定义

以下 TypeScript 接口描述该对象的数据结构；类型通过主入口或 `/types` 导入。

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

以上字段均为必填；缺口数组为空表示当前统计中没有对应缺口。

| 字段                         | 含义                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| `schemaVersion`              | manifest 结构版本，当前生成格式为 `3`；消费者应按版本解释字段                             |
| `updatedAt`                  | 当前整体数据版本的生成时间，ISO 8601 UTC 字符串；不是最近一次检查时间                     |
| `fingerprint`                | 来源元数据及生成数据文件内容的 SHA-256 指纹；转换结果变化会改变指纹，获取／检查时间不参与 |
| `packages`                   | 参与数据生成的依赖包名称到版本号的映射，不是全部运行时依赖清单                            |
| `icu` / `cldr`               | 生成环境的 ICU／CLDR 版本字符串；npm 数据包版本另见 `packages`                            |
| `sources`                    | 直接下载来源的快照元数据数组，不包含几何正文                                              |
| `sources[].url`              | 来源 URL                                                                                  |
| `sources[].sha256`           | 来源内容的 SHA-256 十六进制摘要                                                           |
| `sources[].firstRetrievedAt` | 当前来源内容版本首次获取时间，ISO 8601 UTC 字符串；内容不变时保留                         |

| `coverage` 字段                         | 含义                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| `countries`                             | 国家／地区文字条目数，对应 `countries.length`                                              |
| `phoneRegions`                          | 电话地区条目数，对应 `phoneRegions.length`                                                 |
| `subdivisions`                          | 去重后的全球一级行政区文字条目数，对应 `subdivisions.length`                               |
| `countriesWithoutWorldGeometry`         | 未在 `world` 总览中找到独立国家代码要素的国家／地区代码；不表示独立轮廓地图也一定缺失      |
| `subdivisionsWithoutChineseTranslation` | 无上游中文翻译的一级行政区代码，对应 `chineseName === null`                                |
| `chinaAreas`                            | 中国省市区树全部节点数，不含运行时增加的 `100000` 国家根节点                               |
| `chinaAreasWithoutCenter`               | 缺少 DataV 行政中心坐标的行政树节点 adcode，不含国家根节点                                 |
| `chinaAreasUsingPinyin`                 | `englishNameKind === 'pinyin'` 的中国行政树节点数                                          |
| `chinaAreasWithoutBoundary`             | 未在收集的 DataV 边界要素中找到的行政树节点 adcode；不是“没有同名地图文件”的清单           |
| `dataVAdcodesAbsentFromVant`            | DataV 提供、但 Vant 行政树中不存在的六位 adcode，包含来源口径差异                          |
| `maps`                                  | 全部已打包地图 ID，仅列出源地图资产，不含 `china` 别名；字段类型为 `string[]`              |
| `chinaMapDepth`                         | `'province'` 表示生成全国和省级地图，`'prefecture'` 表示还生成市级地图；不是行政树裁剪深度 |
| `chinaOutlineOnlyMaps`                  | 下载 `_full.json` 失败后使用本级 `.json` 轮廓的中国地图 ID，不代表已补齐下级边界           |
| `chinaMaps`                             | 本次数据版本实际请求的中国地图覆盖记录，类型为 `ChinaMapCoverage[]`，不含未探测的区县接口  |
| `chinaMapsWithoutFull`                  | `_full.json` 返回 HTTP 404 的地图 ID；不包含其他临时错误                                   |
| `chinaMapsWithFullErrors`               | `_full.json` 因非 404 请求或校验错误而回退的地图 ID                                        |

`ChinaMapCoverage` 字段说明：

| 字段                 | 含义                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `code` / `names`     | 地图 adcode 与双语地区名称                                                                                  |
| `level`              | 优先采用 Vant 行政树层级；无法对应时采用 DataV 本级要素层级。例如济源市为 `district`，地图要素可能为 `city` |
| `parentCode`         | 父级代码，国家根节点为 `null`                                                                               |
| `fullEndpointStatus` | `'available'` 为下级接口成功，`'not-found'` 为 HTTP 404，`'error'` 为其他请求或校验失败                     |
| `fullHttpStatus`     | 下级接口 HTTP 状态码；网络错误等无状态码时为 `null`                                                         |
| `fullUrl`            | 请求的 `_full.json` 地址                                                                                    |
| `sourceUrl`          | 最终采用的数据来源地址，可能是回退后的本级 `.json`                                                          |
| `content`            | `'children'` 为包含下级边界，`'outline'` 为本级轮廓                                                         |
| `hasChildBoundaries` | 是否实际包含下级边界，不能仅依据接口后缀判断                                                                |
| `featureCount`       | 地图全部要素数量                                                                                            |
| `featureLevels`      | 下级行政要素层级的去重数组                                                                                  |
| `childMapIds`        | 下级要素中可继续打开的已打包地图 ID                                                                         |

每次更新的检查日志 `.cache/update-report.json` 属于开发工具输出，不随 npm 包发布，不属于上述对外数据接口。数据来源、更新与第三方使用条款见[数据来源与许可](README.zh.md)。
