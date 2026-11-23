import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'

for (const mode of ['network', 'http', 'json'])
  test(`${mode} failure reports every source and preserves snapshots`, async () => {
    const expectedError =
      mode === 'http'
        ? /HTTP 404/
        : mode === 'json'
          ? /Unexpected token/
          : /Simulated upstream network failure/
    const files = [
      'data-manifest.json',
      'CHINA_MAP_COVERAGE.md',
      'src/generated/china.ts',
      'src/data/maps/100000.json',
    ]
    const hashes = async () =>
      Promise.all(
        files.map(async (file) =>
          createHash('sha256')
            .update(await readFile(file))
            .digest('hex'),
        ),
      )
    const before = await hashes()
    let previousReport
    try {
      previousReport = await readFile('.cache/update-report.json')
    } catch {}
    try {
      assert.throws(
        () =>
          execFileSync(
            process.execPath,
            ['--import', './test/fail-fetch.mjs', 'scripts/update.mjs'],
            { stdio: 'pipe', env: { ...process.env, GEO_AREAS_TEST_FETCH_MODE: mode } },
          ),
        (error) => {
          assert.equal(error.status, 1)
          assert.match(error.stderr.toString(), expectedError)
          return true
        },
      )
      const report = JSON.parse(await readFile('.cache/update-report.json', 'utf8'))
      assert.equal(report.status, 'failed')
      assert.equal(report.requestFailures.length, 21)
      assert.equal(new Set(report.requestFailures.map((failure) => failure.url)).size, 7)
      assert.ok(report.requestFailures.every((failure) => expectedError.test(failure.error)))
      if (mode === 'http')
        assert.ok(report.requestFailures.every((failure) => failure.status === 404))
      assert.equal(report.details.errors.length, 6)
      assert.equal(report.sourceFallbacks.length, 1)
      assert.equal(report.sourceFallbacks[0].status, 'failed')
      assert.match(report.sourceFallbacks[0].to, /100000\.json$/)
      assert.match(report.error, /geo.datav.aliyun.com/)
      assert.match(report.error, /echarts.apache.org/)
      assert.ok(Number.isFinite(Date.parse(report.checkedAt)))
    } finally {
      if (previousReport) await writeFile('.cache/update-report.json', previousReport)
      else await rm('.cache/update-report.json', { force: true })
    }
    assert.deepEqual(await hashes(), before)
  })
