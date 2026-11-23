import {
  getCountry,
  getChinaArea,
  getPhoneOptions,
  loadGeoJSON,
  hasGeoJSON,
  type MapGeoJSON,
} from '@idux/geo-areas'
import { getSubdivisions } from '@idux/geo-areas/subdivisions'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { registerMap } from 'echarts/core'
import yushu from '@idux/geo-areas/geojson/632700.json' with { type: 'json' }
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }
const code: string = getCountry('CN')!.code
const center: [number, number] | null = getChinaArea(370000)!.center
const options: { value: string; label: string; callingCode: string }[] = getPhoneOptions('en')
const map: MapGeoJSON = await loadGeoJSON('world', 'en')
const standard: FeatureCollection<Polygon | MultiPolygon> = map
registerMap('world', map)
registerMap('china', await loadGeoJSON('china'))
registerMap('yushu', yushu)
const unknown: string = '370000'
if (hasGeoJSON(unknown)) await loadGeoJSON(unknown)
getSubdivisions('US')
// @ts-expect-error Unsupported locale must not silently compile.
getPhoneOptions('fr')
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
