<script setup lang="ts">
import { IxDesc, IxDescItem } from '@idux/components/desc'
import { t } from '@/shared/i18n'
import { computed, ref } from 'vue'
import { IxSelect } from '@idux/components/select'
import { getCountry, getCountryOptions } from '@idux/geo-areas/countries'
import { locale, useLocalizedData } from '@/shared/locale'

const country = ref('CN')
const options = useLocalizedData(getCountryOptions)
const selected = computed(() => getCountry(country.value))
</script>

<template>
  <div class="geo-demo">
    <p class="demo-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>getCountryOptions()</code>
      <code>getCountry(code)</code>
    </p>
    <IxSelect
      v-model:value="country"
      :data-source="options"
      get-key="value"
      searchable
      :aria-label="t('国家或地区')"
    />
    <IxDesc
      :label-width="locale === 'en' ? 200 : 120"
      label-align="start"
      v-if="selected"
      class="demo-desc"
      :col="1"
      size="sm"
      aria-live="polite"
    >
      <IxDescItem :label="t('国家或地区')">{{ selected.name[locale] }}</IxDescItem>
      <IxDescItem :label="t('国家代码')">{{ selected.code }}</IxDescItem>
    </IxDesc>
  </div>
</template>

<archive-meta lang="json">
{
  "title": "国家地区选择",
  "description": "选择一个国家，查看它的名称和代码；下拉列表不按洲分组。",
  "index": 0
}
</archive-meta>
