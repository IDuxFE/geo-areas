import { getPhoneOptions, getGroupedPhoneOptions } from '@idux/geo-areas/phone'
import { getLocale } from '@idux/geo-areas/locale'

const commonRegions = ['CN', 'HK', 'MO', 'TW', 'JP', 'US', 'GB']

export function getCommonGroupedPhoneOptions() {
  const locale = getLocale()
  const options = getPhoneOptions()
  const byRegion = new Map(options.map((option) => [option.value, option]))
  const common = commonRegions.flatMap((region) => {
    const option = byRegion.get(region)
    return option ? [option] : []
  })
  return [
    { value: 'common', label: locale === 'zh-CN' ? '常用' : 'Common', children: common },
    ...getGroupedPhoneOptions().map((group) => ({
      ...group,
      children: group.children.filter((option) => !commonRegions.includes(option.value)),
    })),
  ].filter((group) => group.children.length > 0)
}
