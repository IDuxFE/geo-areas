<script setup lang="ts">
import { IxDesc, IxDescItem } from '@idux/components/desc'
import { t, subdivisionCount } from '@/shared/i18n'
import { locale, useLocalizedData } from '@/shared/locale'
import { computed, ref, watch } from 'vue'
import { IxSelect } from '@idux/components/select'
import { getCountry } from '@idux/geo-areas/countries'
import { getSubdivisions } from '@idux/geo-areas/subdivisions'
import { getGroupedCountryOptions } from '@idux/geo-areas/countries'

const countryOptions = useLocalizedData(getGroupedCountryOptions)
const country = ref('US')
const subdivisions = computed(() => getSubdivisions(country.value))
const subdivision = ref<string>()
const selectedCountry = computed(() => getCountry(country.value))
const selectedSubdivision = computed(() =>
  subdivisions.value.find((item) => item.code === subdivision.value),
)
watch(country, () => {
  subdivision.value = undefined
})
</script>

<template>
  <div class="geo-demo">
    <p class="demo-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>getGroupedCountryOptions()</code>
      <code>getSubdivisions(countryCode)</code>
      <code>getCountry(code)</code>
    </p>
    <div class="pickers">
      <IxSelect
        v-model:value="country"
        :data-source="countryOptions"
        get-key="value"
        searchable
        :aria-label="t('国家或地区')"
      />
      <IxSelect
        v-model:value="subdivision"
        :data-source="subdivisions.map((item) => ({ key: item.code, label: item.name[locale] }))"
        searchable
        clearable
        :disabled="!subdivisions.length"
        :placeholder="t('选择一级行政区')"
        :aria-label="t('一级行政区')"
      />
    </div>
    <IxDesc
      :label-width="locale === 'en' ? 200 : 120"
      label-align="start"
      v-if="selectedCountry"
      class="demo-desc"
      :col="1"
      size="sm"
      aria-live="polite"
    >
      <IxDescItem :label="t('国家或地区')">{{ selectedCountry.name[locale] }}</IxDescItem>
      <IxDescItem :label="t('国家代码')">{{ country }}</IxDescItem>
      <IxDescItem :label="t('一级行政区')">{{
        selectedSubdivision
          ? selectedSubdivision.name[locale]
          : subdivisionCount(subdivisions.length)
      }}</IxDescItem>
      <IxDescItem v-if="selectedSubdivision" :label="t('行政区代码')">{{
        selectedSubdivision.code
      }}</IxDescItem>
    </IxDesc>
  </div>
</template>

<style scoped>
.pickers {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pickers > * {
  flex: 1 1 120px;
  min-width: 0;
}
</style>

<archive-meta lang="json">
{
  "title": "按洲选择国家，再选择省或州",
  "description": "先从按洲分组的列表里选国家，再选择该国的省或州；换国家后会清空原来的省或州。",
  "index": 1
}
</archive-meta>
