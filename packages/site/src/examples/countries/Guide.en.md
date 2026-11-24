---
index: 2
title: Guide
---

## Link countries and subdivisions

### Generate options

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getCountryOptions } from '@idux/geo-areas/countries'
import { getSubdivisions } from '@idux/geo-areas/subdivisions'

setLocale('en')
const countries = getCountryOptions()
const subdivisions = getSubdivisions('US').map((item) => ({
  value: item.code,
  label: item.name.en,
}))
```

Use two-letter codes as country selection values and each subdivision's `code` as its value. With `IxSelect`, set `get-key="value"` or map `value` to `key`.

### Update linked selections

When the country changes, fetch its subdivisions and clear the previous subdivision selection. Show an empty state or disable the second selector when no subdivisions are available. First-level entries use `province`; inspect `administrativeType` for the original type, such as state or province.

### Switch languages

Vue can update the options automatically without a refresh button. The site uses `useLocalizedData(getCountryOptions)` to track its reactive locale and regenerate options when it changes, preserving the selected country code. The data package does not depend on Vue: `setLocale` sets a plain variable, so `computed(() => getCountryOptions())` alone cannot track locale changes. Have the computed getter read your application’s locale ref, and synchronize `setLocale` when that ref changes. Use `getCountryOptions()` for flat options or the package’s `getGroupedCountryOptions()` for options grouped by continent.

Here is a complete Vue integration. `language` is the application's own reactive locale. After synchronizing the data package's locale, `computed` updates the options automatically while the selector keeps the same country code.

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
// Setting language.value = 'en' updates options automatically; country stays 'CN'.
```

When an upstream Chinese translation is unavailable, `chineseName` is `null`; display `name[locale]`. Text records and map boundaries have different coverage, so a text record does not guarantee a corresponding map.

## Examples on this page

- Country selection, continent groups and linked first-level subdivisions.
- Country lookup by alpha-2, alpha-3 or numeric string, including an unknown-code empty state.
- Switch between Chinese and English: country options and the selected country name update automatically when the page language changes, without a manual refresh.
