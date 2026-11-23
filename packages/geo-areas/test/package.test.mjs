import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, access, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

test('the packed package has usable documentation and loads maps outside the workspace', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'geo-areas-package-'))
  try {
    const archive = join(directory, 'package.tgz')
    execFileSync('pnpm', ['--config.ignore-scripts=true', 'pack', '--out', archive], {
      stdio: 'pipe',
    })
    execFileSync('tar', ['-xzf', archive, '-C', directory])
    const root = join(directory, 'package')
    for (const file of [
      'README.md',
      'API.md',
      'THIRD_PARTY_NOTICES.md',
      'CHINA_MAP_COVERAGE.md',
      'audit/README.md',
    ]) {
      const markdown = await readFile(join(root, file), 'utf8')
      for (const [, target] of markdown.matchAll(/\]\(([^)]+)\)/g)) {
        if (/^(?:[a-z]+:|#)/i.test(target)) continue
        const path = resolve(root, dirname(file), target.split('#')[0])
        assert.ok(path.startsWith(root + '/'), `${file}: link escapes package: ${target}`)
        await access(path)
      }
    }
    const module = pathToFileURL(join(root, 'dist/geojson.js')).href
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
      import assert from 'node:assert/strict'
      const { availableMaps, loadGeoJSON } = await import(${JSON.stringify(module)})
      for (const id of availableMaps) assert.ok((await loadGeoJSON(id)).features.length, id)
    `,
      ],
      { stdio: 'pipe' },
    )
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
