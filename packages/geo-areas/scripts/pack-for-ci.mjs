import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const packageDirectory = fileURLToPath(new URL('..', import.meta.url))
const manifestPath = new URL('../package.json', import.meta.url)
const repository = process.env.GITHUB_REPOSITORY
if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository))
  throw new Error('GITHUB_REPOSITORY is required')
const original = await readFile(manifestPath, 'utf8')
try {
  const manifest = JSON.parse(original)
  manifest.repository = {
    type: 'git',
    url: `git+https://github.com/${repository}.git`,
    directory: 'packages/geo-areas',
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  execFileSync('pnpm', ['--config.ignore-scripts=true', 'pack', '--out', 'release.tgz'], {
    cwd: packageDirectory,
    stdio: 'inherit',
  })
} finally {
  await writeFile(manifestPath, original)
}
