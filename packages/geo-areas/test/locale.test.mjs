import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getLocale, setLocale } from '@idux/geo-areas/locale'
import { getLocale as getRootLocale, setLocale as setRootLocale } from '@idux/geo-areas'
import { getCountryOptions } from '@idux/geo-areas/countries'
import { getPhoneOptions } from '@idux/geo-areas/phone'
import { getChinaArea, getChinaAreaOptions } from '@idux/geo-areas/china'
import { loadGeoJSON, localizeGeoJSON } from '@idux/geo-areas/geojson'

test('all localized APIs share the centrally configured language across entries', async () => {
  assert.equal(getLocale(), 'zh-CN')
  const original = getLocale()
  try {
    const chineseOptions = getCountryOptions()
    const chinesePhoneOptions = getPhoneOptions()
    const chineseAreas = getChinaAreaOptions()
    const chineseMap = await loadGeoJSON('world')

    setRootLocale('en')
    assert.equal(getLocale(), 'en')
    assert.equal(getCountryOptions().find((item) => item.value === 'CN').label, 'China')
    assert.equal(getPhoneOptions().find((item) => item.value === 'CN').label, 'China (+86)')
    function checkAreaNames(options) {
      for (const option of options) {
        assert.equal(option.label, getChinaArea(option.value).name.en)
        if (option.children) checkAreaNames(option.children)
      }
    }
    checkAreaNames(getChinaAreaOptions())
    assert.ok(getChinaAreaOptions(1).every((item) => !item.children))
    assert.ok(
      getChinaAreaOptions(2).every((item) => item.children?.every((child) => !child.children)),
    )
    const englishCopy = localizeGeoJSON(chineseMap)
    for (const feature of englishCopy.features) {
      assert.equal(feature.properties.name, feature.properties.names.en)
    }
    assert.equal(
      chineseMap.features.find((item) => item.properties.code === 'CN').properties.name,
      '中国',
    )

    // Requests retain the language active at invocation, even when imports finish later.
    const pendingEnglish = loadGeoJSON('world')
    setLocale('zh-CN')
    assert.equal(getRootLocale(), 'zh-CN')
    const [englishMap, chineseResult] = await Promise.all([pendingEnglish, loadGeoJSON('world')])
    assert.deepEqual(englishMap, englishCopy)
    assert.deepEqual(chineseResult, chineseMap)
    assert.deepEqual(getCountryOptions(), chineseOptions)
    assert.deepEqual(getPhoneOptions(), chinesePhoneOptions)
    assert.deepEqual(getChinaAreaOptions(), chineseAreas)
    assert.deepEqual(localizeGeoJSON(englishMap), chineseMap)
    assert.equal(chineseOptions.find((option) => option.value === 'CN').label, '中国')
  } finally {
    setLocale(original)
  }
})
