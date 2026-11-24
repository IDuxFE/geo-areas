import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const adapter = fileURLToPath(new URL('../shared/archive-i18n.ts', import.meta.url))

// Keep localization at Archive's generated-data boundary, before it mounts.
// Both document imports stay static so Vite can split and package each language.
export function localizeArchiveModule(code) {
  const localized = code.replace(
    /["']?import["']?\s*:\s*\(\)\s*=>\s*import\(("archive-page:[^"]+\.md")\)/g,
    (_, source) => {
      const chinese = JSON.parse(source)
      const english = chinese.replace(/\.md$/, '.en.md')
      if (!existsSync(english.slice('archive-page:'.length))) {
        throw new Error(`Missing English document: ${english}`)
      }
      return `get import() { return localizedPage(() => import(${source}), () => import(${JSON.stringify(english)})) }`
    },
  )
  if (!localized.includes('export default {')) throw new Error('Unsupported Archive mount options')
  return `import { localizeArchiveOptions, localizedPage } from ${JSON.stringify(adapter)}\n${localized.replace('export default {', 'const mountOptions = {')}\nexport default localizeArchiveOptions(mountOptions)\n`
}

export function localizedArchive() {
  return {
    name: 'geo-areas-localized-archive',
    transform(code, id) {
      if (id === '/__resolved__virtual:archive-app-mount-options') {
        return { code: localizeArchiveModule(code), map: null }
      }
    },
  }
}
