import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import iso from 'i18n-iso-countries'
import { useCascaderAreaData } from '@vant/area-data'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js'
import { countries } from '../dist/countries.js'
import { chinaAreas } from '../dist/china.js'
import { subdivisions } from '../dist/subdivisions.js'
import { phoneRegions } from '../dist/phone.js'
import { availableMaps, loadGeoJSON } from '../dist/geojson.js'
import { validateChinaMapCoverage } from './validate-coverage.mjs'
import { format } from 'oxfmt'
import { generateContinents } from './continents.mjs'

process.chdir(fileURLToPath(new URL('..', import.meta.url)))
assert.equal(
  await readFile('src/generated/continents.ts', 'utf8'),
  generateContinents(),
  'Continent snapshot must match CLDR',
)
const require = createRequire(import.meta.url)
const codeMappings = require('cldr-core/supplemental/codeMappings.json').supplemental.codeMappings
const manifest = JSON.parse(await readFile('data-manifest.json', 'utf8'))
const maps = new Map(
  await Promise.all(availableMaps.map(async (id) => [id, await loadGeoJSON(id)])),
)
const sorted = (values) => [...values].sort()
const sameCodes = (actual, expected, context) =>
  assert.deepEqual(sorted(actual), sorted(expected), context)
const rawSources = new Map()
for (const source of manifest.sources) {
  const key = createHash('sha256').update(source.url).digest('hex')
  const bytes = await readFile(`.cache/${key}.json`)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.url)
  rawSources.set(source.url, JSON.parse(bytes))
}
const flat = []
const flatten = (nodes) => {
  for (const node of nodes) {
    flat.push(node)
    if (node.children) flatten(node.children)
  }
}
flatten(chinaAreas)
const areaByCode = new Map(flat.map((area) => [area.adcode, area]))
const expectedAreas = []
const walkVant = (nodes, parentCode = '100000') => {
  for (const node of nodes) {
    expectedAreas.push(node.value)
    const actual = areaByCode.get(node.value)
    assert.equal(actual?.parentCode, parentCode, node.value)
    assert.equal(actual.name['zh-CN'], node.text, node.value)
    if (node.children) walkVant(node.children, node.value)
  }
}
walkVant(useCascaderAreaData())
sameCodes(areaByCode.keys(), expectedAreas, 'Vant entries')
sameCodes(
  countries.map((c) => c.code),
  Object.keys(iso.getAlpha2Codes()).filter((code) => Number(codeMappings[code]?._numeric) < 900),
  'ISO entries',
)
sameCodes(
  phoneRegions.map((p) => p.countryCode),
  getCountries(),
  'Phone entries',
)
for (const phone of phoneRegions)
  assert.equal(phone.callingCode, `+${getCountryCallingCode(phone.countryCode)}`)
const boundaryByCode = new Map()
let checkedDataVMaps = 0
for (const [url, source] of rawSources) {
  const match = url.match(/areas_v3\/bound\/(\d{6})(?:_full)?\.json$/)
  if (!match) continue
  checkedDataVMaps++
  const shipped = maps.get(match[1])
  assert.ok(shipped, match[1])
  sameCodes(
    shipped.features.map((f) => f.properties.code),
    source.features.map((f) => String(f.properties.adcode)),
    url,
  )
  for (const feature of source.features) {
    const code = String(feature.properties.adcode)
    const actual = shipped.features.find((f) => f.properties.code === code)
    assert.deepEqual(actual.geometry, feature.geometry, `${url}/${code} geometry`)
    if (/^\d{6}$/.test(code)) boundaryByCode.set(code, feature.properties)
  }
}
const raw = (name) => [...rawSources].find(([url]) => url.endsWith(name))?.[1]
const labels = raw('ne_10m_admin_1_label_points_details.geojson')
const expectedSubdivisionCodes = labels.features
  .filter(
    ({ properties: p }) =>
      iso.isValid(p.iso_a2) && p.iso_3166_2?.startsWith(`${p.iso_a2}-`) && p.name,
  )
  .map((f) => f.properties.iso_3166_2)
sameCodes(
  subdivisions.map((s) => s.code),
  new Set(expectedSubdivisionCodes),
  'Natural Earth subdivision entries',
)
// Compare every source polygon, including multipart ISO units combined by the generator.
const polygons = (geometry) =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
const checkPolygons = (id, code, features) => {
  const actual = maps.get(id)?.features.find((f) => f.properties.code === code)
  assert.ok(actual, `${id}/${code}`)
  sameCodes(
    polygons(actual.geometry).map(JSON.stringify),
    features.flatMap((f) => polygons(f.geometry)).map(JSON.stringify),
    `${id}/${code} polygons`,
  )
}
const worldSource = raw('world.json')
sameCodes(
  maps
    .get('world')
    .features.flatMap((f) => polygons(f.geometry))
    .map((p) => JSON.stringify(p)),
  worldSource.features
    .flatMap((f) => polygons(f.geometry))
    .filter((p) => p.length > 0)
    .map((p) => JSON.stringify(p)),
  'ECharts world polygons',
)
sameCodes(
  maps.get('CN-provinces').features.map((f) => f.properties.code),
  chinaAreas.map((a) => a.adcode),
  'ECharts China province codes',
)
const outlines = raw('ne_50m_admin_0_countries.geojson')
const outlineGroups = new Map()
for (const f of outlines.features) {
  const p = f.properties
  const code = [p.ISO_A2_EH, p.ISO_A2, p.ADM0_A3]
    .map((c) => iso.alpha3ToAlpha2(c) || c)
    .find((c) => iso.isValid(c))
  if (!code) continue
  if (!outlineGroups.has(code)) outlineGroups.set(code, [])
  outlineGroups.get(code).push(f)
}
for (const [code, features] of outlineGroups) checkPolygons(code, code, features)
const adminGroups = new Map()
for (const f of raw('ne_50m_admin_1_states_provinces.geojson').features) {
  const p = f.properties
  if (p.iso_a2 === 'CN' || !iso.isValid(p.iso_a2) || !p.iso_3166_2?.startsWith(`${p.iso_a2}-`))
    continue
  const key = `${p.iso_a2}-provinces/${p.iso_3166_2}`
  if (!adminGroups.has(key)) adminGroups.set(key, [])
  adminGroups.get(key).push(f)
}
for (const [key, features] of adminGroups) checkPolygons(...key.split('/'), features)
for (const [id, map] of maps) {
  assert.ok(map.features.length, id)
  const codes = new Set()
  for (const f of map.features) {
    const p = f.properties
    assert.ok(p.code && !codes.has(p.code), `${id}/${p.code}`)
    codes.add(p.code)
    assert.ok(p.names.en && p.names['zh-CN'], `${id}/${p.code} names`)
    assert.ok(polygons(f.geometry).length, `${id}/${p.code} geometry`)
    for (const poly of polygons(f.geometry)) {
      assert.ok(poly.length)
      for (const ring of poly) {
        assert.ok(ring.length >= 4, `${id}/${p.code} ring`)
        assert.deepEqual(ring[0], ring.at(-1))
        for (const point of ring)
          assert.ok(
            point.length === 2 &&
              point.every(Number.isFinite) &&
              Math.abs(point[0]) <= 180 &&
              Math.abs(point[1]) <= 90,
          )
      }
    }
  }
}
validateChinaMapCoverage(maps, manifest.coverage.chinaMapDepth === 'prefecture')
const describeArea = (a) => ({
  code: a.adcode,
  name: a.name['zh-CN'],
  parentCode: a.parentCode,
  level: a.level,
})
const missingAreas = flat.filter((a) => !boundaryByCode.has(a.adcode)).map(describeArea)
sameCodes(
  missingAreas.map((a) => a.code),
  manifest.coverage.chinaAreasWithoutBoundary,
  'manifest boundary gaps',
)
sameCodes(
  flat.filter((a) => !a.center).map((a) => a.adcode),
  manifest.coverage.chinaAreasWithoutCenter,
  'manifest center gaps',
)
const extraBoundaries = [...boundaryByCode]
  .filter(([code]) => !areaByCode.has(code))
  .map(([code, p]) => ({ code, name: p.name, level: p.level }))
sameCodes(
  extraBoundaries.map((a) => a.code),
  manifest.coverage.dataVAdcodesAbsentFromVant,
  'manifest unmatched DataV codes',
)
const outlineOnly = manifest.coverage.chinaOutlineOnlyMaps.map((code) => {
  const map = maps.get(code)
  assert.equal(map.features.length, 1, code)
  assert.equal(map.features[0].properties.code, code)
  const parent = [...maps].find(
    ([id, candidate]) =>
      id !== code &&
      /^\d{6}$/.test(id) &&
      candidate.features.some((f) => f.properties.code === code),
  )
  assert.ok(parent, code)
  assert.ok(
    manifest.sources.some((source) => source.url.endsWith(`/${code}.json`)),
    `${code} standalone outline source`,
  )
  return { code, name: map.features[0].properties.name, parent: parent[0] }
})
const missingWorld = countries
  .filter((c) => !maps.get('world').features.some((f) => f.properties.countryCode === c.code))
  .map((c) => ({ code: c.code, name: c.name['zh-CN'], standaloneMap: maps.has(c.code) }))
sameCodes(
  missingWorld.map((c) => c.code),
  manifest.coverage.countriesWithoutWorldGeometry,
  'manifest world coverage',
)
const untranslated = subdivisions
  .filter((s) => !s.chineseName)
  .map((s) => ({ code: s.code, name: s.name.en }))
sameCodes(
  untranslated.map((s) => s.code),
  manifest.coverage.subdivisionsWithoutChineseTranslation,
  'manifest translations',
)
const provinceGroups = chinaAreas
  .map((p) => ({
    code: p.adcode,
    name: p.name['zh-CN'],
    unmatched: missingAreas.filter((a) => a.code.startsWith(p.adcode.slice(0, 2))),
  }))
  .filter((p) => p.unmatched.length)
const report = {
  fingerprint: manifest.fingerprint,
  scope:
    'Snapshot/source reconciliation; not an authoritative current administrative-boundary certification.',
  counts: {
    countries: countries.length,
    phoneRegions: phoneRegions.length,
    subdivisions: subdivisions.length,
    chinaAreas: flat.length,
    maps: manifest.coverage.maps.length,
    sourceHashesVerified: rawSources.size,
    dataVMapsCompared: checkedDataVMaps,
  },
  conversionErrors: [],
  outlineOnly,
  chinaAreasWithoutBoundary: provinceGroups,
  dataVAdcodesAbsentFromVant: extraBoundaries,
  countriesWithoutWorldGeometry: missingWorld,
  countriesWithoutStandaloneMap: countries
    .filter((c) => !maps.has(c.code))
    .map((c) => ({ code: c.code, name: c.name['zh-CN'] })),
  subdivisionsWithoutBoundary: subdivisions
    .filter(
      (s) =>
        !maps.get(`${s.countryCode}-provinces`)?.features.some((f) => f.properties.code === s.code),
    )
    .map((s) => ({ code: s.code, name: s.name['zh-CN'] })),
  subdivisionsWithoutChineseTranslation: untranslated,
}
await mkdir('audit', { recursive: true })
await writeFile('audit/data-audit.json', JSON.stringify(report, null, 2) + '\n')
const md = `# 全量数据核对报告\n\n数据指纹：\`${manifest.fingerprint}\`。\n\n${countries.length} 个国家／地区、${phoneRegions.length} 条电话记录、${subdivisions.length} 个全球一级行政区、${flat.length} 个中国行政节点、${manifest.coverage.maps.length} 张地图。核验 ${rawSources.size} 份缓存源文件 SHA-256，逐要素比对 ${checkedDataVMaps} 张 DataV 地图的代码和原始几何，并比对 Natural Earth 独立国家及一级行政区的全部选中多边形。所有检查通过，未发现转换丢失。国家、电话与中国层级逐条和依赖源核对；所有地图检查代码唯一、双语名称、坐标与闭环。\n\n## 已修复\n\n34 个上游无下级边界的市级要素曾未生成独立地图，现先获取 \`_full.json\`，失败后再获取同代码 \`.json\` 本级轮廓。连同台湾省，共 ${outlineOnly.length} 张本级轮廓地图。页面统一显示区域填色，避免把不能继续下钻误认为数据缺失。\n\n| 父地图 | 本级轮廓 |\n| --- | --- |\n${outlineOnly.map((a) => `| ${a.parent} | ${a.code} ${a.name} |`).join('\n')}\n\n## 数据源覆盖差异（尚未补齐）\n\n这些数字相互重叠，不能相加为错误总数。保留真实源数据，不猜测代码对应关系或绘制缺失边界。完整逐项名称与代码见 [data-audit.json](./data-audit.json)。\n\n- 中国层级 ${missingAreas.length} 个节点没有同码 DataV 边界；其中台港澳 ${missingAreas.filter((a) => /^(71|81|82)/.test(a.code)).length} 个，其余 ${missingAreas.filter((a) => !/^(71|81|82)/.test(a.code)).length} 个。包含虚拟分组、镇街／开发区、区划变更和源覆盖差异；未逐项认证现行区划。\n- DataV ${extraBoundaries.length} 个边界代码未出现在 Vant 中。几何仍保留在地图内。\n- 全球总览未单独绘制 ${missingWorld.length} 个 ISO 条目，其中 ${missingWorld.filter((a) => a.standaloneMap).length} 个有独立地图；${report.countriesWithoutStandaloneMap.length} 个 ISO 条目没有独立国家轮廓。\n- 全球一级行政区 ${report.subdivisionsWithoutBoundary.length} 个没有同码 1:50m 边界（文字来源为 1:10m 数据；多数国家上游未提供该比例尺一级区划）。\n- ${untranslated.length} 个全球一级行政区缺少中文译名，显示源名称。\n\n| 省级区域 | 无同码边界的层级节点 |\n| --- | --- |\n${provinceGroups.map((p) => `| ${p.name} | ${p.unmatched.length} |`).join('\n')}\n\n## 复查\n\n运行 \`pnpm audit:data\`，使用与 manifest 哈希一致的缓存源进行离线核对；缺缓存或任一不一致时失败。用 \`pnpm update:data\` 刷新源，再重新核对。本报告证明对所记录源快照的保留情况，不证明上游已覆盖最新行政区划。\n`
const formatted = await format('README.md', md)
if (formatted.errors.length) throw new Error(JSON.stringify(formatted.errors))
await writeFile('audit/README.md', formatted.code)
console.log(
  JSON.stringify(
    {
      ...report.counts,
      outlineOnly: outlineOnly.length,
      missingAreas: missingAreas.length,
      extraBoundaries: extraBoundaries.length,
      missingWorld: missingWorld.length,
      missingCountryOutlines: report.countriesWithoutStandaloneMap.length,
      subdivisionsWithoutBoundary: report.subdivisionsWithoutBoundary.length,
      untranslated: untranslated.length,
    },
    null,
    2,
  ),
)
