import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { generateContinents } from '../scripts/continents.mjs'
import { groupByContinent } from '../dist/continents.js'
import { getGroupedCountryOptions, getGroupedPhoneOptions, setLocale } from '@idux/geo-areas'
import { getCountryOptions } from '@idux/geo-areas/countries'
import { getPhoneOptions } from '@idux/geo-areas/phone'

test('continent snapshot reproduces the installed CLDR source', async () => {
  assert.equal(await readFile('src/generated/continents.ts', 'utf8'), generateContinents())
})

test('country and phone groups preserve every option exactly once in both locales', () => {
  try {
    for (const locale of ['zh-CN', 'en']) {
      setLocale(locale)
      for (const [flat, grouped] of [
        [getCountryOptions(), getGroupedCountryOptions()],
        [getPhoneOptions(), getGroupedPhoneOptions()],
      ]) {
        const leaves = grouped.flatMap((group) => group.children)
        const sort = (options) => options.toSorted((a, b) => a.value.localeCompare(b.value))
        assert.deepEqual(sort(leaves), sort(flat))
        assert.equal(new Set(leaves.map((option) => option.value)).size, flat.length)
        assert.ok(grouped.every((group) => group.children.length > 0))
        assert.ok(!grouped.some((group) => group.value === 'common'))
        assert.equal(grouped[0].label, locale === 'en' ? 'Asia' : '亚洲')
        for (const group of grouped) {
          const values = new Set(group.children.map((option) => option.value))
          assert.deepEqual(
            group.children,
            flat.filter((option) => values.has(option.value)),
          )
        }
      }
      const groups = getGroupedCountryOptions()
      const continent = (region) =>
        groups.find((group) => group.children.some((o) => o.value === region))?.value
      for (const [region, code] of Object.entries({
        CN: '142',
        RU: '150',
        TR: '142',
        US: '003',
        MX: '003',
        JM: '003',
        BR: '005',
        ZA: '002',
        AU: '009',
        AQ: '010',
      })) {
        assert.equal(continent(region), code, region)
      }
      assert.equal(groups.find((g) => g.value === '010').children[0].value, 'AQ')
      assert.equal(
        groups.find((g) => g.value === '010').label,
        locale === 'en' ? 'Antarctica' : '南极洲',
      )
      const custom = [{ value: 'ZZ', extra: 42 }]
      assert.deepEqual(groupByContinent(custom), [
        { value: 'other', label: locale === 'en' ? 'Other regions' : '其他地区', children: custom },
      ])
      assert.deepEqual(groupByContinent([]), [])
      const first = getGroupedCountryOptions()
      first[0].children[0].label = 'changed'
      assert.notEqual(getGroupedCountryOptions()[0].children[0].label, 'changed')
    }
  } finally {
    setLocale('zh-CN')
  }
})
