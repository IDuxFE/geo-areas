---
index: 1
title: API
---

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
