import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadDataVMap } from '../scripts/datav.mjs'

const code = '441900'
const full = `https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`
const outline = full.replace('_full', '')
const map = {
  type: 'FeatureCollection',
  features: [
    {
      properties: { adcode: 441900 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      },
    },
  ],
}
function fixture(responses) {
  const calls = []
  const recoveries = []
  return {
    calls,
    recoveries,
    load: () =>
      loadDataVMap(
        code,
        async (url, validate) => {
          calls.push(url)
          const result = responses[url]
          if (result instanceof Error) throw result
          validate(result)
          return result
        },
        (entry) => recoveries.push(entry),
      ),
  }
}
test('successful full map never requests the standalone outline', async () => {
  const f = fixture({ [full]: map })
  assert.deepEqual(await f.load(), { map, outlineOnly: false })
  assert.deepEqual(f.calls, [full])
  assert.deepEqual(f.recoveries, [])
})
for (const failure of [
  new Error(`HTTP 404: ${full}`),
  new Error('Network timeout'),
  { type: 'FeatureCollection', features: [] },
])
  test(`failed full response falls back to standalone outline: ${failure.message ?? 'empty map'}`, async () => {
    const f = fixture({ [full]: failure, [outline]: map })
    assert.deepEqual(await f.load(), { map, outlineOnly: true })
    assert.deepEqual(f.calls, [full, outline])
    assert.equal(f.recoveries[0].status, 'success')
    assert.ok(f.recoveries[0].reason)
  })
test('both failures report both endpoints and never fabricate a map', async () => {
  const f = fixture({
    [full]: new Error(`HTTP 404: ${full}`),
    [outline]: new Error(`HTTP 503: ${outline}`),
  })
  await assert.rejects(f.load(), (error) => {
    assert.equal(error.errors.length, 2)
    assert.ok(error.message.includes(full) && error.message.includes(outline))
    return true
  })
  assert.equal(f.recoveries[0].status, 'failed')
})
test('fallback rejects a different region instead of silently accepting it', async () => {
  const wrong = structuredClone(map)
  wrong.features[0].properties.adcode = 442000
  const f = fixture({ [full]: new Error('HTTP 404'), [outline]: wrong })
  await assert.rejects(f.load(), /Unexpected DataV outline: 441900/)
})

test('HTTP 404 is distinguished from temporary or validation failures in coverage', async () => {
  for (const [status, expected] of [
    [404, 'not-found'],
    [503, 'error'],
    [null, 'error'],
  ]) {
    const error = new Error('full endpoint failed', {
      cause: Object.assign(new Error('request failed'), { status }),
    })
    const f = fixture({ [full]: error, [outline]: map })
    await f.load()
    assert.equal(f.recoveries[0].fullEndpointStatus, expected)
    assert.equal(f.recoveries[0].fullHttpStatus, status)
  }
})
