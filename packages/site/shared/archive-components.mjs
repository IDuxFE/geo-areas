import { h, resolveComponent, watchEffect } from '@idux/archive-app/vue'
import { IxMenu, useGlobalConfig, enUS, zhCN } from '@idux/archive-app/components'
import { archiveText, archiveLanguage } from './archive-i18n'

// Archive's component declarations refer to unpublished development dependencies.
// Keep this runtime bridge behind a small local declaration rather than importing
// the entire bundled component type surface into the site's TypeScript program.
export function syncArchiveComponentLocale() {
  const [, update] = useGlobalConfig('locale', zhCN)
  watchEffect(() => update(archiveLanguage() === 'en' ? enUS : zhCN))
}

export function renderLocalizedMenu(props) {
  const translate = (items) =>
    items?.map((item) => ({
      ...item,
      label: archiveText(item.name ?? item.label),
      children: translate(item.children),
    }))
  return h(
    IxMenu,
    { ...props, dataSource: translate(props.dataSource) },
    {
      itemLabel: (item) =>
        item.recordType === 'link'
          ? h(
              'a',
              { href: item.link, target: '_blank', rel: 'noopener noreferrer' },
              archiveText(item.name),
            )
          : h(
              resolveComponent('RouterLink'),
              { to: item.path },
              { default: () => archiveText(item.name) },
            ),
    },
  )
}
