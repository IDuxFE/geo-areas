import { readFile, writeFile } from 'node:fs/promises'

const output = new URL('../dist/', import.meta.url)
const entry = new URL('index.html', output)
const html = (await readFile(entry, 'utf8'))
  .replace('<title>archive Demos</title>', '<title>iDux Geo Areas</title>')
  .replace('<html>', '<html lang="zh-CN">')
await writeFile(entry, html)
await writeFile(new URL('404.html', output), html)
await writeFile(new URL('.nojekyll', output), '')
