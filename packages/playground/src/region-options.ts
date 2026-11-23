import containmentData from 'cldr-core/supplemental/territoryContainment.json'
import { getPhoneOptions } from '@idux/geo-areas/phone'
import { getCountryOptions } from '@idux/geo-areas/countries'
import type { Locale } from '@idux/geo-areas/types'

const containment: Record<string, { _contains: string[] }> =
  containmentData.supplemental.territoryContainment

const continents = [
  ['142', '亚洲', 'Asia'],
  ['150', '欧洲', 'Europe'],
  ['003', '北美洲', 'North America'],
  ['005', '南美洲', 'South America'],
  ['002', '非洲', 'Africa'],
  ['009', '大洋洲', 'Oceania'],
  ['010', '南极洲', 'Antarctica'],
] as const

const commonRegions = ['CN', 'HK', 'MO', 'TW', 'JP', 'US', 'GB']

function territories(region: string): string[] {
  const children = containment[region]?._contains
  return children ? children.flatMap(territories) : [region]
}

const continentByRegion = new Map(
  continents.flatMap(([id]) => territories(id).map((region) => [region, id] as const)),
)

function groupByContinent<T extends { value: string }>(options: T[], locale: Locale) {
  return [
    ...continents.map(([id, zh, en]) => ({
      value: id,
      label: locale === 'zh-CN' ? zh : en,
      children: options.filter((option) => continentByRegion.get(option.value) === id),
    })),
    {
      value: 'other',
      label: locale === 'zh-CN' ? '其他地区' : 'Other regions',
      children: options.filter((option) => !continentByRegion.has(option.value)),
    },
  ].filter((group) => group.children.length > 0)
}

export function getGroupedCountryOptions(locale: Locale) {
  return groupByContinent(getCountryOptions(locale), locale)
}

export function getGroupedPhoneOptions(locale: Locale) {
  const options = getPhoneOptions(locale)
  const byRegion = new Map(options.map((option) => [option.value, option]))
  const common = commonRegions.flatMap((region) => {
    const option = byRegion.get(region)
    return option ? [option] : []
  })
  return [
    { value: 'common', label: locale === 'zh-CN' ? '常用' : 'Common', children: common },
    ...groupByContinent(
      options.filter((option) => !commonRegions.includes(option.value)),
      locale,
    ),
  ].filter((group) => group.children.length > 0)
}
