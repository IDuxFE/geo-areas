import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, access, rm, cp, mkdir, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { generateApiDocs } from '../scripts/generate-api-docs.mjs'
import { generateReadmeDocs } from '../scripts/generate-readme-docs.mjs'

test('the packed package has usable documentation and loads maps outside the workspace', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'geo-areas-package-'))
  try {
    const archive = join(directory, 'package.tgz')
    execFileSync('pnpm', ['--config.ignore-scripts=true', 'pack', '--out', archive], {
      stdio: 'pipe',
    })
    execFileSync('tar', ['-xzf', archive, '-C', directory])
    const root = join(directory, 'package')
    await generateApiDocs(pathToFileURL(directory + '/'))
    await generateReadmeDocs(pathToFileURL(directory + '/'))
    for (const file of ['API.md', 'API.zh.md', 'README.md', 'README.zh.md']) {
      assert.equal(
        await readFile(join(root, file), 'utf8'),
        await readFile(join(directory, file), 'utf8'),
        `${file}: packed reference must match the current site sources; run pnpm docs:sync`,
      )
    }
    for (const file of [
      'README.md',
      'README.zh.md',
      'API.md',
      'API.zh.md',
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

test('the data package builds without site sources or workspace formatting tools', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'geo-areas-build-'))
  try {
    await mkdir(join(directory, 'scripts'))
    for (const path of [
      'src',
      'tsconfig.json',
      'data-manifest.json',
      'package.json',
      'scripts/build.mjs',
    ])
      await cp(path, join(directory, path), { recursive: true })
    await symlink(resolve('node_modules'), join(directory, 'node_modules'), 'dir')
    execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: directory, stdio: 'pipe' })
    await access(join(directory, 'dist/index.js'))
    await access(join(directory, 'dist/data/maps/world.json'))
    await assert.rejects(access(join(directory, 'README.md')), { code: 'ENOENT' })
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
