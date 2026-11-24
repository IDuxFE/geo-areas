---
index: 2
title: 指南
---

## 接入省市区级联选择

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getChinaArea, getChinaAreaOptions } from '@idux/geo-areas/china'
import type { AreaOption } from '@idux/geo-areas/types'
import type { CascaderData } from '@idux/components/cascader'

function toCascaderData(options: AreaOption[]): CascaderData[] {
  return options.map(({ value, label, children }) => ({
    key: value,
    label,
    children: children && toCascaderData(children),
  }))
}

setLocale('zh-CN')
const options = toCascaderData(getChinaAreaOptions(3))
const area = getChinaArea('440305')
```

### 选择层级与回显

`depth` 为 `1` 时仅省级，`2` 时最多到市级，`3` 时最多到区县。实际层级以数据中的 `children` 为准，不为每条路径补齐固定三层。

`IxCascader` 开启 `full-path` 后返回代码路径，取最后一个代码调用 `getChinaArea` 可读取所选节点。保存 adcode 字符串，清空选择时同时清空详情；未知代码应显示空态。

### 语言与地图边界

应用语言变化时，重新调用 `getChinaAreaOptions()` 生成级联选项。`setLocale` 不会自动改写现有选项。

行政树和地图边界来自不同数据源。找到行政区不表示存在对应地图，加载前使用 `hasGeoJSON` 检查；没有边界时保留当前地图或提示暂无数据。中心坐标可能为空，英文名也可能是拼音，应按字段实际值展示。

## 本页示例覆盖

- 省市区级联选择与节点详情。
- 切换 `depth=1/2/3`，并选择是否添加 `chinaAreaTree` 国家根节点；切换结构后清空旧选择。国家根节点不计入 `depth`，深度始终从省级开始计算。
- 层级示例允许选择中间节点，可直接查看国家根节点的 `100000` 代码与 `parentCode = null`。
