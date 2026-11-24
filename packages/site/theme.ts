import { computed, ref, watch } from 'vue'
import { getThemeTokens } from '@idux/components/theme'

const storageKey = 'idux-geo-areas-theme'
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
function savedTheme() {
  try {
    const value = localStorage.getItem(storageKey)
    return value === 'dark' || value === 'light' ? value : undefined
  } catch {
    return undefined
  }
}
// Keep a session preference even when browser storage is unavailable.
let preference = savedTheme()
export const siteTheme = ref(preference ?? (systemTheme.matches ? 'dark' : 'light'))
export const isDark = computed(() => siteTheme.value === 'dark')
export const themeTokens = computed(() =>
  getThemeTokens(isDark.value ? 'dark' : 'default', undefined, undefined),
)
export function toggleTheme() {
  siteTheme.value = isDark.value ? 'light' : 'dark'
  preference = siteTheme.value
  try {
    localStorage.setItem(storageKey, siteTheme.value)
  } catch {
    // Storage can be disabled; switching still works for the current page.
  }
}
const onSystemChange = () => {
  if (!preference) siteTheme.value = systemTheme.matches ? 'dark' : 'light'
}
const onStorage = (event: StorageEvent) => {
  if (event.key === storageKey || event.key === null) {
    preference = savedTheme()
    siteTheme.value = preference ?? (systemTheme.matches ? 'dark' : 'light')
  }
}
systemTheme.addEventListener('change', onSystemChange)
window.addEventListener('storage', onStorage)
const stop = watch(
  isDark,
  (dark) => {
    for (const [key, value] of Object.entries(themeTokens.value)) {
      if (key.startsWith('color') && typeof value === 'string') {
        const name = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        document.documentElement.style.setProperty(`--site-${name}`, value)
      }
    }
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  },
  { immediate: true },
)
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    stop()
    systemTheme.removeEventListener('change', onSystemChange)
    window.removeEventListener('storage', onStorage)
  })

export const mapPalette = computed(() => ({
  area: isDark.value ? '#30445b' : '#e1e8f1',
  border: isDark.value ? '#53677e' : '#ffffff',
  emphasis: isDark.value ? '#43617e' : '#c5d8ef',
  text: themeTokens.value.colorText,
}))
