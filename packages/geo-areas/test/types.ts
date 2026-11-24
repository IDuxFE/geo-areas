import {
  getCountry,
  getLocale,
  setLocale,
  getChinaArea,
  getPhoneOptions,
  getCountryOptions,
  getChinaAreaOptions,
  localizeGeoJSON,
  loadGeoJSON,
  hasGeoJSON,
  type MapGeoJSON,
} from '@idux/geo-areas'
import { setLocale as setDefaultLocale } from '@idux/geo-areas/locale'
import type { Locale } from '@idux/geo-areas/types'
import { getSubdivisions } from '@idux/geo-areas/subdivisions'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { registerMap } from 'echarts/core'
import yushu from '@idux/geo-areas/geojson/632700.json' with { type: 'json' }
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }
const code: string = getCountry('CN')!.code
const locale: Locale = getLocale()
setLocale('en')
setDefaultLocale('zh-CN')
// @ts-expect-error Only supported locales can be configured.
setLocale('fr')
void locale
const center: [number, number] | null = getChinaArea(370000)!.center
const options: { value: string; label: string; callingCode: string }[] = getPhoneOptions()
const map: MapGeoJSON = await loadGeoJSON('world')
const standard: FeatureCollection<Polygon | MultiPolygon> = map
registerMap('world', map)
registerMap('china', await loadGeoJSON('china'))
registerMap('yushu', yushu)
const unknown: string = '370000'
if (hasGeoJSON(unknown)) await loadGeoJSON(unknown)
getSubdivisions('US')
getChinaAreaOptions(2)
// @ts-expect-error Locale is configured centrally, not per country-options call.
getCountryOptions('en')
// @ts-expect-error Locale is configured centrally, not per phone-options call.
getPhoneOptions('en')
// @ts-expect-error The only China options parameter is depth.
getChinaAreaOptions('en')
// @ts-expect-error The old locale/depth signature is no longer supported.
getChinaAreaOptions(undefined, 2)
// @ts-expect-error Map loading does not accept a locale argument.
loadGeoJSON('world', 'en')
// @ts-expect-error Map localization does not accept a locale argument.
localizeGeoJSON(map, 'en')
// @ts-expect-error Only generated map ids are accepted.
loadGeoJSON('not-a-map')
void [code, center, options, standard]
const retrievedAt: string = manifest.sources[0].firstRetrievedAt
void retrievedAt

const mapCoverage = manifest.coverage.chinaMaps[0]
const endpointStatus: 'available' | 'not-found' | 'error' = mapCoverage.fullEndpointStatus
const hasChildren: boolean = mapCoverage.hasChildBoundaries
const missingFullCodes: string[] = manifest.coverage.chinaMapsWithoutFull
void [endpointStatus, hasChildren, missingFullCodes]

import { getGroupedCountryOptions } from '@idux/geo-areas/countries'
import { getGroupedPhoneOptions } from '@idux/geo-areas/phone'
import type { OptionGroup } from '@idux/geo-areas/types'
const groupedCountries: OptionGroup<{ value: string; label: string; level: 'country' }>[] =
  getGroupedCountryOptions()
const groupedPhones: OptionGroup<{ value: string; label: string; callingCode: string }>[] =
  getGroupedPhoneOptions()
void [groupedCountries, groupedPhones]

import { countries, chinaAreas, chinaAreaTree, phoneRegions, subdivisions } from '@idux/geo-areas'
// @ts-expect-error Snapshot entries are deeply readonly.
countries[0].name.en = 'Changed'
// @ts-expect-error Nested arrays are readonly too.
chinaAreas[0].children?.pop()
// @ts-expect-error The country root is deeply readonly.
chinaAreaTree.adcode = '999999'
// @ts-expect-error Phone snapshots are readonly.
phoneRegions[0].callingCode = '+0'
// @ts-expect-error Subdivision coordinates are readonly.
subdivisions[0].center?.push(0)
// Query copies remain editable.
getCountry('CN')!.name.en = 'Local label'
getChinaArea('110000')!.children?.pop()
