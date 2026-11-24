<!-- Generated from packages/site/src/0-guide/GettingStarted*.md and DataSources*.md by the package build. Edit the site source documents, not this file. -->

# @idux/geo-areas

[English](README.md) | 简体中文

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

完整类型、子路径入口和异常行为见 [API 文档](API.zh.md)，数据覆盖及第三方条款见[数据来源与许可](README.zh.md)。

## 数据来源与许可

代码采用 MIT；第三方数据保留各自条款，不受本项目 MIT 声明覆盖。下表链接提供上游来源与随包保留的许可证原文。

| 来源                                                                                                       | 数据用途                                  | 许可／声明                                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [Unicode CLDR](https://github.com/unicode-org/cldr-json)                                                   | 国家名称、代码映射与洲归属                | [CLDR core](licenses/unicode-cldr-core.txt) / [localenames](licenses/unicode-cldr-localenames.txt)           |
| [i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries)                             | ISO 国家条目筛选                          | [MIT](licenses/i18n-iso-countries.txt)                                                                       |
| [Vant area-data](https://github.com/vant-ui/vant/tree/main/packages/vant-area-data)                        | 中国省市区层级                            | [MIT](licenses/vant-area-data.txt)                                                                           |
| [Google libphonenumber](https://github.com/google/libphonenumber)                                          | 电话元数据，经 libphonenumber-js 发布     | [Apache-2.0](licenses/google-libphonenumber-Apache-2.0.txt)                                                  |
| [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)                                   | 生成国际电话呼叫码                        | [MIT](licenses/libphonenumber-js.txt)                                                                        |
| [Apache ECharts 仓库测试数据](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json) | 全球总览 world                            | [Apache-2.0](licenses/echarts-world-Apache-2.0.txt) / [NOTICE](licenses/echarts-world-NOTICE.txt)            |
| [Apache ECharts 3.8.5](https://raw.githubusercontent.com/apache/echarts/3.8.5/map/json/china.json)         | 中国省级总览 CN-provinces，解码为 GeoJSON | [BSD-3-Clause](licenses/echarts-3.8.5-BSD-3-Clause.txt)                                                      |
| [Natural Earth](https://github.com/nvkelso/natural-earth-vector)                                           | 独立国家轮廓与海外一级行政区              | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/)                                        |
| [pinyin-pro](https://github.com/zh-lx/pinyin-pro)                                                          | 中国名称拼音转写，非官方译名              | [MIT](licenses/pinyin-pro.txt)                                                                               |
| [DataV GeoAtlas](https://datav.aliyun.com/portal/school/atlas/area_selector)                               | 中国行政中心与边界                        | [使用前请自行查阅上游使用条款](https://help.aliyun.com/zh/datav/datav-6-0/user-guide/datav-geoatlas-widget/) |

数据由上游维护，本项目自动获取、转换和校验，保留上游几何并规范化标识与双语名称，不维护手写数据表。来源 URL、版本、哈希和覆盖缺口见随包 manifest。

## 世界地图来源

`world` 使用 Apache ECharts 仓库 `master` 分支的 [`test/data/map/json/world.json`](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json)。更新程序直接下载对应的 [GitHub Raw 文件](https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json)。

生成时保留上游有效多边形坐标，移除空多边形成员，并补充国家／地区代码、中英文名称及原始名称 `sourceName`。因此，包内生成的 `world.json` 与上游原始文件并非逐字节相同。独立国家轮廓（如 `CN`、`US`）仍来自 Natural Earth，不是从该全球总览中拆分。

许可依据为上游仓库的 [LICENSE](https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/LICENSE) 和 [NOTICE](https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/NOTICE)。仓库声明采用 Apache-2.0，列出的单独许可例外未包含该世界地图文件，其目录下也未发现额外许可声明。本包保留对应许可证和署名声明；上述代码、名称及空多边形处理属于本项目对原文件的修改。

## 覆盖与限制

[中国地图下钻覆盖清单](CHINA_MAP_COVERAGE.md)列出了逐地区下钻覆盖、未提供下级边界接口的地区，以及对应的本级轮廓 JSON 链接。

- 国家名录含地区，不等于主权国家清单；海外行政区只覆盖一级，文字资料与地图覆盖可能不同。
- 中国地图采集全国、省和市级；区县边界来自市级地图，不包含镇街。缺少下级边界不代表行政上没有下级单位。
- 中国英文名称优先采用上游英文，缺失时使用拼音；海外行政区缺少中文时保留原名。缺少坐标时保留 null，不手工补齐。
- 坐标保持上游原值，不推断或转换坐标系；不同来源不保证可直接叠加。

## 更新方式

每周一北京时间凌晨 01:00，CI 自动检查上游、刷新数据并完成校验和审计；有变更时创建或更新同一个数据更新 PR，无变更时不提 PR，也支持手动触发。维护者人工审核并合并，变更可积累一段时间后再统一准备发布。更新 PR 不生成 Changeset，也不调整包版本；在代码完成评审、确认准备发布时，再单独整理变更说明、版本和发布产物。

数据随包发布，为固定快照；更新频率取决于上游，不保证实时反映行政区划变化。更新程序只有在获取和校验成功后才替换快照，失败时保留原数据。

`master` 是可变分支；每次更新以实际获取内容的 SHA-256 记录快照，来源 URL、首次获取时间和哈希见 `manifest.sources`。本次来源切换前已核对 GitHub 文件与原官网示例文件逐字节一致，地图几何未因切换下载地址而改变。

## 使用提示

DataV 来源的中国边界与行政区坐标通过 GeoAtlas 获取，来源信息及相关条款见[上游说明](https://help.aliyun.com/zh/datav/datav-7-0/user-guide/datav-geoatlas-widgets/)。

中国地图未逐段与标准地图核验。需要标准版图公开展示时，应使用[自然资源部标准地图服务](https://bzdt.tianditu.gov.cn/)提供的适用地图或经审核的数据。
