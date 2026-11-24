---
index: 2
title: Guide
---

## Combine region selection and phone number input

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { getPhoneOptions, getPhoneRegion } from '@idux/geo-areas/phone'

setLocale('en')
const options = getPhoneOptions()
const region = getPhoneRegion('CN')
const callingCode = region?.callingCode // '+86'
```

### Use region codes as selection values

Several regions can share an international calling code, such as `+1`. Use `countryCode` as the unique key; do not deduplicate by `callingCode`. `getPhoneOptions` places the region code in `value`. With `IxSelect`, set `get-key="value"` or map it to the component's `key`.

Use `getGroupedPhoneOptions()` from `@idux/geo-areas/phone` for continent groups, or `getPhoneOptions()` for flat options. The demo adds a site-specific Common group on top of the package groups. Call the corresponding function again after switching languages to regenerate labels.

### Store and validate phone numbers

Store the region code and the user's local number separately, then look up the calling code by region. The package provides region and calling code data; it does not format or validate phone numbers. Use a phone parsing library before submission to handle local prefixes, length and international formatting.

Reverse lookup with `getRegionsByCallingCode` returns every matching region. A calling code alone cannot determine the user's region.

## Examples on this page

- Common regions, continent groups and local phone number input.
- The input displays a fixed `+` prefix. Enter `1` to see all matching regions, or `999` for an empty result. When several regions match, let the user choose a region rather than inferring it from the calling code.
