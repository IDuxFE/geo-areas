---
index: 1
title: 数据来源与许可
type: page
---

# 数据来源与许可

## 数据来源与许可

代码采用 MIT；第三方数据保留各自条款，不受本项目 MIT 声明覆盖。下表链接提供上游来源与随包保留的许可证原文。

| 来源                                                                                                       | 数据用途                                  | 许可／声明                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Unicode CLDR](https://github.com/unicode-org/cldr-json)                                                   | 国家名称、代码映射与洲归属                | [CLDR core](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/unicode-cldr-core.txt) / [localenames](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/unicode-cldr-localenames.txt) |
| [i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries)                             | ISO 国家条目筛选                          | [MIT](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/i18n-iso-countries.txt)                                                                                                                              |
| [Vant area-data](https://github.com/vant-ui/vant/tree/main/packages/vant-area-data)                        | 中国省市区层级                            | [MIT](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/vant-area-data.txt)                                                                                                                                  |
| [Google libphonenumber](https://github.com/google/libphonenumber)                                          | 电话元数据，经 libphonenumber-js 发布     | [Apache-2.0](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/google-libphonenumber-Apache-2.0.txt)                                                                                                         |
| [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)                                   | 生成国际电话呼叫码                        | [MIT](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/libphonenumber-js.txt)                                                                                                                               |
| [Apache ECharts 仓库测试数据](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json) | 全球总览 world                            | [Apache-2.0](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/echarts-world-Apache-2.0.txt) / [NOTICE](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/echarts-world-NOTICE.txt)  |
| [Apache ECharts 3.8.5](https://raw.githubusercontent.com/apache/echarts/3.8.5/map/json/china.json)         | 中国省级总览 CN-provinces，解码为 GeoJSON | [BSD-3-Clause](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/echarts-3.8.5-BSD-3-Clause.txt)                                                                                                             |
| [Natural Earth](https://github.com/nvkelso/natural-earth-vector)                                           | 独立国家轮廓与海外一级行政区              | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/)                                                                                                                                                                |
| [pinyin-pro](https://github.com/zh-lx/pinyin-pro)                                                          | 中国名称拼音转写，非官方译名              | [MIT](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/licenses/pinyin-pro.txt)                                                                                                                                      |
| [DataV GeoAtlas](https://datav.aliyun.com/portal/school/atlas/area_selector)                               | 中国行政中心与边界                        | [使用前请自行查阅上游使用条款](https://help.aliyun.com/zh/datav/datav-6-0/user-guide/datav-geoatlas-widget/)                                                                                                                         |

数据由上游维护，本项目自动获取、转换和校验，保留上游几何并规范化标识与双语名称，不维护手写数据表。来源 URL、版本、哈希和覆盖缺口见随包 manifest。

## 世界地图来源

`world` 使用 Apache ECharts 仓库 `master` 分支的 [`test/data/map/json/world.json`](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json)。更新程序直接下载对应的 [GitHub Raw 文件](https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json)。

生成时保留上游有效多边形坐标，移除空多边形成员，并补充国家／地区代码、中英文名称及原始名称 `sourceName`。因此，包内生成的 `world.json` 与上游原始文件并非逐字节相同。独立国家轮廓（如 `CN`、`US`）仍来自 Natural Earth，不是从该全球总览中拆分。

许可依据为上游仓库的 [LICENSE](https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/LICENSE) 和 [NOTICE](https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/NOTICE)。仓库声明采用 Apache-2.0，列出的单独许可例外未包含该世界地图文件，其目录下也未发现额外许可声明。本包保留对应许可证和署名声明；上述代码、名称及空多边形处理属于本项目对原文件的修改。

## 覆盖与限制

[中国地图下钻覆盖清单](https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/CHINA_MAP_COVERAGE.md)列出了逐地区下钻覆盖、未提供下级边界接口的地区，以及对应的本级轮廓 JSON 链接。

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
