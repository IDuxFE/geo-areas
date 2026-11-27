import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const guideRoot = new URL('../../site/src/0-guide/', import.meta.url)
const packageRoot = new URL('../', import.meta.url)
const packageLink = 'https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/'
const languageTargets = new Map([
  ['./DataSources.page.md', 'README.zh.md'],
  ['./DataSources.page.en.md', 'README.md'],
])

export async function generateReadmeDocs(outputRoot = packageRoot) {
  for (const [sourcePath, outputName] of languageTargets) {
    const source = new URL(sourcePath, guideRoot)
    const markdown = await readFile(source, 'utf8')
    const frontMatter = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/)
    if (!frontMatter) throw new Error(`Missing front matter: ${source.pathname}`)
    const body = markdown.slice(frontMatter[0].length).trim()
    if (!body.startsWith('# ')) throw new Error(`Missing guide title: ${source.pathname}`)
    const languageLinks =
      outputName === 'README.md'
        ? 'English | [简体中文](README.zh.md)'
        : '[English](README.md) | 简体中文'
    const introductionPath = sourcePath.replace('DataSources', 'GettingStarted')
    const introduction = (await readFile(new URL(introductionPath, guideRoot), 'utf8'))
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      .trim()
    if (!introduction.startsWith('# ')) throw new Error(`Missing guide title: ${introductionPath}`)
    const packaged = (introduction + '\n\n' + body.replace(/^# .+\n+/, ''))
      .replace(/^# .+/, `# @idux/geo-areas\n\n${languageLinks}`)
      .replace(/\]\(([^)]+)\)/g, (link, target) => {
        return target.startsWith(packageLink) ? `](${target.slice(packageLink.length)})` : link
      })
    await writeFile(
      new URL(outputName, outputRoot),
      '<!-- Generated from packages/site/src/0-guide/GettingStarted*.md and DataSources*.md by pnpm docs:sync. Edit the site source documents, not this file. -->\n\n' +
        packaged +
        '\n',
    )
  }
  // Rebasing license links changes table widths; format the packaged copies too.
  execFileSync(
    'pnpm',
    [
      'exec',
      'oxfmt',
      '--config',
      fileURLToPath(new URL('../../../.oxfmtrc.json', import.meta.url)),
      '--write',
      ...[...languageTargets.values()].map((name) => fileURLToPath(new URL(name, outputRoot))),
    ],
    // pnpm is a .cmd shim on Windows, which execFile cannot launch without a shell.
    { shell: process.platform === 'win32' },
  )
}
