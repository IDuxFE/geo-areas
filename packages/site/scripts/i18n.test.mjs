import assert from 'node:assert/strict'
import { readdir, readFile, access } from 'node:fs/promises'
import { test } from 'node:test'
import { localizeArchiveModule } from './localized-archive.mjs'

const root = new URL('../src/', import.meta.url)
const messages = JSON.parse(await readFile(new URL('../shared/messages.json', import.meta.url)))

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) => {
        const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory)
        return entry.isDirectory() ? files(url) : [url]
      }),
    )
  ).flat()
}

test('every site document has an English counterpart and every navigation/demo label is translated', async () => {
  for (const file of await files(root)) {
    const source = await readFile(file, 'utf8')
    const labels = []
    if (file.pathname.endsWith('.md') && !file.pathname.endsWith('.en.md')) {
      await access(new URL(file.href.replace(/\.md$/, '.en.md')))
      const title = source.match(/^title: (.+)$/m)?.[1]
      if (title) labels.push(title)
    } else if (file.pathname.endsWith('/meta.json')) {
      const meta = JSON.parse(source)
      labels.push(meta.name, meta.title, meta.description)
    } else if (file.pathname.endsWith('.vue')) {
      const block = source.match(/<archive-meta[^>]*>([\s\S]*?)<\/archive-meta>/)?.[1]
      const meta = block ? JSON.parse(block) : {}
      labels.push(meta.title, meta.description)
    }
    for (const label of labels.filter(Boolean)) {
      if (/\p{Script=Han}/u.test(label)) {
        assert.ok(messages[label], `${file.pathname}: missing English text for ${label}`)
        assert.notEqual(messages[label], label)
      }
    }
  }
})

test('the Archive adapter preserves static imports for both document languages', () => {
  const document = new URL('../src/0-guide/GettingStarted.page.md', import.meta.url).pathname
  const source = `export default {pageData: {import: () => import(${JSON.stringify(`archive-page:${document}`)})}}`
  const result = localizeArchiveModule(source)
  assert.ok(result.includes(`import("archive-page:${document}")`))
  assert.ok(result.includes(`import("archive-page:${document.replace(/\.md$/, '.en.md')}")`))
  assert.ok(result.includes('get import()'))
  assert.throws(
    () => localizeArchiveModule(source.replace(document, '/missing/Guide.md')),
    /Missing English document/,
  )
  assert.throws(
    () => localizeArchiveModule('export default null'),
    /Unsupported Archive mount options/,
  )
})
