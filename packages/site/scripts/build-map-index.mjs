import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { countries } from '@idux/geo-areas/countries'
import { availableMaps, hasGeoJSON } from '@idux/geo-areas/geojson'

const targetsByMap = {}
for (const parent of availableMaps) {
  const path = import.meta.resolve(`@idux/geo-areas/geojson/${parent}.json`)
  const { features } = JSON.parse(await readFile(new URL(path), 'utf8'))
  targetsByMap[parent] = features.flatMap(({ properties: { code, level, names } }) => {
    let id
    if (parent === 'world') {
      id = hasGeoJSON(`${code}-provinces`) ? `${code}-provinces` : code
    } else if (level === 'province' || level === 'city' || level === 'district') {
      id = code
    }
    if (!id || id === parent) return []
    if (hasGeoJSON(id)) return [{ id, sourceMapId: id, names, code }]
    // The parent already contains this region's original boundary. A separate
    // asset is unnecessary for selecting and displaying its terminal outline.
    return parent === 'world' ? [] : [{ id, sourceMapId: parent, featureCode: code, names, code }]
  })
}

// Some territories have a standalone map but no separate feature in the world overview.
const worldCodes = new Set(targetsByMap.world.map(({ code }) => code))
for (const { code, name: names } of countries) {
  if (hasGeoJSON(code) && !worldCodes.has(code))
    targetsByMap.world.push({ id: code, sourceMapId: code, names, code })
}

const output = new URL('../.cache/', import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL('map-index.json', output), JSON.stringify(targetsByMap))
