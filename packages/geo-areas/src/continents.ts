import { continentData } from './generated/continents.js'
import { getLocale } from './locale.js'
import type { Locale, OptionGroup } from './types.js'

const continentByRegion = new Map(
  continentData.flatMap(({ code, regions }) => regions.map((region) => [region, code] as const)),
)

/** Preserve leaf fields and ordering; every option belongs to exactly one group. */
export function groupByContinent<T extends { value: string }>(options: T[]): OptionGroup<T>[] {
  const locale: Locale = getLocale()
  const groups: OptionGroup<T>[] = continentData.map(({ code, name }) => ({
    value: code,
    label: name[locale],
    children: [],
  }))
  const other: OptionGroup<T> = {
    value: 'other',
    label: locale === 'zh-CN' ? '其他地区' : 'Other regions',
    children: [],
  }
  const byCode = new Map(groups.map((group) => [group.value, group]))
  for (const option of options) {
    const code = continentByRegion.get(option.value)
    const group = byCode.get(code ?? '') ?? other
    group.children.push(option)
  }
  return [...groups, other].filter((group) => group.children.length > 0)
}
