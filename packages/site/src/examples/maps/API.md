---
index: 1
title: API
---

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
