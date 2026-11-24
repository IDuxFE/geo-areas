import { rm, cp, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { generateApiDocs } from './generate-api-docs.mjs'
import { generateReadmeDocs } from './generate-readme-docs.mjs'

await generateApiDocs()
await generateReadmeDocs()
await rm('dist', { recursive: true, force: true })
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc'], { stdio: 'inherit' })
await cp('src/data', 'dist/data', { recursive: true })
await cp('data-manifest.json', 'dist/data-manifest.json')
await writeFile(
  'dist/data-manifest.d.ts',
  "import type { DataManifest } from './types.js'\ndeclare const data: DataManifest\nexport default data\n",
)
await writeFile(
  'dist/data/map.d.ts',
  "import type { MapGeoJSON } from '../types.js'\ndeclare const data: MapGeoJSON\nexport default data\n",
)
