import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { countries, getCountry, getCountryOptions } from '../dist/countries.js'
import { getPhoneRegion, getRegionsByCallingCode, getPhoneOptions } from '../dist/phone.js'
import { chinaAreas, chinaAreaTree, getChinaArea, getChinaAreaOptions } from '../dist/china.js'
import { getSubdivisions } from '../dist/subdivisions.js'
import { availableMaps, hasGeoJSON, loadGeoJSON } from '../dist/geojson.js'
import { use, registerMap, getMap } from 'echarts/core'
import { MapChart } from 'echarts/charts'
import { setLocale } from '../dist/locale.js'

beforeEach(() => setLocale('zh-CN'))
afterEach(() => setLocale('zh-CN'))

test('ISO identifiers, bilingual names and region identity are retained', () => {
  assert.ok(countries.length >= 249)
  assert.equal(getCountry('chn').code, 'CN')
  assert.equal(getCountry('156').code, 'CN')
  assert.equal(getCountry('cn').name['zh-CN'], '中国')
  assert.equal(getCountryOptions().find((option) => option.value === 'TW').label, '中国台湾')
  assert.equal(getCountry('CN').level, 'country')
  setLocale('en')
  assert.ok(getCountryOptions().some((o) => o.value === 'CN' && o.label === 'China'))
  assert.equal(new Set(countries.map((c) => c.code)).size, countries.length)
})
test('calling codes are not unique ids or NANP area prefixes', () => {
  assert.equal(getPhoneRegion('GL').callingCode, '+299')
  assert.equal(getPhoneRegion('JM').callingCode, '+1')
  assert.equal(getPhoneRegion('VA').callingCode, '+39')
  assert.equal(getPhoneRegion('CX').callingCode, '+61')
  assert.equal(getPhoneOptions().find((option) => option.value === 'TW').label, '中国台湾 (+886)')
  const shared = getRegionsByCallingCode('1')
  for (const code of ['US', 'CA', 'JM', 'DO']) assert.ok(shared.some((r) => r.countryCode === code))
  setLocale('en')
  const options = getPhoneOptions()
  assert.equal(new Set(options.map((o) => o.value)).size, options.length)
})
test('Vant hierarchy is preserved including municipality virtual city nodes', () => {
  assert.equal(chinaAreas.length, 34)
  assert.equal(chinaAreaTree.level, 'country')
  assert.equal(getChinaArea('100000'), chinaAreaTree)
  assert.equal(getChinaArea('370000').parentCode, '100000')
  assert.equal(getChinaArea('370000').level, 'province')
  assert.equal(getChinaArea('370100').level, 'city')
  assert.equal(getChinaArea('370102').level, 'district')
  const beijing = getChinaArea(110000)
  assert.equal(beijing.children[0].adcode, '110100')
  assert.equal(getChinaArea('110101').parentCode, '110100')
  assert.equal(getChinaArea('370000').name['zh-CN'], '山东省')
  assert.ok(getChinaArea('370000').center.every(Number.isFinite))
  setLocale('en')
  const options = getChinaAreaOptions(1)
  assert.ok(options.every((o) => !o.children && o.label))
  assert.equal(getChinaArea('000000'), undefined)
})
test('global subdivisions have stable country links and disclose untranslated names', () => {
  const us = getSubdivisions('us')
  assert.ok(us.some((s) => s.code === 'US-CA'))
  assert.equal(us.find((s) => s.code === 'US-CA').level, 'province')
  assert.ok(us.every((s) => s.countryCode === 'US' && s.name.en))
})
test('maps localize without mutating cached imports or sharing geometry', async () => {
  const zh = await loadGeoJSON('world')
  setLocale('en')
  const en = await loadGeoJSON('world')
  assert.ok(en.features.every((f) => f.properties.boundarySource === 'Apache ECharts example'))
  assert.equal(zh.features.find((f) => f.properties.countryCode === 'CN').properties.name, '中国')
  assert.equal(en.features.find((f) => f.properties.countryCode === 'CN').properties.name, 'China')
  assert.equal(
    en.features.find((f) => f.properties.countryCode === 'CN').properties.level,
    'country',
  )
  zh.features[0].geometry.coordinates.length = 0
  assert.ok((await loadGeoJSON('world')).features[0].geometry.coordinates.length > 0)
  await assert.rejects(loadGeoJSON('../phone'), /Unknown map/)
  await assert.rejects(loadGeoJSON('toString'), /Unknown map/)
  assert.equal(hasGeoJSON('370000'), true)
  assert.equal(hasGeoJSON(370000), true)
  assert.equal(hasGeoJSON('000000'), false)
})
test('every shipped map can be imported and coverage matches the manifest', async () => {
  const manifest = JSON.parse(await readFile(new URL('../data-manifest.json', import.meta.url)))
  // The manifest inventories source assets; china reuses an existing asset.
  assert.deepEqual(
    availableMaps.filter((id) => id !== 'china'),
    manifest.coverage.maps,
  )
  setLocale('en')
  for (const id of availableMaps) {
    const map = await loadGeoJSON(id)
    assert.ok(map.features.length, id)
    for (const f of map.features) assert.equal(f.properties.name, f.properties.names.en)
  }
})
test('china aliases CN-provinces with independent localized results', async () => {
  assert.equal(hasGeoJSON('china'), true)
  assert.ok(availableMaps.includes('china'))
  for (const locale of ['zh-CN', 'en']) {
    setLocale(locale)
    const alias = await loadGeoJSON('china')
    assert.deepEqual(alias, await loadGeoJSON('CN-provinces'))
    alias.features[0].geometry.coordinates.length = 0
    assert.ok((await loadGeoJSON('china')).features[0].geometry.coordinates.length > 0)
    assert.ok((await loadGeoJSON('CN-provinces')).features[0].geometry.coordinates.length > 0)
  }
  setLocale('zh-CN')
  const { default: asset } = await import('@idux/geo-areas/geojson/china.json', {
    with: { type: 'json' },
  })
  assert.deepEqual(asset, await loadGeoJSON('CN-provinces'))
})
test('ECharts accepts the generated maps and can access named regions', async () => {
  use([MapChart])
  const compactChina = await loadGeoJSON('CN-provinces')
  assert.equal(compactChina.features.length, 34)
  assert.equal(
    compactChina.features.find((f) => f.properties.code === '710000')?.properties.name,
    '中国台湾',
  )
  assert.ok(
    compactChina.features.every(
      (f) => f.properties.level === 'province' && hasGeoJSON(f.properties.code),
    ),
  )
  registerMap('test-china-compact', compactChina)
  assert.equal(getMap('test-china-compact').geoJSON.features.length, 34)
  registerMap('test-china', await loadGeoJSON('100000'))
  const map = getMap('test-china')
  assert.ok(map.geoJSON.features.some((f) => f.properties.name === '山东省'))
})
test(
  'adcode-named JSON assets are directly importable through public exports',
  { skip: !hasGeoJSON('632700') },
  async () => {
    const { default: map } = await import('@idux/geo-areas/geojson/632700.json', {
      with: { type: 'json' },
    })
    assert.ok(map.features.length > 0)
    assert.ok(map.features.some((f) => f.properties.adcode.startsWith('6327')))
  },
)
test('country outlines and public admin-1 maps are available separately', async () => {
  const us = await loadGeoJSON('US')
  assert.ok(
    us.features.every((f) => f.properties.countryCode === 'US' && f.properties.level === 'country'),
  )
  const states = await loadGeoJSON('US-provinces')
  assert.ok(states.features.some((f) => f.properties.code === 'US-CA'))
  assert.ok(states.features.every((f) => f.properties.level === 'province'))
})
