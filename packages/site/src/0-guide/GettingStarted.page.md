---
index: 0
title: 快速上手
type: page
---

# iDux Geo Areas

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

[在线示例](https://iduxfe.github.io/geo-areas/) · [完整 API 文档](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/API.zh.md)

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

完整类型、子路径入口和异常行为见 [API 文档](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/API.zh.md)，数据覆盖及第三方条款见[数据来源与许可](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/README.zh.md)。
