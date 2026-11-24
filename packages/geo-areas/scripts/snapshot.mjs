import { mkdir, rename, rm } from 'node:fs/promises'
import { join } from 'node:path'

/** Serialize updates in one checkout. A crash leaves the lock for explicit recovery. */
export async function acquireUpdateLock(root = '.') {
  const lock = join(root, '.update-lock')
  try {
    await mkdir(lock)
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error(
        `Another update or interrupted update owns ${lock}. Check running processes and recovery backups before removing the lock.`,
        { cause: error },
      )
    throw error
  }
  return () => rm(lock, { recursive: true })
}

/** Roll back caught installation errors; retain backups if rollback itself fails.
 * Multi-path replacement is not crash-atomic: a killed process requires recovery
 * from the retained .update-backup-* directory before removing .update-lock.
 */
export async function installSnapshot(stage, root = '.', fs = { mkdir, rename, rm }) {
  const backup = join(root, `.update-backup-${process.pid}`)
  const entries = [
    ['generated', 'src/generated'],
    ['data', 'src/data'],
    ['data-manifest.json', 'data-manifest.json'],
    ['CHINA_MAP_COVERAGE.md', 'CHINA_MAP_COVERAGE.md'],
    ['licenses', 'licenses'],
  ]
  await fs.mkdir(backup)
  const moved = []
  const installed = []
  try {
    for (const [source, target] of entries) {
      const destination = join(root, target)
      const saved = join(backup, source)
      try {
        await fs.rename(destination, saved)
        moved.push([saved, destination])
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
      await fs.rename(join(stage, source), destination)
      installed.push(destination)
    }
  } catch (error) {
    const failures = []
    for (const destination of installed.reverse()) {
      try {
        await fs.rm(destination, { recursive: true, force: true })
      } catch (failure) {
        failures.push(failure)
      }
    }
    for (const [saved, destination] of moved.reverse()) {
      try {
        await fs.rename(saved, destination)
      } catch (failure) {
        failures.push(failure)
      }
    }
    if (failures.length)
      throw Object.assign(
        new AggregateError(
          [error, ...failures],
          `Snapshot rollback failed; recover original files from ${backup}`,
          { cause: error },
        ),
        { code: 'SNAPSHOT_RECOVERY_REQUIRED' },
      )
    await fs.rm(backup, { recursive: true, force: true })
    throw error
  }
  try {
    await fs.rm(backup, { recursive: true, force: true })
  } catch (error) {
    throw Object.assign(
      new Error(
        `Snapshot installed but backup cleanup failed at ${backup}; verify installed files before removing the backup and lock.`,
        { cause: error },
      ),
      { code: 'SNAPSHOT_RECOVERY_REQUIRED' },
    )
  }
}
