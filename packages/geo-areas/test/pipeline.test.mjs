import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, cp, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { build } from 'esbuild'
import iso from 'i18n-iso-countries'
import { useCascaderAreaData } from '@vant/area-data'

const exec = promisify(execFile)
const hash = (value) => createHash('sha256').update(value).digest('hex')
const geometry = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ],
  ],
}
const feature = (properties, shape = geometry) => ({ type: 'Feature', properties, geometry: shape })
const collection = (features) => ({ type: 'FeatureCollection', features })
const ne = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson'
const worldUrl =
  'https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json'
const chinaUrl = 'https://raw.githubusercontent.com/apache/echarts/3.8.5/map/json/china.json'
const datav = (code, full = true) =>
  `https://geo.datav.aliyun.com/areas_v3/bound/${code}${full ? '_full' : ''}.json`

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'geo-areas-pipeline-'))
  try {
    for (const folder of ['responses', 'src', 'scripts', '.cache'])
      await mkdir(join(directory, folder), { recursive: true })
    await symlink(resolve('node_modules'), join(directory, 'node_modules'), 'dir')
    await cp('scripts/notices', join(directory, 'scripts/notices'), { recursive: true })
    const sources = new Map()
    const provinces = useCascaderAreaData()
    const countries = Object.keys(iso.getAlpha2Codes()).slice(0, 210)
    const outlines = countries.map((code) => feature({ ISO_A2: code, NAME: code }))
    // Exercise merging multiple source polygons under the same stable ISO id.
    outlines.push(feature({ ISO_A2: countries[0], NAME: countries[0] }))
    sources.set(`${ne}/ne_50m_admin_0_countries.geojson`, collection(outlines))
    sources.set(worldUrl, collection(countries.map((code) => feature({ name: code }))))
    const labels = Array.from({ length: 3001 }, (_, i) =>
      feature(
        {
          iso_a2: 'US',
          iso_3166_2: `US-T${i}`,
          name: `Test ${i}`,
          ...(i === 0 ? { name_zh: '测试', name_en: 'Test 0' } : {}),
        },
        { type: 'Point', coordinates: [1, 1] },
      ),
    )
    labels.push(feature({ iso_a2: 'invalid', name: 'Ignored' }))
    sources.set(`${ne}/ne_10m_admin_1_label_points_details.geojson`, collection(labels))
    sources.set(
      `${ne}/ne_50m_admin_1_states_provinces.geojson`,
      collection([
        feature({ iso_a2: 'US', iso_3166_2: 'US-T0', name: 'Test 0', name_zh: '测试' }),
        feature({ iso_a2: 'US', iso_3166_2: 'US-T0', name: 'Test 0', name_zh: '测试' }),
        feature({ iso_a2: 'CN', iso_3166_2: 'CN-TEST' }),
      ]),
    )
    sources.set(chinaUrl, {
      UTF8Encoding: true,
      UTF8Scale: 1,
      features: provinces.map((p) => ({
        ...feature({}, { type: 'Polygon', coordinates: ['@@B@@BAA'], encodeOffsets: [[0, 0]] }),
        id: p.value,
      })),
    })
    const chinaFeature = (node, level) =>
      feature({ adcode: node.value, name: node.text, level, center: [1, 1], centroid: [1, 1] })
    sources.set(datav('100000'), collection(provinces.map((p) => chinaFeature(p, 'province'))))
    for (const province of provinces) {
      const cities = province.children ?? []
      sources.set(
        datav(province.value),
        collection(
          cities.length
            ? cities.map((c) => chinaFeature(c, 'city'))
            : [chinaFeature(province, 'province')],
        ),
      )
      for (const city of cities) {
        sources.set(datav(city.value), '404')
        sources.set(datav(city.value, false), collection([chinaFeature(city, 'city')]))
      }
    }
    for (const [url, value] of sources)
      await writeFile(
        join(directory, 'responses', `${hash(url)}.json`),
        value === '404' ? value : JSON.stringify(value),
      )
    return { directory, sources }
  } catch (error) {
    await rm(directory, { recursive: true, force: true })
    throw error
  }
}
function run(directory, script, args = [], offline = false) {
  return exec(
    process.execPath,
    [
      resolve('test/helpers/pipeline-runner.mjs'),
      directory,
      pathToFileURL(resolve(`scripts/${script}.mjs`)).href,
      ...args,
    ],
    {
      env: { ...process.env, GEO_PIPELINE_OFFLINE: offline ? '1' : '0' },
      maxBuffer: 4 * 1024 * 1024,
      timeout: 60000,
    },
  )
}
const json = async (directory, file) => JSON.parse(await readFile(join(directory, file), 'utf8'))
async function compile(directory) {
  const entries = (await readdir('src')).filter(
    (name) => name.endsWith('.ts') && name !== 'types.ts',
  )
  for (const name of entries) await cp(`src/${name}`, join(directory, 'src', name))
  await build({
    entryPoints: entries.map((name) => join(directory, 'src', name)),
    outdir: join(directory, 'dist'),
    platform: 'node',
    format: 'esm',
  })
  await build({
    entryPoints: (await readdir(join(directory, 'src/generated'))).map((name) =>
      join(directory, 'src/generated', name),
    ),
    outdir: join(directory, 'dist/generated'),
    platform: 'node',
    format: 'esm',
  })
  await cp(join(directory, 'src/data'), join(directory, 'dist/data'), { recursive: true })
}

test(
  'offline fixtures cover update, cache stability, audit reconciliation and corruption rejection',
  { timeout: 120000 },
  async () => {
    const { directory } = await fixture()
    try {
      await run(directory, 'update')
      const first = await json(directory, 'data-manifest.json')
      const report = await json(directory, '.cache/update-report.json')
      assert.equal(report.status, 'success')
      assert.equal(report.changed, true)
      assert.equal(first.coverage.subdivisions, 3001)
      assert.equal(first.coverage.chinaMapDepth, 'prefecture')
      assert.ok(first.coverage.chinaOutlineOnlyMaps.length > 0)
      assert.ok(
        report.sourceFallbacks.every(
          (item) => item.status === 'success' && item.fullHttpStatus === 404,
        ),
      )
      const us = await json(directory, 'src/data/maps/US-provinces.json')
      assert.equal(us.features.length, 1)
      assert.equal(us.features[0].geometry.type, 'MultiPolygon')
      assert.equal(us.features[0].geometry.coordinates.length, 2)
      assert.ok(
        (await readFile(join(directory, 'licenses/unicode-cldr-core.txt'), 'utf8')).length > 0,
      )

      // Failed full endpoints are retried; successful raw sources must use cache.
      await run(directory, 'update', ['--cached'])
      const cached = await json(directory, 'data-manifest.json')
      assert.equal(cached.fingerprint, first.fingerprint)
      assert.equal(cached.updatedAt, first.updatedAt)
      const cachedReport = await json(directory, '.cache/update-report.json')
      assert.equal(cachedReport.changed, false)
      assert.ok(cachedReport.sources.every((source) => source.mode === 'cache'))

      await run(directory, 'update', ['--cached', '--refresh-datav'])
      const refreshed = await json(directory, '.cache/update-report.json')
      assert.equal(refreshed.changed, false)
      assert.ok(
        refreshed.sources
          .filter((source) => new URL(source.url).hostname === 'geo.datav.aliyun.com')
          .every((source) => source.mode === 'network'),
      )
      assert.ok(
        refreshed.sources
          .filter((source) => new URL(source.url).hostname === 'raw.githubusercontent.com')
          .every((source) => source.mode === 'cache'),
      )

      await compile(directory)
      const audit = await run(directory, 'audit', [], true)
      const auditReport = await json(directory, 'audit/data-audit.json')
      assert.deepEqual(auditReport.conversionErrors, [])
      assert.equal(auditReport.counts.sourceHashesVerified, first.sources.length)
      assert.equal(auditReport.fingerprint, first.fingerprint)
      assert.ok(JSON.parse(audit.stdout).dataVMapsCompared > 34)
      assert.match(await readFile(join(directory, 'audit/README.md'), 'utf8'), /3001/)

      const source = first.sources[0]
      const cacheFile = join(directory, '.cache', `${hash(source.url)}.json`)
      const bytes = await readFile(cacheFile)
      await writeFile(cacheFile, '{}')
      await assert.rejects(run(directory, 'audit', [], true), /AssertionError/)
      await rm(cacheFile)
      await assert.rejects(run(directory, 'audit', [], true), /ENOENT/)
      await writeFile(cacheFile, bytes)
      const worldPath = join(directory, 'dist/data/maps/world.json')
      const world = await json(directory, 'dist/data/maps/world.json')
      world.features[0].geometry.coordinates[0][1] = [2, 0]
      await writeFile(worldPath, JSON.stringify(world))
      await assert.rejects(run(directory, 'audit', [], true), /ECharts world polygons/)

      // A late validation failure must leave all previously published bytes intact.
      const before = await readFile(join(directory, 'src/data/maps/world.json'))
      const invalid = collection(
        Array.from({ length: 210 }, (_, i) =>
          feature(
            { name: Object.keys(iso.getAlpha2Codes())[i] },
            { type: 'Point', coordinates: [0, 0] },
          ),
        ),
      )
      await writeFile(
        join(directory, 'responses', `${hash(worldUrl)}.json`),
        JSON.stringify(invalid),
      )
      await assert.rejects(run(directory, 'update'), /Invalid geometry: world/)
      assert.deepEqual(await readFile(join(directory, 'src/data/maps/world.json')), before)
      assert.deepEqual(await json(directory, 'data-manifest.json'), cached)
      assert.equal((await json(directory, '.cache/update-report.json')).status, 'failed')
      assert.ok(!(await readdir(directory)).some((name) => name.startsWith('.update-')))
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  },
)

test(
  'province-only updates work entirely from cache and reject unknown arguments',
  { timeout: 60000 },
  async () => {
    const { directory, sources } = await fixture()
    try {
      for (const [url, value] of sources)
        if (value !== '404')
          await writeFile(join(directory, '.cache', `${hash(url)}.json`), JSON.stringify(value))
      await run(directory, 'update', ['--cached', '--province-only'], true)
      const manifest = await json(directory, 'data-manifest.json')
      assert.equal(manifest.coverage.chinaMapDepth, 'province')
      assert.equal(manifest.coverage.chinaMaps.length, 35)
      assert.ok(
        (await json(directory, '.cache/update-report.json')).sources.every(
          (source) => source.mode === 'cache',
        ),
      )
      await assert.rejects(
        run(directory, 'update', ['--unknown'], true),
        /Unknown argument: --unknown/,
      )
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  },
)
