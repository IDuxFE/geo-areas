import { loadGeoJSON } from '@idux/geo-areas/geojson'
const world = await loadGeoJSON('world', 'en')
if (world.features.length < 200) throw new Error('Bundled consumer failed to import world map')
