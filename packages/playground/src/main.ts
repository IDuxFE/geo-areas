import { createApp } from 'vue'
import { addIconDefinitions, IDUX_ICON_DEPENDENCIES } from '@idux/components/icon'
import '@idux/cdk/index.css'
import '@idux/components/index.full.css'
import App from './App.vue'

addIconDefinitions(IDUX_ICON_DEPENDENCIES)

createApp(App).mount('#app')
