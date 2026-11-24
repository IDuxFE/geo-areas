import { createApp } from 'vue'
import {
  cloneVNode,
  isVNode,
  defineComponent,
  h,
  onMounted,
  onBeforeUnmount,
  ref,
  getCurrentInstance,
  nextTick,
  watch,
} from '@idux/archive-app/vue'
import SiteControls from './SiteControls.vue'
import './theme.css'
import { archiveText, archiveLanguage } from '@/shared/archive-i18n'
import { renderLocalizedMenu, syncArchiveComponentLocale } from '@/shared/archive-components.mjs'

// Archive has its own Vue runtime; mount the site controls with the demo runtime.
const SiteControlHost = defineComponent({
  setup() {
    syncArchiveComponentLocale()
    const host = ref<HTMLElement>()
    const app = createApp(SiteControls)
    onMounted(() => app.mount(host.value!))
    onBeforeUnmount(() => app.unmount())
    return () => h('div', { ref: host })
  },
})

const LocalizedDemos = defineComponent({
  setup(_, { slots }) {
    // Archive's BaseContent exposes this refresh method, but only refreshes
    // automatically when tabs or demo visibility change, not metadata labels.
    const content = getCurrentInstance()?.parent?.exposed
    watch(archiveLanguage, () => nextTick(() => content?.updateAnchor()), { flush: 'post' })
    return () => slots.default?.()
  },
})

// Archive's generated HTML uses a generic title; set the site title in dev too.
document.title = 'iDux Geo Areas'

export default {
  renderers: {
    layoutSiderContent: renderLocalizedMenu,
    layoutHeaderContent: renderLocalizedMenu,
    pageContent: (_data: unknown, nodes: unknown) =>
      h(LocalizedDemos, null, {
        default: () =>
          Array.isArray(nodes)
            ? nodes.map((node) =>
                isVNode(node) ? cloneVNode(node, { lang: archiveLanguage() }) : node,
              )
            : nodes,
      }),
    layoutSiderHeaderLabel: () =>
      h('span', { class: 'archive-app__sider-header-label' }, archiveText('导航')),
    layoutSiderFooter: () => h(SiteControlHost),
    layoutHeaderExtra: () => h(SiteControlHost),
    logo: () =>
      h('a', { href: import.meta.env.BASE_URL, 'aria-label': 'iDux Geo Areas' }, [
        h('h1', { class: 'site-logo-full' }, 'iDux Geo Areas'),
        h('span', { class: 'site-logo-compact', 'aria-hidden': 'true' }, 'Geo'),
      ]),
  },
}
