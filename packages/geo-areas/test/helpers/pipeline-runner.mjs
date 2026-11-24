// Keep the real script URLs for coverage, but redirect its initial chdir and
// audit imports into the disposable package created by pipeline.test.mjs.
import { register } from 'node:module'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const [directory, script, ...args] = process.argv.slice(2)
const chdir = process.chdir.bind(process)
process.chdir = () => {
  chdir(directory)
  process.chdir = chdir
}
register(
  `data:text/javascript,${encodeURIComponent(`
  import { pathToFileURL } from 'node:url'
  let directory, script
  export function initialize(data) { ({ directory, script } = data) }
  export function resolve(specifier, context, nextResolve) {
    if (context.parentURL === script && specifier.startsWith('../dist/'))
      return nextResolve(pathToFileURL(directory + '/' + specifier.slice(3)).href, context)
    return nextResolve(specifier, context)
  }
`)}`,
  { data: { directory, script } },
)
const retried = new Set()
globalThis.fetch = async (url, options) => {
  if (process.env.GEO_PIPELINE_OFFLINE === '1') throw new Error(`Unexpected network: ${url}`)
  const key = createHash('sha256').update(url).digest('hex')
  const text = await readFile(`${directory}/responses/${key}.json`, 'utf8')
  if (text === '404') return new Response('Not found', { status: 404 })
  const bytes = Buffer.from(text)
  if (new URL(url).hostname === 'raw.githubusercontent.com' && bytes.length > 262144) {
    const [start, end] = options.headers.Range.slice(6).split('-').map(Number)
    const last = Math.min(end, bytes.length - 1)
    // One changed ETag forces a bounded retry before accepting a range.
    const retry = start > 0 && !retried.has(url)
    if (retry) retried.add(url)
    return new Response(bytes.subarray(start, last + 1), {
      status: 206,
      headers: {
        etag: retry ? 'changed' : 'fixture-v1',
        'content-range': `bytes ${start}-${last}/${bytes.length}`,
      },
    })
  }
  return new Response(text)
}
process.argv = [process.execPath, script, ...args]
await import(script)
