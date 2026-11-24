import { ref as archiveRef } from '@idux/archive-app/vue'
import { watch } from 'vue'
import { locale } from './locale'
import messages from './messages.json'

// Archive bundles its own Vue runtime. Bridge the locale into that runtime so
// generated navigation, page props and demo metadata update with the examples.
const archiveLocale = archiveRef(locale.value)
const stop = watch(locale, (value) => (archiveLocale.value = value), { flush: 'sync' })
if (import.meta.hot) import.meta.hot.dispose(stop)

export function archiveText(message: string): string {
  return archiveLocale.value === 'en'
    ? (messages[message as keyof typeof messages] ?? message)
    : message
}

export function localizedPage<T>(chinese: T, english: T): T {
  return archiveLocale.value === 'en' ? english : chinese
}

export function archiveLanguage() {
  return archiveLocale.value === 'en' ? 'en' : 'zh'
}

export function localizeArchiveOptions<T>(options: T): T {
  function visit(value: unknown) {
    if (!value || typeof value !== 'object') return
    for (const [key, original] of Object.entries(value)) {
      // Archive snapshots navigation names while building its menu data. Keep
      // their source labels stable and translate them in the menu renderer.
      if (key === 'name' && 'type' in value) continue
      if (['name', 'title', 'description'].includes(key) && typeof original === 'string') {
        Object.defineProperty(value, key, {
          enumerable: true,
          configurable: true,
          get: () => archiveText(original),
        })
      } else if (key === 'demoImports' && Array.isArray(original)) {
        Object.assign(value, {
          demoImports: original.map((load) => async () => {
            const module = await load()
            // Imported module namespaces are immutable; localize a copy of the metadata.
            const demo = { ...module.default }
            for (const key of ['title', 'description']) {
              const text = demo[key]
              if (typeof text === 'string') {
                Object.defineProperty(demo, key, {
                  enumerable: true,
                  get: () => archiveText(text),
                })
              }
            }
            return { ...module, default: demo }
          }),
        })
      } else {
        visit(original)
      }
    }
  }
  visit(options)
  return options
}
