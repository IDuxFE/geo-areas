---
index: 3
title: 数据元信息
---

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

每次更新的检查日志 `.cache/update-report.json` 属于开发工具输出，不随 npm 包发布，不属于上述对外数据接口。数据来源、更新与第三方使用条款见[数据来源与许可](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/README.zh.md)。
