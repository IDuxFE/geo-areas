import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, rm, rename, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { describeChinaMaps, chinaMapCoverageMarkdown } from './china-map-coverage.mjs'
import { loadDataVMap } from './datav.mjs'
import { validateChinaMapCoverage } from './validate-coverage.mjs'
import { dataFingerprint } from './fingerprint.mjs'
import { generateContinents } from './continents.mjs'
import iso from 'i18n-iso-countries'
import { useCascaderAreaData } from '@vant/area-data'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js'
import { pinyin } from 'pinyin-pro'

// Resolve all workspace paths relative to this script, including when invoked from elsewhere.
process.chdir(fileURLToPath(new URL('..', import.meta.url)))
const require = createRequire(import.meta.url)
const countryNamesZh = require('cldr-localenames-full/main/zh/territories.json').main.zh
  .localeDisplayNames.territories
const countryNamesEn = require('cldr-localenames-full/main/en/territories.json').main.en
  .localeDisplayNames.territories
const codeMappings = require('cldr-core/supplemental/codeMappings.json').supplemental.codeMappings
const args = new Set(process.argv.slice(2))
for (const arg of args)
  if (!['--cached', '--province-only', '--refresh-datav'].includes(arg))
    throw new Error(`Unknown argument: ${arg}`)
const stage = `.update-${process.pid}`
const sources = []
const sourceChecks = []
const requestFailures = []
const sourceFallbacks = []
const startedAt = new Date().toISOString()
let previousManifest
try {
  previousManifest = JSON.parse(await readFile('data-manifest.json', 'utf8'))
} catch {}
const hash = (value) => createHash('sha256').update(value).digest('hex')
const json = (value) => JSON.stringify(value)
await mkdir('.cache', { recursive: true })
// Large raw GitHub files can stall on long connections. Range downloads are resumable,
// bounded and use If-Range so a changing upstream cannot produce a mixed snapshot.
async function request(url, options) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      await response.body?.cancel()
      throw Object.assign(new Error(`HTTP ${response.status}: ${url}`), { status: response.status })
    }
    return response
  } catch (error) {
    const failure = {
      url,
      status: error.status ?? null,
      error: error.message,
      checkedAt: new Date().toISOString(),
    }
    requestFailures.push(failure)
    error.sourceFailureRecorded = true
    console.error(`Source request failed: ${url}: ${error.message}`)
    throw error
  }
}
function errorDetails(error) {
  return {
    message: error.message,
    ...(error.errors ? { errors: error.errors.map(errorDetails) } : {}),
  }
}
async function allSources(promises) {
  const results = await Promise.allSettled(promises)
  const errors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason)
  if (errors.length)
    throw new AggregateError(errors, errors.map((error) => error.message).join('; '))
  return results.map((result) => result.value)
}
async function downloadText(url) {
  if (new URL(url).hostname !== 'raw.githubusercontent.com') {
    const response = await request(url, { signal: AbortSignal.timeout(60000) })
    return response.text()
  }
  const size = 262144
  const first = await request(url, {
    headers: { Range: `bytes=0-${size - 1}` },
    signal: AbortSignal.timeout(60000),
  })
  if (first.status === 200) return first.text()
  assert(first.status === 206, `HTTP ${first.status}: ${url}`)
  const total = Number(first.headers.get('content-range')?.split('/')[1])
  const etag = first.headers.get('etag')
  assert(Number.isSafeInteger(total) && total > 0 && etag, `Invalid range response: ${url}`)
  const directory = `.cache/${hash(url)}.parts/${hash(etag)}`
  await mkdir(directory, { recursive: true })
  const chunks = Array.from({ length: Math.ceil(total / size) })
  chunks[0] = Buffer.from(await first.arrayBuffer())
  assert(chunks[0].length === Math.min(size, total), `Truncated first range: ${url}`)
  console.log(
    `Downloading ${new URL(url).pathname.split('/').at(-1)} (${(total / 1048576).toFixed(1)} MiB, resumable ranges)…`,
  )
  await parallel(
    Array.from({ length: chunks.length - 1 }, (_, i) => i + 1),
    async (index) => {
      const start = index * size
      const end = Math.min(total - 1, start + size - 1)
      const path = `${directory}/${index}`
      try {
        const cached = await readFile(path)
        if (cached.length === end - start + 1) {
          chunks[index] = cached
          return
        }
      } catch {}
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const r = await request(url, {
            headers: { Range: `bytes=${start}-${end}`, 'If-Range': etag },
            signal: AbortSignal.timeout(60000),
          })
          if (
            r.status !== 206 ||
            r.headers.get('etag') !== etag ||
            r.headers.get('content-range') !== `bytes ${start}-${end}/${total}`
          ) {
            await r.body?.cancel()
            throw new Error(`Changed source or invalid range: ${url}`)
          }
          const chunk = Buffer.from(await r.arrayBuffer())
          assert(chunk.length === end - start + 1, `Truncated range: ${url}`)
          await writeFile(path, chunk)
          chunks[index] = chunk
          return
        } catch (error) {
          if (attempt === 2) throw error
        }
      }
    },
  )
  return Buffer.concat(chunks).toString('utf8')
}
async function fetchJSON(url, validate = () => {}) {
  const file = `.cache/${hash(url)}.json`
  let text
  let mode = 'network'
  if (
    args.has('--cached') &&
    !(args.has('--refresh-datav') && new URL(url).hostname === 'geo.datav.aliyun.com')
  ) {
    try {
      text = await readFile(file, 'utf8')
    } catch {}
  }
  if (text) mode = 'cache'
  if (!text) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        text = await downloadText(url)
        validate(JSON.parse(text))
        await writeFile(file, text)
        break
      } catch (error) {
        if (!error.sourceFailureRecorded)
          requestFailures.push({
            url,
            status: null,
            error: error.message,
            checkedAt: new Date().toISOString(),
          })
        console.error(`Source attempt ${attempt + 1}/3 failed: ${url}: ${error.message}`)
        if (attempt === 2) throw new Error(`${url}: ${error.message}`, { cause: error })
      }
    }
  }
  const data = JSON.parse(text)
  validate(data)
  const sha256 = hash(text)
  const retrievedAt = (await stat(file)).mtime.toISOString()
  const previous = previousManifest?.sources.find(
    (source) => source.url === url && source.sha256 === sha256,
  )
  const firstRetrievedAt = previous?.firstRetrievedAt || retrievedAt
  sources.push({ url, sha256, firstRetrievedAt })
  sourceChecks.push({ url, sha256, mode, retrievedAt, checkedAt: new Date().toISOString() })
  return data
}
async function parallel(items, fn, concurrency = 6) {
  let next = 0
  const errors = []
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (next < items.length) {
        const item = items[next++]
        try {
          await fn(item)
        } catch (error) {
          errors.push(error)
        }
      }
    }),
  )
  if (errors.length)
    throw new AggregateError(
      errors,
      `Source downloads failed; snapshots were not replaced: ${errors.map((error) => error.message).join('; ')}`,
    )
}
function coordinate(value) {
  return Array.isArray(value) &&
    value.length === 2 &&
    value.every(Number.isFinite) &&
    Math.abs(value[0]) <= 180 &&
    Math.abs(value[1]) <= 90
    ? value
    : null
}
function assert(condition, message) {
  if (!condition) throw new Error(message)
}
const chineseNameOverrides = { TW: '中国台湾' }
const englishNameOverrides = { TW: 'Taiwan, China' }

function names(code) {
  // Unicode's own maintained data also names libphonenumber's AC, TA and XK extensions.
  const result = {
    'zh-CN': chineseNameOverrides[code] ?? countryNamesZh[code],
    en: englishNameOverrides[code] ?? countryNamesEn[code],
  }
  assert(result['zh-CN'] && result.en, `Missing country translation: ${code}`)
  return result
}
function transliterate(name) {
  return pinyin(name, { toneType: 'none', type: 'array' })
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(' ')
}
async function emit(path, text) {
  await mkdir(`${stage}/${path.split('/').slice(0, -1).join('/')}`, { recursive: true })
  await writeFile(`${stage}/${path}`, text)
}
async function dataset(name, type, value) {
  await emit(
    `generated/${name}.ts`,
    `// Generated by scripts/update.mjs. Do not edit.\nimport type { ${type} } from '../types.js'\nexport const ${name === 'countries' ? 'country' : name === 'subdivisions' ? 'subdivision' : name}Data: ${type}[] = ${json(value)}\n`,
  )
}
// ECharts v3 stores quantized coordinate deltas as pairs of ZigZag-encoded characters.
function decodeEChartsGeometry(geometry, scale) {
  const { type, coordinates, encodeOffsets } = geometry
  assert(type === 'Polygon' || type === 'MultiPolygon', `Unsupported ECharts geometry: ${type}`)
  const decodePolygon = (rings, offsets) =>
    rings
      .map((ring, index) => {
        let [longitude, latitude] = offsets[index]
        const points = []
        const delta = (value) => (value % 2 === 0 ? value / 2 : -(value + 1) / 2)
        for (let i = 0; i < ring.length; i += 2) {
          longitude += delta(ring.charCodeAt(i) - 64)
          latitude += delta(ring.charCodeAt(i + 1) - 64)
          points.push([longitude / scale, latitude / scale])
        }
        if (json(points[0]) !== json(points.at(-1))) points.push(points[0])
        return points
      })
      .filter((ring) => ring.length >= 4)
  return {
    type,
    coordinates:
      type === 'Polygon'
        ? decodePolygon(coordinates, encodeOffsets)
        : coordinates
            .map((polygon, index) => decodePolygon(polygon, encodeOffsets[index]))
            .filter((polygon) => polygon.length > 0),
  }
}
function validateMap(map, id) {
  assert(map?.type === 'FeatureCollection' && map.features.length > 0, `Invalid map: ${id}`)
  const codes = new Set()
  for (const feature of map.features) {
    assert(['Polygon', 'MultiPolygon'].includes(feature.geometry?.type), `Invalid geometry: ${id}`)
    const p = feature.properties
    assert(
      typeof p.code === 'string' && p.code && !codes.has(p.code),
      `Duplicate/empty feature code: ${id}/${p.code}`,
    )
    codes.add(p.code)
    assert(p.names?.en && p.names?.['zh-CN'], `Missing map names: ${id}/${p.code}`)
    const polygon = (rings) => {
      assert(rings.length > 0, `Empty polygon: ${id}`)
      for (const ring of rings) {
        assert(ring.length >= 4 && json(ring[0]) === json(ring.at(-1)), `Unclosed ring: ${id}`)
        for (const point of ring) assert(coordinate(point), `Invalid coordinate: ${id}`)
      }
    }
    if (feature.geometry.type === 'Polygon') polygon(feature.geometry.coordinates)
    else for (const poly of feature.geometry.coordinates) polygon(poly)
  }
}
function mergeMapUnits(map) {
  const units = new Map()
  const polygons = (geometry) =>
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  for (const feature of map.features) {
    const key = feature.properties.code
    const existing = units.get(key)
    if (!existing) units.set(key, structuredClone(feature))
    else {
      existing.geometry = {
        type: 'MultiPolygon',
        coordinates: [...polygons(existing.geometry), ...polygons(feature.geometry)],
      }
      existing.properties.sourceNames ??= [
        existing.properties.sourceName || existing.properties.name,
      ]
      existing.properties.sourceNames.push(feature.properties.sourceName || feature.properties.name)
    }
  }
  return { type: 'FeatureCollection', features: [...units.values()] }
}
const maps = new Map()
const boundaryProperties = new Map()
const chinaOutlineOnlyMaps = []
const chinaMapRequests = new Map()
async function fetchChinaMap(code) {
  let fallback
  const result = await loadDataVMap(code, fetchJSON, (recovery) => {
    fallback = recovery
    sourceFallbacks.push(recovery)
    console.error(
      `DataV fallback: ${recovery.from} failed (${recovery.reason}); trying ${recovery.to}`,
    )
  })
  chinaMapRequests.set(code, {
    fullEndpointStatus: fallback?.fullEndpointStatus ?? 'available',
    fullHttpStatus: fallback ? fallback.fullHttpStatus : 200,
    fullUrl: `https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`,
    sourceUrl: `https://geo.datav.aliyun.com/areas_v3/bound/${code}${result.outlineOnly ? '' : '_full'}.json`,
    content: result.outlineOnly ? 'outline' : 'children',
  })
  if (result.outlineOnly) chinaOutlineOnlyMaps.push(code)
  return result.map
}
const neBase = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson'
try {
  console.log('Reading versioned public country, Vant and Google-derived phone datasets…')
  const countries = Object.keys(iso.getAlpha2Codes())
    .filter((code) => Number(codeMappings[code]?._numeric) < 900)
    .sort()
    .map((code) => {
      const mapping = codeMappings[code]
      assert(mapping?._alpha3 && mapping?._numeric, `Missing CLDR country mapping: ${code}`)
      return {
        code,
        level: 'country',
        alpha3: mapping._alpha3,
        numeric: mapping._numeric,
        name: names(code),
      }
    })
  assert(countries.length >= 249, 'Country source unexpectedly shrank')
  const phones = getCountries()
    .sort()
    .map((countryCode) => ({
      countryCode,
      name: names(countryCode),
      callingCode: `+${getCountryCallingCode(countryCode)}`,
    }))
  assert(phones.length > 230, 'Phone source unexpectedly shrank')
  console.log('Fetching ECharts world map and Natural Earth boundaries…')
  const [echartsWorld, echartsChina, world, admin1, china, admin1Boundaries] = await allSources([
    fetchJSON(
      'https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json',
    ),
    fetchJSON('https://raw.githubusercontent.com/apache/echarts/3.8.5/map/json/china.json'),
    fetchJSON(`${neBase}/ne_50m_admin_0_countries.geojson`),
    fetchJSON(`${neBase}/ne_10m_admin_1_label_points_details.geojson`),
    fetchChinaMap('100000'),
    fetchJSON(`${neBase}/ne_50m_admin_1_states_provinces.geojson`),
  ])
  const subdivisions = admin1.features
    .flatMap(({ properties: p, geometry }) => {
      const countryCode = p.iso_a2
      if (!iso.isValid(countryCode) || !p.iso_3166_2?.startsWith(`${countryCode}-`) || !p.name)
        return []
      return [
        {
          code: p.iso_3166_2,
          level: 'province',
          administrativeType: p.type_en || p.type || null,
          countryCode,
          name: { 'zh-CN': p.name_zh || p.name, en: p.name_en || p.name },
          chineseName: p.name_zh || null,
          center: coordinate(geometry?.coordinates),
        },
      ]
    })
    .sort((a, b) => a.code.localeCompare(b.code, 'en'))
  // Natural Earth sometimes has multiple polygons for one subdivision. Keep one metadata record.
  const uniqueSubdivisions = [...new Map(subdivisions.map((item) => [item.code, item])).values()]
  assert(uniqueSubdivisions.length > 3000, 'Subdivision source unexpectedly shrank')
  const upstreamEnglishNames = new Map(
    admin1.features
      .filter(
        (f) =>
          ['CN', 'HK', 'MO', 'TW'].includes(f.properties.iso_a2) &&
          f.properties.name_zh &&
          f.properties.name_en,
      )
      .map((f) => [f.properties.name_zh, f.properties.name_en]),
  )
  const countryOutlines = {
    type: 'FeatureCollection',
    features: world.features.map((f) => {
      const p = f.properties
      const countryCode = [p.ISO_A2_EH, p.ISO_A2, p.ADM0_A3]
        .map((c) => iso.alpha3ToAlpha2(c) || c)
        .find((c) => iso.isValid(c))
      const n = countryCode ? names(countryCode) : { 'zh-CN': p.NAME_ZH, en: p.NAME_EN || p.NAME }
      return {
        type: 'Feature',
        id: countryCode || `NE-${p.NE_ID}`,
        properties: {
          code: countryCode || `NE-${p.NE_ID}`,
          level: 'country',
          ...(countryCode ? { countryCode } : {}),
          name: n['zh-CN'],
          names: n,
          sourceName: p.NAME,
          boundarySource: 'Natural Earth',
        },
        geometry: f.geometry,
      }
    }),
  }
  const normalizeName = (name) =>
    name
      ?.normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
  const outlinesByName = new Map()
  // Prefer the primary source name over alternate names shared by several map units.
  for (const field of [
    'FORMAL_EN',
    'BRK_NAME',
    'GEOUNIT',
    'NAME_CIAWF',
    'ADMIN',
    'NAME_LONG',
    'NAME_EN',
    'NAME',
  ]) {
    for (const [index, feature] of world.features.entries()) {
      const key = normalizeName(feature.properties[field])
      if (key) outlinesByName.set(key, countryOutlines.features[index])
    }
  }
  const legacyCodes = new Map([
    ['Czech Rep.', 'CZ'],
    ['Korea', 'KR'],
    ['Macedonia', 'MK'],
    ['S. Geo. and S. Sandw. Is.', 'GS'],
    ['Swaziland', 'SZ'],
  ])
  const worldMap = {
    type: 'FeatureCollection',
    features: echartsWorld.features.map((feature, index) => {
      const sourceName = feature.properties.name
      const match = outlinesByName.get(normalizeName(sourceName))?.properties
      const countryCode = legacyCodes.get(sourceName) ?? match?.countryCode
      assert(
        !sourceName || countryCode || match,
        `Unrecognized ECharts world region: ${sourceName}`,
      )
      const localized = countryCode
        ? names(countryCode)
        : (match?.names ?? { 'zh-CN': '未命名区域', en: 'Unnamed region' })
      const code = countryCode ?? match?.code ?? `ECHARTS-${index}`
      const geometry = feature.geometry
      // The upstream China MultiPolygon includes an empty member.
      if (geometry.type === 'MultiPolygon') {
        geometry.coordinates = geometry.coordinates.filter((polygon) => polygon.length > 0)
      }
      return {
        type: 'Feature',
        id: code,
        properties: {
          code,
          level: 'country',
          ...(countryCode ? { countryCode } : {}),
          name: localized['zh-CN'],
          names: localized,
          sourceName,
          boundarySource: 'Apache ECharts example',
        },
        geometry,
      }
    }),
  }
  assert(worldMap.features.length >= 200, 'World boundary source unexpectedly shrank')
  maps.set('world', worldMap)
  for (const f of countryOutlines.features)
    if (f.properties.countryCode) {
      const id = f.properties.countryCode
      if (!maps.has(id)) maps.set(id, { type: 'FeatureCollection', features: [] })
      maps.get(id).features.push(f)
    }
  for (const f of admin1Boundaries.features) {
    const p = f.properties
    if (p.iso_a2 === 'CN' || !iso.isValid(p.iso_a2) || !p.iso_3166_2?.startsWith(`${p.iso_a2}-`))
      continue
    const id = `${p.iso_a2}-provinces`
    if (!maps.has(id)) maps.set(id, { type: 'FeatureCollection', features: [] })
    const n = { 'zh-CN': p.name_zh || p.name, en: p.name_en || p.name }
    maps.get(id).features.push({
      type: 'Feature',
      id: p.iso_3166_2,
      properties: {
        code: p.iso_3166_2,
        countryCode: p.iso_a2,
        level: 'province',
        administrativeType: p.type_en || p.type || null,
        name: n['zh-CN'],
        names: n,
        chineseName: p.name_zh || null,
      },
      geometry: f.geometry,
    })
  }
  function collect(map) {
    for (const f of map.features)
      if (/^\d{6}$/.test(String(f.properties.adcode)))
        boundaryProperties.set(String(f.properties.adcode), f.properties)
  }
  collect(china)
  const provinceCodes = china.features
    .map((f) => String(f.properties.adcode))
    .filter((code) => /^\d{6}$/.test(code))
  assert(provinceCodes.length >= 34, 'China province source unexpectedly shrank')
  maps.set('100000', china)
  console.log(`Fetching ${provinceCodes.length} DataV province maps…`)
  await parallel(provinceCodes, async (code) => {
    const map = await fetchChinaMap(code)
    collect(map)
    maps.set(code, map)
  })
  if (!args.has('--province-only')) {
    const cities = [
      ...new Set(
        [...boundaryProperties.values()]
          .filter((p) => p.level === 'city')
          .map((p) => String(p.adcode)),
      ),
    ].sort()
    console.log(`Fetching ${cities.length} prefecture maps (county boundaries)…`)
    await parallel(cities, async (code) => {
      const map = await fetchChinaMap(code)
      collect(map)
      maps.set(code, map)
    })
  }
  function area(items, parentCode = null, depth = 0) {
    return items.map((item) => {
      const p = boundaryProperties.get(item.value)
      const en = upstreamEnglishNames.get(item.text)
      return {
        adcode: item.value,
        parentCode,
        level: ['province', 'city', 'district'][depth],
        name: { 'zh-CN': item.text, en: en || transliterate(item.text) },
        englishNameKind: en ? 'english' : 'pinyin',
        center: coordinate(p?.center),
        centroid: coordinate(p?.centroid),
        ...(item.children?.length ? { children: area(item.children, item.value, depth + 1) } : {}),
      }
    })
  }
  const chinaAreas = area(useCascaderAreaData(), '100000')
  const flat = []
  function flatten(items) {
    for (const item of items) {
      flat.push(item)
      if (item.children) flatten(item.children)
    }
  }
  flatten(chinaAreas)
  assert(flat.length > 3000, 'Vant administrative source unexpectedly shrank')
  assert(new Set(flat.map((item) => item.adcode)).size === flat.length, 'Duplicate Vant adcodes')
  const areaByCode = new Map(flat.map((item) => [item.adcode, item]))
  for (const [id, map] of maps) {
    if (!/^\d{6}$/.test(id)) continue
    maps.set(id, {
      type: 'FeatureCollection',
      features: map.features.map((f) => {
        const p = f.properties
        const code = String(p.adcode)
        const n = areaByCode.get(code)?.name || {
          'zh-CN': p.name || '南海诸岛附图',
          en: p.name ? transliterate(p.name) : 'South China Sea inset',
        }
        return {
          type: 'Feature',
          id: code,
          properties: { ...p, adcode: code, code, name: n['zh-CN'], names: n },
          geometry: f.geometry,
        }
      }),
    })
  }
  assert(echartsChina.UTF8Encoding === true, 'Unexpected ECharts China encoding')
  const compactChina = echartsChina.features.map((feature) => {
    const adcode = String(feature.id)
    const area = areaByCode.get(adcode)
    assert(area?.level === 'province', `Unrecognized ECharts province: ${adcode}`)
    const localized = adcode === '710000' ? names('TW') : area.name
    return {
      type: 'Feature',
      id: adcode,
      properties: {
        code: adcode,
        adcode,
        level: 'province',
        name: localized['zh-CN'],
        names: localized,
        boundarySource: 'Apache ECharts 3.8.5',
      },
      geometry: decodeEChartsGeometry(feature.geometry, echartsChina.UTF8Scale ?? 1024),
    }
  })
  assert(compactChina.length === chinaAreas.length, 'Incomplete ECharts province coverage')
  maps.set('CN-provinces', { type: 'FeatureCollection', features: compactChina })
  console.log('Validating geometry, names, identifiers and coverage before replacing snapshots…')
  // Natural Earth can split one ISO region into several map units (e.g. Australia).
  // Join their existing polygons under the stable ISO id; do not redraw boundaries.
  for (const [id, map] of maps) if (!/^\d{6}$/.test(id)) maps.set(id, mergeMapUnits(map))
  for (const [id, map] of maps) validateMap(map, id)
  validateChinaMapCoverage(maps, !args.has('--province-only'))
  await emit('generated/continents.ts', generateContinents())
  await dataset('countries', 'Country', countries)
  await dataset('phone', 'PhoneRegion', phones)
  await dataset('china', 'ChinaArea', chinaAreas)
  await dataset('subdivisions', 'Subdivision', uniqueSubdivisions)
  const ids = [...maps.keys()].sort()
  const loaders = []
  for (const id of ids) {
    await emit(`data/maps/${id}.json`, json(maps.get(id)) + '\n')
    await emit(
      `data/loaders/${id}.geo.js`,
      `// Generated ESM adapter; the GeoJSON asset is named by adcode.\nimport data from '../maps/${id}.json' with { type: 'json' }\nexport default data\n`,
    )
    loaders.push(`  '${id}': () => import('../data/loaders/${id}.geo.js')`)
  }
  await emit(
    'generated/map-loaders.ts',
    `// Generated. Do not edit.\nimport type { MapGeoJSON } from '../types.js'\nexport type GeneratedMapId = ${ids.map((id) => `'${id}'`).join(' | ')}\nexport const mapLoaders: Record<GeneratedMapId, () => Promise<{ default: MapGeoJSON }>> = {\n${loaders.join(',\n')}\n}\n`,
  )
  const packages = Object.fromEntries(
    [
      '@vant/area-data',
      'i18n-iso-countries',
      'libphonenumber-js',
      'pinyin-pro',
      'cldr-core',
      'cldr-localenames-full',
    ].map((name) => [name, require(`${name}/package.json`).version]),
  )
  sources.sort((a, b) => a.url.localeCompare(b.url, 'en'))
  const chinaMaps = describeChinaMaps(maps, chinaMapRequests, areaByCode)
  const coverage = {
    countries: countries.length,
    phoneRegions: phones.length,
    subdivisions: uniqueSubdivisions.length,
    countriesWithoutWorldGeometry: countries
      .filter(
        (country) =>
          !worldMap.features.some((feature) => feature.properties.countryCode === country.code),
      )
      .map((country) => country.code),
    subdivisionsWithoutChineseTranslation: uniqueSubdivisions
      .filter((s) => !s.chineseName)
      .map((s) => s.code),
    chinaAreas: flat.length,
    chinaAreasWithoutCenter: flat.filter((a) => !a.center).map((a) => a.adcode),
    chinaAreasUsingPinyin: flat.filter((a) => a.englishNameKind === 'pinyin').length,
    chinaAreasWithoutBoundary: flat
      .filter((a) => !boundaryProperties.has(a.adcode))
      .map((a) => a.adcode),
    dataVAdcodesAbsentFromVant: [...boundaryProperties.keys()]
      .filter((code) => !areaByCode.has(code))
      .sort(),
    maps: ids,
    chinaMapDepth: args.has('--province-only') ? 'province' : 'prefecture',
    chinaOutlineOnlyMaps: chinaOutlineOnlyMaps.sort(),
    chinaMaps,
    chinaMapsWithoutFull: chinaMaps
      .filter((map) => map.fullEndpointStatus === 'not-found')
      .map((map) => map.code),
    chinaMapsWithFullErrors: chinaMaps
      .filter((map) => map.fullEndpointStatus === 'error')
      .map((map) => map.code),
  }
  const content = {
    schemaVersion: 3,
    packages,
    icu: process.versions.icu,
    cldr: process.versions.cldr,
    sources,
    coverage,
  }
  const fingerprint = await dataFingerprint(content, stage)
  const manifest = {
    ...content,
    fingerprint,
    updatedAt:
      previousManifest?.fingerprint === fingerprint
        ? previousManifest.updatedAt
        : new Date().toISOString(),
  }
  await emit(
    'CHINA_MAP_COVERAGE.md',
    await chinaMapCoverageMarkdown(chinaMaps, coverage.chinaMapDepth),
  )
  await emit('data-manifest.json', JSON.stringify(manifest, null, 2) + '\n')
  for (const [pkg, input, output] of [
    ['@vant/area-data', 'LICENSE', 'vant-area-data.txt'],
    ['i18n-iso-countries', 'LICENSE', 'i18n-iso-countries.txt'],
    ['libphonenumber-js', 'LICENSE', 'libphonenumber-js.txt'],
    ['libphonenumber-js', 'LICENSE.Apache', 'google-libphonenumber-Apache-2.0.txt'],
    ['pinyin-pro', 'LICENSE', 'pinyin-pro.txt'],
    ['cldr-core', 'LICENSE', 'unicode-cldr-core.txt'],
    ['cldr-localenames-full', 'LICENSE', 'unicode-cldr-localenames.txt'],
  ])
    await emit(`licenses/${output}`, await readFile(`node_modules/${pkg}/${input}`, 'utf8'))
  await emit(
    'licenses/echarts-3.8.5-BSD-3-Clause.txt',
    await readFile('scripts/notices/echarts-3.8.5-BSD-3-Clause.txt', 'utf8'),
  )
  for (const name of ['echarts-world-Apache-2.0.txt', 'echarts-world-NOTICE.txt'])
    await emit(`licenses/${name}`, await readFile(`scripts/notices/${name}`, 'utf8'))
  for (const folder of ['generated', 'data']) {
    await rm(`src/${folder}`, { recursive: true, force: true })
    await rename(`${stage}/${folder}`, `src/${folder}`)
  }
  await rename(`${stage}/data-manifest.json`, 'data-manifest.json')
  await rename(`${stage}/CHINA_MAP_COVERAGE.md`, 'CHINA_MAP_COVERAGE.md')
  await rm('licenses', { recursive: true, force: true })
  await rename(`${stage}/licenses`, 'licenses')
  await writeFile(
    '.cache/update-report.json',
    JSON.stringify(
      {
        status: 'success',
        requestFailures,
        sourceFallbacks,
        chinaMapCoverage: {
          requested: chinaMaps.length,
          withChildBoundaries: chinaMaps.filter((map) => map.hasChildBoundaries).length,
          withoutFull: coverage.chinaMapsWithoutFull,
          fullErrors: coverage.chinaMapsWithFullErrors,
        },
        startedAt,
        checkedAt: new Date().toISOString(),
        changed: previousManifest?.fingerprint !== fingerprint,
        fingerprint,
        sources: sourceChecks.sort((a, b) => a.url.localeCompare(b.url, 'en')),
      },
      null,
      2,
    ) + '\n',
  )
  console.log(
    `Updated: ${countries.length} countries, ${phones.length} phone regions, ${uniqueSubdivisions.length} subdivisions, ${flat.length} China areas, ${maps.size} maps.`,
  )
  console.log(
    `DataV coverage: ${chinaMaps.length} maps checked; ${coverage.chinaMapsWithoutFull.length} full endpoints returned 404; ${coverage.chinaMapsWithFullErrors.length} other full endpoint errors. See CHINA_MAP_COVERAGE.md.`,
  )
  console.log(
    `${coverage.chinaAreasWithoutCenter.length} Vant areas lack DataV centers; see data-manifest.json for exact coverage gaps.`,
  )
} catch (error) {
  await writeFile(
    '.cache/update-report.json',
    JSON.stringify(
      {
        status: 'failed',
        requestFailures,
        sourceFallbacks,
        details: errorDetails(error),
        startedAt,
        checkedAt: new Date().toISOString(),
        error: error.message,
        sources: sourceChecks,
      },
      null,
      2,
    ) + '\n',
  )
  throw error
} finally {
  await rm(stage, { recursive: true, force: true })
}
