# Geo Areas

[English](README.md) | 简体中文

[![CI](https://github.com/IDuxFE/geo-areas/actions/workflows/ci.yml/badge.svg)](https://github.com/IDuxFE/geo-areas/actions/workflows/ci.yml)
[![CodeQL](https://github.com/IDuxFE/geo-areas/actions/workflows/codeql.yml/badge.svg)](https://github.com/IDuxFE/geo-areas/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/IDuxFE/geo-areas/branch/main/graph/badge.svg)](https://codecov.io/gh/IDuxFE/geo-areas)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FIDuxFE%2Fgeo-areas.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FIDuxFE%2Fgeo-areas?ref=badge_shield)

面向 JavaScript 和 TypeScript 应用的地理参考数据，提供国家／地区选项、国际电话呼叫码、行政区划层级，以及按需加载的 GeoJSON 地图。

适用于表单中的地区选择、国际电话区号选择，以及地图展示与区域下钻。数据包与 UI 框架无关，提供 ESM 模块和 TypeScript 类型声明；示例站点使用的 Vue、iDux 和 ECharts 均按需另行安装。

## 核心能力

| 能力           | 适用场景                                       | 主要接口                                                               |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| 国家与地区     | 国家选择、代码查询、按洲分组的选项             | `getCountry`、`getCountryOptions`、`getGroupedCountryOptions`          |
| 国际电话呼叫码 | 电话地区选择、共享呼叫码反查                   | `getPhoneOptions`、`getGroupedPhoneOptions`、`getRegionsByCallingCode` |
| 中国行政区划   | 省 → 市 → 区县级联选择、adcode 查询            | `getChinaAreaOptions`、`getChinaArea`、`chinaAreaTree`                 |
| 全球一级行政区 | 州、省及同级行政区选择                         | `getSubdivisions`                                                      |
| GeoJSON 边界   | 世界与区域地图展示，在有边界数据的地区逐级下钻 | `loadGeoJSON`、`hasGeoJSON`、`availableMaps`                           |
| 中英文名称     | 统一切换选项和地图的显示语言                   | `setLocale`、`getLocale`                                               |
| 数据来源追溯   | 查询当前快照的来源版本、哈希和覆盖信息         | `/manifest`                                                            |

[在线示例](https://iduxfe.github.io/geo-areas/) · [完整 API 文档](API.zh.md)

## 安装

项目正在准备首次 npm 发布，发布前可通过仓库工作区体验示例。发布后，可使用任一包管理器安装：

```sh
npm install @idux/geo-areas
# 或
pnpm add @idux/geo-areas
```

浏览器应用使用支持 ESM 的构建工具；Node.js 脚本需要 20.19 及以上版本。浏览器消费者无需 Node.js 运行时。可通过独立入口导入应用实际需要的数据集。

## 快速上手

### 国家与地区选择

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getCountry, getCountryOptions, getGroupedCountryOptions } from '@idux/geo-areas/countries'

setLocale('zh-CN')

const options = getCountryOptions()
// 中国对应：{ value: 'CN', label: '中国', level: 'country' }

const groups = getGroupedCountryOptions()
// [{ value: '142', label: '亚洲', children: [...] }, ...]

const china = getCountry('CHN') // 也支持 'CN' 和 '156'。
console.log(china?.name['zh-CN']) // '中国'
```

普通选项使用 `value` 和 `label`，分组选项增加 `children` 数组，可按所用选择器的字段约定进行适配。洲分组基于 CLDR 归属，南极洲单独成组，空分组会被省略。

### 国际电话地区选择

```ts
import { getPhoneOptions, getRegionsByCallingCode } from '@idux/geo-areas/phone'

const options = getPhoneOptions()
// 中国对应：{ value: 'CN', label: '中国 (+86)', callingCode: '+86' }

const regions = getRegionsByCallingCode('+1')
// 多个地区共用 +1，应使用地区代码作为选项唯一标识。
```

需要按洲分组时使用 `getGroupedPhoneOptions()`。这些接口提供参考元数据，电话号码解析与有效性校验需使用专门的电话处理库。

### 中国省市区级联选择

```ts
import { getChinaAreaOptions, getChinaArea } from '@idux/geo-areas/china'

const options = getChinaAreaOptions() // 省 → 市 → 区县。
const provinces = getChinaAreaOptions(1) // 仅省级。
const cities = getChinaAreaOptions(2) // 省 → 市。

const district = getChinaArea('110101')
console.log(district?.name['zh-CN']) // '东城区'
```

选项包含 `value`（adcode）、`label`、`level` 和可选的 `children`。`chinaAreas` 从省级开始；需要国家根节点时，可使用 `chinaAreaTree`。

### 全球一级行政区

```ts
import { getSubdivisions } from '@idux/geo-areas/subdivisions'

const states = getSubdivisions('US')
const california = states.find((area) => area.code === 'US-CA')
console.log(california?.name.en) // 'California'
```

行政区记录保留所属国家代码、中英文名称和上游行政区类型。文字记录与地图边界的覆盖范围可能不同。

### 加载和展示地图

```ts
import { hasGeoJSON, loadGeoJSON } from '@idux/geo-areas/geojson'

const world = await loadGeoJSON('world')
const china = await loadGeoJSON('CN-provinces')

if (hasGeoJSON('US-provinces')) {
  const states = await loadGeoJSON('US-provinces')
  console.log(states.features.length)
}
```

`china` 是 `CN-provinces` 的别名，DataV 全国地图通过 `100000` 单独提供。实现下钻导航前，可使用 `availableMaps` 或 `hasGeoJSON` 检查当前快照支持的地图 ID。

使用 ECharts 展示时，另行安装 `echarts`，注册已加载的地图：

```ts
import { init, registerMap, use } from 'echarts/core'
import { GeoComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { loadGeoJSON } from '@idux/geo-areas/geojson'

use([GeoComponent, CanvasRenderer])
registerMap('world', await loadGeoJSON('world'))

// 页面中提供一个可见、已设置宽高的容器。
const element = document.getElementById('map')!
const chart = init(element)
chart.setOption({ geo: { map: 'world', roam: true } })
// 容器尺寸变化时调用 chart.resize()；页面销毁时调用 chart.dispose()。
```

地图从包内资源异步加载，无需调用外部地理数据服务；浏览器构建中可能通过网络加载对应的资源分块。每次 `loadGeoJSON` 调用均返回独立的本地化副本。

## 语言配置

初始语言为 `zh-CN`，支持 `zh-CN` 和 `en`。应用启动时通过 `setLocale` 统一设置；选项生成和地图加载接口读取共享语言，不接收语言参数。

切换语言只影响后续调用。已有界面需要重新生成选项或加载地图；原始记录的 `name` 和原始地图的 `properties.names` 始终保留双语名称。使用响应式框架时，应将应用的语言状态与这些调用关联。服务端的语言状态由同一包实例共享，应避免在并发请求中按请求切换全局语言。

完整类型、子路径入口和异常行为见 [API 文档](API.zh.md)，数据覆盖及第三方条款见[数据来源与许可](packages/geo-areas/README.zh.md)。

## 本地开发

开发数据包或运行示例站点需要 Node.js 20.x（20.19 及以上）或 22.12 及以上版本，以及 pnpm 10（仓库固定为 10.34.9，以保证依赖补丁哈希可复现）。

```sh
pnpm install --frozen-lockfile
pnpm start
pnpm site:build
pnpm check
pnpm test:coverage
```

运行 `pnpm update:data` 从公开上游刷新数据。站点构建产物位于 `packages/site/dist`。

`pnpm lint` 使用 Oxlint 检查源码；`pnpm format` 使用 Oxfmt 格式化，`pnpm format:check` 检查格式。Husky 和 lint-staged 在提交前检查暂存文件。生成数据、来源清单和第三方许可证快照保留原始格式。

## 打包与变更说明

根工作区和站点均为私有包，仅发布 `packages/geo-areas` 中的数据包。

```sh
pnpm check
pnpm --dir packages/geo-areas pack
```

打包产物包含运行时数据、文档、许可证和来源说明。`prepack` 自动执行构建、测试及消费者类型检查。CI 还会构建站点并上传预览包，不发布 npm。

在代码完成评审、确认准备发布时，再统一整理变更说明、版本号和 CHANGELOG。发布 PR 与发包流程见[维护者配置](.github/MAINTAINERS.md)。

## 数据与许可证

项目代码采用 MIT 许可证。第三方数据适用各自条款，见[来源说明](packages/geo-areas/README.zh.md)。自动依赖扫描不能替代地图数据再分发授权确认。

全球总览使用 [Apache ECharts 仓库的 `world.json`](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json)，更新程序直接从 GitHub Raw 获取。中国省级地图可选择 DataV `100000` 或 ECharts 3.8.5 `china`（`CN-provinces` 别名）。覆盖范围和下钻编码见[数据包说明](packages/geo-areas/README.zh.md)。

## 参与贡献

Fork 仓库后创建分支，向 `IDuxFE/geo-areas:main` 提交 PR。`main` 禁止直接修改，合并前须通过 CI 并解决评审讨论；维护者使用 rebase 合并。

检查命令和 Changesets 用法见 [CONTRIBUTING.md](CONTRIBUTING.md)，漏洞报告方式见 [SECURITY.md](SECURITY.md)。
