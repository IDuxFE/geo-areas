import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, rename } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { acquireUpdateLock, installSnapshot } from '../scripts/snapshot.mjs'

const entries = ['generated', 'data', 'data-manifest.json', 'CHINA_MAP_COVERAGE.md', 'licenses']
const target = (name) => (['generated', 'data'].includes(name) ? `src/${name}` : name)
async function fixture(existing = true) {
  const root = await mkdtemp(join(tmpdir(), 'geo-snapshot-'))
  await mkdir(join(root, 'src'))
  const stage = join(root, 'stage')
  await mkdir(stage)
  for (const name of entries) {
    await writeFile(join(stage, name), `new:${name}`)
    if (existing) await writeFile(join(root, target(name)), `old:${name}`)
  }
  return { root, stage }
}
for (const existing of [true, false]) {
  test(`snapshot installs a complete generation (existing=${existing})`, async () => {
    const { root, stage } = await fixture(existing)
    try {
      await installSnapshot(stage, root)
      for (const name of entries)
        assert.equal(await readFile(join(root, target(name)), 'utf8'), `new:${name}`)
      assert.ok(!(await readdir(root)).some((name) => name.startsWith('.update-')))
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
}
// Fail every backup and install rename, including after some entries were installed.
for (let failAt = 1; failAt <= entries.length * 2; failAt++) {
  test(`installation failure at rename ${failAt} restores all original bytes`, async () => {
    const { root, stage } = await fixture()
    let calls = 0
    try {
      await assert.rejects(
        installSnapshot(stage, root, {
          mkdir,
          rm,
          rename: (...args) => {
            if (++calls === failAt) throw Object.assign(new Error('Disk failure'), { code: 'EIO' })
            return rename(...args)
          },
        }),
        /Disk failure/,
      )
      for (const name of entries)
        assert.equal(await readFile(join(root, target(name)), 'utf8'), `old:${name}`)
      assert.ok(!(await readdir(root)).some((name) => name.startsWith('.update-')))
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
}
test('failed rollback retains recoverable originals and reports their location', async () => {
  const { root, stage } = await fixture()
  let calls = 0
  try {
    await assert.rejects(
      installSnapshot(stage, root, {
        mkdir,
        rm,
        rename: (...args) => {
          if (++calls >= 4) throw new Error('Persistent disk failure')
          return rename(...args)
        },
      }),
      (error) =>
        error.code === 'SNAPSHOT_RECOVERY_REQUIRED' && /recover original files/.test(error.message),
    )
    assert.equal(
      await readFile(join(root, `.update-backup-${process.pid}`, 'data'), 'utf8'),
      'old:data',
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
test('updates reject concurrent writers and allow a new update after release', async () => {
  const root = await mkdtemp(join(tmpdir(), 'geo-lock-'))
  try {
    const release = await acquireUpdateLock(root)
    await assert.rejects(acquireUpdateLock(root), /Another update or interrupted update/)
    await release()
    await (
      await acquireUpdateLock(root)
    )()
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('backup cleanup failure keeps the complete new snapshot and requests recovery', async () => {
  const { root, stage } = await fixture()
  try {
    await assert.rejects(
      installSnapshot(stage, root, {
        mkdir,
        rename,
        rm: async () => {
          throw new Error('Cleanup failure')
        },
      }),
      (error) =>
        error.code === 'SNAPSHOT_RECOVERY_REQUIRED' && /Snapshot installed/.test(error.message),
    )
    for (const name of entries)
      assert.equal(await readFile(join(root, target(name)), 'utf8'), `new:${name}`)
    assert.equal(
      await readFile(join(root, `.update-backup-${process.pid}`, 'data'), 'utf8'),
      'old:data',
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
