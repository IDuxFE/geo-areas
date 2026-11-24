import { chinaData } from './generated/china.js'
import { countryData } from './generated/countries.js'
import { getLocale } from './locale.js'
import type { AreaOption, ChinaArea } from './types.js'
export const chinaAreas: readonly ChinaArea[] = chinaData
/** Full country → province → city → district tree. chinaAreas remains province-first. */
export const chinaAreaTree: ChinaArea = {
  adcode: '100000',
  parentCode: null,
  level: 'country',
  name: countryData.find((country) => country.code === 'CN')!.name,
  englishNameKind: 'english',
  center: null,
  centroid: null,
  children: chinaData,
}
const byCode = new Map<string, ChinaArea>()
function index(areas: readonly ChinaArea[]) {
  for (const area of areas) {
    byCode.set(area.adcode, area)
    if (area.children) index(area.children)
  }
}
index([chinaAreaTree])
export function getChinaArea(adcode: string | number): ChinaArea | undefined {
  return byCode.get(String(adcode))
}
export function getChinaAreaOptions(depth: 1 | 2 | 3 = 3): AreaOption[] {
  const locale = getLocale()
  function options(areas: readonly ChinaArea[], remaining: number): AreaOption[] {
    return areas.map((area) => ({
      value: area.adcode,
      label: area.name[locale],
      level: area.level,
      ...(remaining > 1 && area.children?.length
        ? { children: options(area.children, remaining - 1) }
        : {}),
    }))
  }
  return options(chinaAreas, depth)
}
