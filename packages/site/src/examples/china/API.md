---
index: 1
title: API
---

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
