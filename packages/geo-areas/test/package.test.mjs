import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, access, rm, cp, mkdir, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { generateApiDocs } from '../scripts/generate-api-docs.mjs'
import { generateReadmeDocs } from '../scripts/generate-readme-docs.mjs'

test('the packed package has usable documentation and loads maps outside the workspace', async () => {
  // Keep a space in the path to catch shell argument splitting on Windows.
  const directory = await mkdtemp(join(tmpdir(), 'geo areas-package-'))
  try {
    const archive = join(directory, 'package.tgz')
    // Run the lifecycle's CLI through Node so Windows shims and spaces need no shell.
    const pnpm = process.env.npm_execpath
    execFileSync(
      pnpm ? process.execPath : 'pnpm',
      [...(pnpm ? [pnpm] : []), '--config.ignore-scripts=true', 'pack', '--out', archive],
      { stdio: 'pipe' },
    )
    // Extract from inside the temp dir with a relative name: GNU tar reads a
    // drive-letter colon in the -f argument as a remote host spec ("C:").
    execFileSync('tar', ['-xzf', basename(archive), '-C', directory], { cwd: directory })
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
        assert.ok(path.startsWith(root + sep), `${file}: link escapes package: ${target}`)
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
    // Directory symlinks need elevated rights on Windows; junctions do not.
    await symlink(
      resolve('node_modules'),
      join(directory, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir',
    )
    execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: directory, stdio: 'pipe' })
    await access(join(directory, 'dist/index.js'))
    await access(join(directory, 'dist/data/maps/world.json'))
    await assert.rejects(access(join(directory, 'README.md')), { code: 'ENOENT' })
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
