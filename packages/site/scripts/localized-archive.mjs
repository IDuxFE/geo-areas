import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const adapter = fileURLToPath(new URL('../shared/archive-i18n.ts', import.meta.url))

const javascriptEscapes = {
  '<': '\\u003C',
  '>': '\\u003E',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

// JSON quoting also needs HTML delimiters and JS line separators escaped for generated code.
export function serializeJavaScriptString(value) {
  return JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (character) => javascriptEscapes[character],
  )
}

// Keep localization at Archive's generated-data boundary, before it mounts.
// Both document imports stay static so Vite can split and package each language.
export function localizeArchiveModule(code) {
  const localized = code.replace(
    /["']?import["']?\s*:\s*\(\)\s*=>\s*import\(("archive-page:(?:\\.|[^"\\])*\.md")\)/g,
    (_, source) => {
      const chinese = JSON.parse(source)
      const english = chinese.replace(/\.md$/, '.en.md')
      if (!existsSync(english.slice('archive-page:'.length))) {
        throw new Error(`Missing English document: ${english}`)
      }
      return `get import() { return localizedPage(() => import(${serializeJavaScriptString(chinese)}), () => import(${serializeJavaScriptString(english)})) }`
    },
  )
  if (!localized.includes('export default {')) throw new Error('Unsupported Archive mount options')
  return `import { localizeArchiveOptions, localizedPage } from ${serializeJavaScriptString(adapter)}\n${localized.replace('export default {', 'const mountOptions = {')}\nexport default localizeArchiveOptions(mountOptions)\n`
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
