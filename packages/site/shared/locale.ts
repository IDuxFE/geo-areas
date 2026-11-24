import { computed, ref, watch } from 'vue'
import { setLocale } from '@idux/geo-areas/locale'
import type { Locale } from '@idux/geo-areas/types'

const storageKey = 'idux-geo-areas-locale'
function savedLocale(): Locale {
  try {
    return localStorage.getItem(storageKey) === 'en' ? 'en' : 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

const currentLocale = ref<Locale>(savedLocale())
export const locale = computed(() => currentLocale.value)

/** Track the site language while the framework-independent API reads its shared locale. */
export function useLocalizedData<T>(create: () => T) {
  return computed(() => {
    void locale.value
    return create()
  })
}

export function toggleLocale() {
  currentLocale.value = locale.value === 'en' ? 'zh-CN' : 'en'
  try {
    localStorage.setItem(storageKey, locale.value)
  } catch {
    // Switching still works when browser storage is unavailable.
  }
}

const stop = watch(
  currentLocale,
  (value) => {
    setLocale(value)
    document.documentElement.lang = value
  },
  { immediate: true, flush: 'sync' },
)
const onStorage = (event: StorageEvent) => {
  if (event.key === storageKey || event.key === null) currentLocale.value = savedLocale()
}
window.addEventListener('storage', onStorage)
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    stop()
    window.removeEventListener('storage', onStorage)
  })
