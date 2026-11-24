import { readFile, writeFile } from 'node:fs/promises'

const siteRoot = new URL('../../site/src/', import.meta.url)
const packageRoot = new URL('../', import.meta.url)
const packageLink = 'https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/'

// This order is also the reading order of the standalone package reference.
const chapters = [
  '0-guide/reference/API',
  'examples/countries/API',
  'examples/phone/API',
  'examples/china/API',
  'examples/maps/API',
  '0-guide/reference/Manifest',
]

export async function generateApiDocs(outputRoot = packageRoot) {
  for (const locale of ['en', 'zh']) {
    const suffix = locale === 'en' ? '.en' : ''
    const bodies = []
    for (const chapter of chapters) {
      const source = new URL(`${chapter}${suffix}.md`, siteRoot)
      const markdown = await readFile(source, 'utf8')
      const frontMatter = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/)
      if (!frontMatter) throw new Error(`Missing front matter: ${source.pathname}`)
      const body = markdown.slice(frontMatter[0].length).trim()
      if (!/^## /m.test(body)) throw new Error(`Missing API chapter: ${source.pathname}`)
      bodies.push(
        body.replace(/\]\(([^)]+)\)/g, (link, target) =>
          target.startsWith(packageLink) ? `](${target.slice(packageLink.length)})` : link,
        ),
      )
    }
    const languageLinks =
      locale === 'en' ? 'English | [简体中文](API.zh.md)' : '[English](API.md) | 简体中文'
    const name = locale === 'en' ? 'API.md' : 'API.zh.md'
    await writeFile(
      new URL(name, outputRoot),
      [
        '<!-- Generated from packages/site/src/ by pnpm docs:sync. Edit the site source documents, not this file. -->',
        '# @idux/geo-areas API',
        languageLinks,
        ...bodies,
      ].join('\n\n') + '\n',
    )
  }
}
