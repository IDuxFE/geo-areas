import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const validator = fileURLToPath(new URL('./validate-changesets.mjs', import.meta.url))
const config = JSON.parse(await readFile(new URL('../../.changeset/config.json', import.meta.url)))

test('Changeset validation works without git branches or pending release notes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'geo-areas-changesets-'))
  try {
    await mkdir(join(directory, '.changeset'))
    await mkdir(join(directory, 'packages/library'), { recursive: true })
    await writeFile(
      join(directory, 'package.json'),
      JSON.stringify({ name: 'fixture', private: true }),
    )
    await writeFile(join(directory, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')
    await writeFile(
      join(directory, 'packages/library/package.json'),
      JSON.stringify({ name: 'library', version: '1.0.0' }),
    )
    await writeFile(
      join(directory, '.changeset/config.json'),
      JSON.stringify({ ...config, ignore: [] }),
    )
    assert.match(
      execFileSync(process.execPath, [validator], { cwd: directory, encoding: 'utf8' }),
      /Validated 0 Changesets/,
    )
    await writeFile(
      join(directory, '.changeset/invalid.md'),
      '---\n"missing-package": patch\n---\n\nInvalid release target.\n',
    )
    assert.throws(() =>
      execFileSync(process.execPath, [validator], { cwd: directory, stdio: 'pipe' }),
    )
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
