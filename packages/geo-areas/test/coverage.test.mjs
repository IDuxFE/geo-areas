import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { validateChinaMapCoverage } from '../scripts/validate-coverage.mjs'
import { availableMaps, loadGeoJSON, hasGeoJSON } from '../dist/geojson.js'
import { chinaMapCoverageMarkdown, describeChinaMaps } from '../scripts/china-map-coverage.mjs'
import { getChinaArea } from '../dist/china.js'

test('all province and city features have maps, including cities with no child boundaries', async () => {
  const manifest = JSON.parse(await readFile('data-manifest.json', 'utf8'))
  const maps = new Map(
    await Promise.all(availableMaps.map(async (id) => [id, await loadGeoJSON(id)])),
  )
  validateChinaMapCoverage(maps, manifest.coverage.chinaMapDepth === 'prefecture')
  if (manifest.coverage.chinaMapDepth !== 'prefecture') return
  const guangdong = maps.get('440000')
  assert.equal(guangdong.features.length, 21)
  for (const code of ['441900', '442000', '620200', '460400']) {
    assert.ok(manifest.coverage.chinaOutlineOnlyMaps.includes(code), code)
    assert.equal(maps.get(code).features.length, 1)
    assert.equal(maps.get(code).features[0].properties.code, code)
    assert.ok(manifest.sources.some((source) => source.url.endsWith(`/${code}.json`)))
  }
  maps.delete('441900')
  assert.throws(() => validateChinaMapCoverage(maps), /441900/)
})

test('published coverage describes requested map depth, 404s and fallback errors separately', async () => {
  const { coverage } = JSON.parse(await readFile('data-manifest.json', 'utf8'))
  assert.deepEqual(
    coverage.chinaMaps.map((map) => map.code),
    availableMaps.filter((id) => /^\d{6}$/.test(id)),
  )
  assert.deepEqual(
    coverage.chinaMapsWithoutFull,
    coverage.chinaMaps
      .filter((map) => map.fullEndpointStatus === 'not-found')
      .map((map) => map.code),
  )
  assert.deepEqual(
    coverage.chinaMapsWithFullErrors,
    coverage.chinaMaps.filter((map) => map.fullEndpointStatus === 'error').map((map) => map.code),
  )
  for (const record of coverage.chinaMaps) {
    const area = getChinaArea(record.code)
    if (area) assert.equal(record.level, area.level)
    const map = await loadGeoJSON(record.code)
    assert.equal(record.featureCount, map.features.length)
    const children = map.features.filter(
      (feature) =>
        feature.properties.code !== record.code && /^\d{6}$/.test(feature.properties.code),
    )
    assert.equal(record.hasChildBoundaries, children.length > 0)
    assert.deepEqual(
      record.childMapIds,
      children
        .map((f) => f.properties.code)
        .filter((code) => hasGeoJSON(code))
        .sort(),
    )
    if (record.fullEndpointStatus === 'not-found') {
      assert.equal(record.fullHttpStatus, 404)
      assert.equal(record.content, 'outline')
      assert.equal(record.hasChildBoundaries, false)
    }
    assert.ok(record.names.en && record.names['zh-CN'])
    assert.ok(!record.childMapIds.includes(record.code))
  }
})

test('coverage keeps Vant levels and generated documentation matches the snapshot', async () => {
  const { coverage } = JSON.parse(await readFile('data-manifest.json', 'utf8'))
  const area = getChinaArea('419001')
  const map = await loadGeoJSON('419001')
  assert.equal(map.features[0].properties.level, 'city')
  const [record] = describeChinaMaps(
    new Map([['419001', map]]),
    new Map([['419001', {}]]),
    new Map([['419001', area]]),
  )
  assert.equal(record.level, 'district')
  const markdown = await chinaMapCoverageMarkdown(coverage.chinaMaps, coverage.chinaMapDepth)
  assert.equal(markdown, await readFile('CHINA_MAP_COVERAGE.md', 'utf8'))
})
