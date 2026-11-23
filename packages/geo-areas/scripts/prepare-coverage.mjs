import { readdir } from 'node:fs/promises'
import { build } from 'esbuild'

// Tests import dist. Only coverage runs replace handwritten modules with mapped
// equivalents; large generated snapshots keep their normal build output.
const entryPoints = (await readdir('src'))
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
  .map((file) => `src/${file}`)
await build({
  entryPoints,
  outdir: 'dist',
  format: 'esm',
  platform: 'node',
  target: 'node22',
  sourcemap: 'linked',
  sourcesContent: true,
})
