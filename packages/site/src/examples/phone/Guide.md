---
index: 2
title: 指南
---

## 组合地区选择与号码输入

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getPhoneOptions, getPhoneRegion } from '@idux/geo-areas/phone'

setLocale('zh-CN')
const options = getPhoneOptions()
const region = getPhoneRegion('CN')
const callingCode = region?.callingCode // '+86'
```

### 选择值使用地区代码

多个地区可能共用一个国际呼叫码，例如 `+1`。选择器应以 `countryCode` 为唯一键，不能以 `callingCode` 去重。`getPhoneOptions` 已将地区代码放在 `value` 中；接入 `IxSelect` 时设置 `get-key="value"`，或映射成组件的 `key`。

按洲分组可直接调用 `@idux/geo-areas/phone` 的 `getGroupedPhoneOptions()`；平铺选项使用 `getPhoneOptions()`。示例在包提供的洲分组上额外添加站点自定义的「常用」分组。语言变化后重新调用对应函数即可生成对应标签。

### 保存与校验

分别保存地区代码与用户输入的本地号码，根据地区查找呼叫码。数据包提供地区和区号数据，不负责号码格式化或有效性校验；提交前由业务使用号码解析库处理本地前缀、长度与国际格式。

反向查询区号时，`getRegionsByCallingCode` 返回所有匹配地区，不能仅凭区号确定用户所在地区。

## 本页示例覆盖

- 常用地区与按洲分组区号选择、号码输入。
- 输入框固定显示 `+` 前缀，输入 `1` 反查全部匹配地区，输入 `999` 查看空态。返回结果为多个地区时，应由用户继续选择，不能仅凭区号确定地区。
