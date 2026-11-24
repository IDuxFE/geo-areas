import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
const hash = (value) => createHash('sha256').update(value).digest('hex')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

export function errorDetails(error) {
  return {
    message: error.message,
    ...(error.status ? { status: error.status } : {}),
    ...(error.code ? { code: error.code } : {}),
    ...(error.cause ? { cause: errorDetails(error.cause) } : {}),
    ...(error.errors ? { errors: error.errors.map(errorDetails) } : {}),
  }
}
export async function allSources(promises) {
  const results = await Promise.allSettled(promises)
  const errors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason)
  if (errors.length)
    throw new AggregateError(errors, errors.map((error) => error.message).join('; '))
  return results.map((result) => result.value)
}
export async function parallel(items, fn, concurrency = 6) {
  let next = 0
  const errors = []
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (next < items.length) {
        const item = items[next++]
        try {
          await fn(item)
        } catch (error) {
          errors.push(error)
        }
      }
    }),
  )
  if (errors.length)
    throw new AggregateError(
      errors,
      `Source downloads failed; snapshots were not replaced: ${errors.map((error) => error.message).join('; ')}`,
    )
}

/** Own download retries, cache identity and source diagnostics for a single update. */
export function createSourceClient({ args, previousManifest }) {
  const sources = [],
    sourceChecks = [],
    requestFailures = []
  // Large raw GitHub files can stall on long connections. Range downloads are resumable,
  // bounded and use If-Range so a changing upstream cannot produce a mixed snapshot.
  async function request(url, options) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        await response.body?.cancel()
        throw Object.assign(new Error(`HTTP ${response.status}: ${url}`), {
          status: response.status,
        })
      }
      return response
    } catch (error) {
      const failure = {
        url,
        status: error.status ?? null,
        error: error.message,
        checkedAt: new Date().toISOString(),
      }
      requestFailures.push(failure)
      error.sourceFailureRecorded = true
      console.error(`Source request failed: ${url}: ${error.message}`)
      throw error
    }
  }
  async function downloadText(url) {
    if (new URL(url).hostname !== 'raw.githubusercontent.com') {
      const response = await request(url, { signal: AbortSignal.timeout(60000) })
      return response.text()
    }
    const size = 262144
    const first = await request(url, {
      headers: { Range: `bytes=0-${size - 1}` },
      signal: AbortSignal.timeout(60000),
    })
    if (first.status === 200) return first.text()
    assert(first.status === 206, `HTTP ${first.status}: ${url}`)
    const total = Number(first.headers.get('content-range')?.split('/')[1])
    const etag = first.headers.get('etag')
    assert(Number.isSafeInteger(total) && total > 0 && etag, `Invalid range response: ${url}`)
    const directory = `.cache/${hash(url)}.parts/${hash(etag)}`
    await mkdir(directory, { recursive: true })
    const chunks = Array.from({ length: Math.ceil(total / size) })
    chunks[0] = Buffer.from(await first.arrayBuffer())
    assert(chunks[0].length === Math.min(size, total), `Truncated first range: ${url}`)
    console.log(
      `Downloading ${new URL(url).pathname.split('/').at(-1)} (${(total / 1048576).toFixed(1)} MiB, resumable ranges)…`,
    )
    await parallel(
      Array.from({ length: chunks.length - 1 }, (_, i) => i + 1),
      async (index) => {
        const start = index * size
        const end = Math.min(total - 1, start + size - 1)
        const path = `${directory}/${index}`
        try {
          const cached = await readFile(path)
          if (cached.length === end - start + 1) {
            chunks[index] = cached
            return
          }
        } catch {}
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const r = await request(url, {
              headers: { Range: `bytes=${start}-${end}`, 'If-Range': etag },
              signal: AbortSignal.timeout(60000),
            })
            if (
              r.status !== 206 ||
              r.headers.get('etag') !== etag ||
              r.headers.get('content-range') !== `bytes ${start}-${end}/${total}`
            ) {
              await r.body?.cancel()
              throw new Error(`Changed source or invalid range: ${url}`)
            }
            const chunk = Buffer.from(await r.arrayBuffer())
            assert(chunk.length === end - start + 1, `Truncated range: ${url}`)
            await writeFile(path, chunk)
            chunks[index] = chunk
            return
          } catch (error) {
            if (attempt === 2) throw error
          }
        }
      },
    )
    return Buffer.concat(chunks).toString('utf8')
  }
  async function fetchJSON(url, validate = () => {}) {
    const file = `.cache/${hash(url)}.json`
    let text
    let mode = 'network'
    if (
      args.has('--cached') &&
      !(args.has('--refresh-datav') && new URL(url).hostname === 'geo.datav.aliyun.com')
    ) {
      try {
        text = await readFile(file, 'utf8')
      } catch {}
    }
    if (text) mode = 'cache'
    if (!text) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          text = await downloadText(url)
          validate(JSON.parse(text))
          await writeFile(file, text)
          break
        } catch (error) {
          if (!error.sourceFailureRecorded)
            requestFailures.push({
              url,
              status: null,
              error: error.message,
              checkedAt: new Date().toISOString(),
            })
          console.error(`Source attempt ${attempt + 1}/3 failed: ${url}: ${error.message}`)
          if (attempt === 2) throw new Error(`${url}: ${error.message}`, { cause: error })
        }
      }
    }
    const data = JSON.parse(text)
    validate(data)
    const sha256 = hash(text)
    const retrievedAt = (await stat(file)).mtime.toISOString()
    const previous = previousManifest?.sources.find(
      (source) => source.url === url && source.sha256 === sha256,
    )
    const firstRetrievedAt = previous?.firstRetrievedAt || retrievedAt
    sources.push({ url, sha256, firstRetrievedAt })
    sourceChecks.push({ url, sha256, mode, retrievedAt, checkedAt: new Date().toISOString() })
    return data
  }
  return { fetchJSON, sources, sourceChecks, requestFailures }
}
