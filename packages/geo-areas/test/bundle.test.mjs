import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { execFileSync } from 'node:child_process'
import { rm } from 'node:fs/promises'

test('browser bundlers split map assets and bundled ESM runs in Node', async () => {
  const outdir = '.cache/test-bundle'
  try {
    const result = await build({
      entryPoints: ['test/consumer.ts'],
      outdir,
      bundle: true,
      splitting: true,
      format: 'esm',
      platform: 'browser',
      target: 'es2022',
      metafile: true,
      minify: true,
    })
    const entry = Object.entries(result.metafile.outputs).find(
      ([, value]) => value.entryPoint === 'test/consumer.ts',
    )
    assert.ok(entry, 'consumer entry exists')
    assert.ok(entry[1].bytes < 100000, 'initial loader excludes geometry data')
    assert.ok(
      Object.values(result.metafile.outputs).some((o) => o.entryPoint?.endsWith('/world.geo.js')),
      'world map is a separate chunk',
    )
    execFileSync(process.execPath, [entry[0]], { stdio: 'pipe' })
  } finally {
    await rm(outdir, { recursive: true, force: true })
  }
})
