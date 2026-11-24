---
'@idux/geo-areas': minor
---

Add shared setLocale/getLocale configuration and localized country and phone options grouped by continent, backed by generated CLDR data, with Antarctica handled as a separate continent. Localized APIs now read the shared locale instead of accepting a locale argument; getChinaAreaOptions accepts depth as its only argument.
