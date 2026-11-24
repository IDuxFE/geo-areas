---
index: 2
title: 指南
---

## 国家选择与行政区联动

### 生成选项

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getCountryOptions } from '@idux/geo-areas/countries'
import { getSubdivisions } from '@idux/geo-areas/subdivisions'

setLocale('zh-CN')
const countries = getCountryOptions()
const subdivisions = getSubdivisions('US').map((item) => ({
  value: item.code,
  label: item.name['zh-CN'],
}))
```

国家选择值使用二位代码，一级行政区选择值使用条目的 `code`。接入 `IxSelect` 时可设置 `get-key="value"`，或把 `value` 映射成 `key`。

### 处理联动

国家变化后，重新获取一级行政区并清空旧的行政区选择；没有行政区数据时展示空态或禁用第二个选择器。条目统一标记为 `province`，具体是州、省还是其他类型可查看 `administrativeType`。

### 切换语言

在 Vue 中可以自动更新，不需要用户点击刷新按钮。站点通过 `useLocalizedData(getCountryOptions)` 把选项与 Vue 的语言状态关联起来，切换语言后自动重新生成选项，已选国家代码保持不变。底层数据包不依赖 Vue，`setLocale` 设置的是普通变量，因此只写 `computed(() => getCountryOptions())` 无法跟踪语言变化；需要让 `computed` 读取应用的语言 `ref`，并在语言变化时同步调用 `setLocale`。平铺选项使用 `getCountryOptions()`，按洲分组选项使用包提供的 `getGroupedCountryOptions()`。

下面是可用于 Vue 项目的完整接法。`language` 是应用自己的语言状态；同步设置数据包语言后，`computed` 会自动更新选项，选择器继续保存原来的国家代码。

```ts
import { computed, ref, watch } from 'vue'
import { setLocale } from '@idux/geo-areas/locale'
import { getCountryOptions } from '@idux/geo-areas/countries'
import type { Locale } from '@idux/geo-areas/types'

const language = ref<Locale>('zh-CN')
const country = ref('CN')
watch(language, setLocale, { immediate: true, flush: 'sync' })
const options = computed(() => {
  void language.value
  return getCountryOptions()
})
// language.value = 'en' 后，options 自动变成英文；country 仍为 'CN'。
```

上游缺少中文译名时，`chineseName` 为 `null`，展示时使用 `name[locale]`。文字条目与地图边界的覆盖范围不同，不能据此推定地图一定存在。

## 本页示例覆盖

- 国家选择与按洲分组、国家和一级行政区联动。
- 输入 alpha-2、alpha-3 或数字字符串查询国家，未知代码显示空态。
- 中英文切换：切换页面语言后，下拉选项和已选国家名称自动更新，无需手动刷新。
