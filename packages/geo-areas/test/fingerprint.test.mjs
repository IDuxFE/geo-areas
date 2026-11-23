import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dataFingerprint } from '../scripts/fingerprint.mjs'

test('data identity includes transformed names and geometry but excludes retrieval time', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'geo-areas-fingerprint-'))
  const content = {
    schemaVersion: 3,
    sources: [{ url: 'https://example.com/map', sha256: 'source-hash', firstRetrievedAt: 'old' }],
    coverage: { maps: ['world'] },
  }
  try {
    await mkdir(join(directory, 'generated'))
    await mkdir(join(directory, 'data'))
    await writeFile(join(directory, 'generated/countries.ts'), 'English name v1')
    await writeFile(join(directory, 'data/world.json'), '{"coordinates":[1,2]}')
    const original = await dataFingerprint(content, directory)
    assert.equal(
      await dataFingerprint(
        {
          ...content,
          sources: [{ ...content.sources[0], firstRetrievedAt: 'new' }],
        },
        directory,
      ),
      original,
    )
    await writeFile(join(directory, 'generated/countries.ts'), 'English name v2')
    assert.notEqual(await dataFingerprint(content, directory), original)
    await writeFile(join(directory, 'generated/countries.ts'), 'English name v1')
    await writeFile(join(directory, 'data/world.json'), '{"coordinates":[3,4]}')
    assert.notEqual(await dataFingerprint(content, directory), original)
    await writeFile(join(directory, 'data/world.json'), '{"coordinates":[1,2]}')
    assert.equal(await dataFingerprint(content, directory), original)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('the committed manifest fingerprints the current generated snapshot', async () => {
  const {
    fingerprint,
    updatedAt: _,
    ...content
  } = JSON.parse(await readFile('data-manifest.json', 'utf8'))
  assert.equal(await dataFingerprint(content, 'src'), fingerprint)
})
