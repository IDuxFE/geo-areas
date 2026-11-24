import { mapLoaders as generatedMapLoaders, type GeneratedMapId } from './generated/map-loaders.js'
import { getLocale } from './locale.js'
import type { Locale, MapGeoJSON } from './types.js'
// Keep aliases on the same loader so no additional map asset is shipped.
export type MapId = GeneratedMapId | 'china'
const mapLoaders: Record<MapId, () => Promise<{ default: MapGeoJSON }>> = {
  ...generatedMapLoaders,
  china: generatedMapLoaders['CN-provinces'],
}
export const availableMaps = Object.keys(mapLoaders) as MapId[]
function copyLocalizedMap(map: MapGeoJSON, locale: Locale): MapGeoJSON {
  const copy = structuredClone(map)
  for (const feature of copy.features) feature.properties.name = feature.properties.names[locale]
  return copy
}
// Each result is independent of the input and cached imported maps.
export function localizeGeoJSON(map: MapGeoJSON): MapGeoJSON {
  return copyLocalizedMap(map, getLocale())
}
export async function loadGeoJSON(id: MapId): Promise<MapGeoJSON> {
  // Capture before awaiting, so switching languages cannot change an in-flight request.
  const locale = getLocale()
  if (!Object.hasOwn(mapLoaders, id)) throw new Error(`Unknown map: ${id}`)
  return copyLocalizedMap((await mapLoaders[id]()).default, locale)
}
/** Map ids include `world`, `china` (alias of `CN-provinces`), six-digit adcodes, ISO country codes and `<ISO>-provinces`. */
export function hasGeoJSON(id: string): id is MapId
export function hasGeoJSON(id: number): boolean
export function hasGeoJSON(id: string | number): boolean {
  return Object.hasOwn(mapLoaders, String(id))
}
