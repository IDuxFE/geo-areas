import { loadGeoJSON } from '@idux/geo-areas/geojson'
import { setLocale } from '@idux/geo-areas/locale'
setLocale('en')
const world = await loadGeoJSON('world')
if (world.features.length < 200) throw new Error('Bundled consumer failed to import world map')
if (
  world.features.find((feature) => feature.properties.code === 'CN')?.properties.name !== 'China'
) {
  throw new Error('Bundled consumer failed to share the configured locale')
}
