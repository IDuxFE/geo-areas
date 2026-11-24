import { defineComponent, h, watchEffect } from 'vue'
import { useGlobalConfig } from '@idux/components/config'
import { enUS, zhCN } from '@idux/components/locales'
import { locale } from '@/shared/locale'
import { IxThemeProvider } from '@idux/components/theme'
import { addIconDefinitions, IDUX_ICON_DEPENDENCIES } from '@idux/components/icon'
import type { ArchiveLoaderVueSetup } from '@idux/archive-loader-vue'
import '@idux/cdk/index.css'
import '@idux/components/index.full.css'
import './demo.css'
import './theme.css'
import { isDark } from './theme'

addIconDefinitions(IDUX_ICON_DEPENDENCIES)

const DemoProvider = defineComponent({
  setup(_, { slots }) {
    const [, updateConfig] = useGlobalConfig('locale', zhCN)
    watchEffect(() => updateConfig(locale.value === 'en' ? enUS : zhCN))
    return () =>
      h(IxThemeProvider, { presetTheme: isDark.value ? 'dark' : 'default', hashed: false }, slots)
  },
})

const setup: ArchiveLoaderVueSetup = {
  renderApp: (children) => h(DemoProvider, null, { default: () => children }),
}

export default setup
