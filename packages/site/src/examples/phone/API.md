---
index: 1
title: API
---

## 国际电话呼叫码

从 `@idux/geo-areas/phone` 或主入口导入。

### PhoneRegion

```ts
export interface PhoneRegion {
  countryCode: string
  name: LocalizedName
  callingCode: string
}
```

| 字段          | 含义                                                                 | 示例                                       |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `countryCode` | 地区唯一标识，ISO alpha-2 加 libphonenumber 的 `AC`、`TA`、`XK` 扩展 | `'US'`                                     |
| `name`        | 地区中英文名称                                                       | `{ 'zh-CN': '美国', en: 'United States' }` |
| `callingCode` | 带 `+` 的 E.164 国家呼叫码；多个地区可共享                           | `'+1'`                                     |

`countryCode` 可作选项唯一键，`callingCode` 不可作唯一键。此处的呼叫码不是城市区号或北美号码计划的地区前缀，例如牙买加返回 `'+1'`。扩展地区不保证能通过 `getCountry` 查到。

### 导出与签名

```ts
export const phoneRegions: readonly PhoneRegion[]

export function getPhoneRegion(countryCode: string): PhoneRegion | undefined

export function getRegionsByCallingCode(callingCode: string): PhoneRegion[]

export function getPhoneOptions(): {
  value: string
  label: string
  callingCode: string
}[]
```

- `phoneRegions`：全部受支持的电话地区。
- `getPhoneRegion(countryCode)`：按地区代码查询，不区分大小写；未找到返回 `undefined`。不接受 alpha-3 或数字国家代码作为别名。
- `getRegionsByCallingCode(callingCode)`：支持 `'+1'` 或 `'1'`；不带 `+` 时自动添加。返回共享该呼叫码的所有地区；未找到返回 `[]`。不解析完整电话号码。
- `getPhoneOptions()`：生成新选项；`value = countryCode`，`label = 名称 + ' (' + callingCode + ')'`，另保留 `callingCode`；无 `level` 字段。

```ts
getPhoneRegion('cn')?.callingCode // '+86'
getRegionsByCallingCode('1').map((item) => item.countryCode)
// 包含 US、CA、JM 等；返回所有匹配地区
setLocale('en') // 从 @idux/geo-areas/locale 导入，统一设置语言
getPhoneOptions().find((item) => item.value === 'CN')
// { value: 'CN', label: 'China (+86)', callingCode: '+86' }
```

### 按洲分组选项

```ts
import { getGroupedPhoneOptions } from '@idux/geo-areas/phone'

const groups = getGroupedPhoneOptions()
// { value: '142', label: '亚洲', children: [...] }[]
```

`getGroupedPhoneOptions()` 返回 `OptionGroup<ReturnType<typeof getPhoneOptions>[number]>[]`。每组包含 `value`、`label`、`children`；叶子保留平铺选项的全部字段和相对顺序。名称跟随 `getLocale()`，每次调用生成新的分组及叶子选项。

分组依次为亚洲（`142`）、欧洲（`150`）、北美洲（`003`，包含中美洲和加勒比地区）、南美洲（`005`）、非洲（`002`）、大洋洲（`009`）、南极洲（`010`）。省略空组；未匹配地区放在末尾的 `other`（其他地区）组。不内置「常用地区」名单。

归属采用随包发布的 CLDR 地区包含关系快照，每个地区只归一洲（例如 RU 属欧洲、TR 属亚洲），不按几何拆分跨洲国家。七大洲展示中特别将 AQ 归入南极洲，而非 CLDR 的大洋洲外围地区。CLDR 仅用于数据生成，无运行时依赖。
