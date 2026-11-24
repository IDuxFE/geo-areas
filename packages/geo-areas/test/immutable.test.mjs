import assert from 'node:assert/strict'
import { test } from 'node:test'
import { countries, getCountry, getCountryOptions } from '../dist/countries.js'
import { chinaAreas, chinaAreaTree, getChinaArea } from '../dist/china.js'
import { phoneRegions, getPhoneRegion, getRegionsByCallingCode } from '../dist/phone.js'
import { subdivisions, getSubdivisions } from '../dist/subdivisions.js'

test('reference snapshots are frozen through nested records, coordinates and children', () => {
  for (const snapshot of [countries, chinaAreas, chinaAreaTree, phoneRegions, subdivisions]) {
    const walk = (value) => {
      if (value === null || typeof value !== 'object') return
      assert.ok(Object.isFrozen(value))
      for (const child of Object.values(value)) walk(child)
    }
    walk(snapshot)
  }
  assert.throws(() => {
    countries[0].name.en = 'Changed'
  }, TypeError)
  assert.throws(() => {
    chinaAreaTree.children.pop()
  }, TypeError)
})

test('editing query results cannot poison subsequent lookups or option generation', () => {
  const country = getCountry('CN')
  country.name.en = 'Changed'
  country.code = 'XX'
  assert.equal(getCountry('CN').name.en, 'China')
  assert.ok(getCountryOptions().some(({ value }) => value === 'CN'))
  const area = getChinaArea('110000')
  area.adcode = '999999'
  area.children[0].name.en = 'Changed'
  area.center[0] = 0
  assert.equal(getChinaArea('110000').adcode, '110000')
  assert.notEqual(getChinaArea('110000').children[0].name.en, 'Changed')
  assert.notEqual(getChinaArea('110000').center[0], 0)
  assert.equal(getChinaArea('999999'), undefined)
  getPhoneRegion('CN').name.en = 'Changed'
  getRegionsByCallingCode('86')[0].callingCode = '+0'
  assert.equal(getPhoneRegion('CN').callingCode, '+86')
  assert.notEqual(getPhoneRegion('CN').name.en, 'Changed')
  const regions = getSubdivisions('US')
  regions[0].countryCode = 'XX'
  regions[0].name.en = 'Changed'
  assert.equal(getSubdivisions('US')[0].countryCode, 'US')
  assert.notEqual(getSubdivisions('US')[0].name.en, 'Changed')
  assert.equal(getCountry('invalid'), undefined)
  assert.equal(getPhoneRegion('invalid'), undefined)
})
