---
index: 1
title: 通用约定
---

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
| 数据引用 | 原始数据数组的 `readonly` 仅为 TypeScript 约束，不是运行时冻结。查询返回共享条目引用；需要编辑时应先复制                                                               |

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
