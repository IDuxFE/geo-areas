<script setup lang="ts">
import { IxDesc, IxDescItem } from '@idux/components/desc'
import { computed, ref } from 'vue'
import { IxSelect } from '@idux/components/select'
import { IxSpace } from '@idux/components/space'
import { getCountryOptions } from '@idux/geo-areas/countries'
import { locale } from '@/shared/locale'
import { t } from '@/shared/i18n'

const country = ref('CN')
// Reading the reactive locale makes Vue regenerate options on each language change.
// The site's shared locale watcher synchronizes setLocale before this computed runs.
const options = computed(() => {
  void locale.value
  return getCountryOptions().filter(({ value }) => ['CN', 'DE', 'US'].includes(value))
})
const selected = computed(() => options.value.find(({ value }) => value === country.value))
</script>

<template>
  <IxSpace class="geo-demo" vertical block align="stretch" :size="16">
    <p class="demo-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>setLocale(locale)</code>
      <code>getCountryOptions()</code>
    </p>
    <p class="detail">
      {{ t('切换语言后，下拉选项和已选国家的名称会自动切换，国家代码保持不变。') }}
    </p>
    <IxSelect
      v-model:value="country"
      :data-source="options"
      get-key="value"
      :placeholder="t('国家或地区')"
      :aria-label="t('国家或地区')"
    />
    <IxDesc
      :label-width="locale === 'en' ? 200 : 120"
      label-align="start"
      v-if="selected"
      :col="1"
      size="sm"
      aria-live="polite"
    >
      <IxDescItem :label="t('国家或地区')">{{ selected.label }}</IxDescItem>
      <IxDescItem :label="t('国家代码')">{{ selected.value }}</IxDescItem>
    </IxDesc>
    <IxDesc :label-width="locale === 'en' ? 200 : 120" label-align="start" :col="1" size="sm">
      <IxDescItem v-for="item in options" :key="item.value" :label="item.value">{{
        item.label
      }}</IxDescItem>
    </IxDesc>
  </IxSpace>
</template>

<style scoped>
.demo-apis,
.detail {
  margin: 0;
}
</style>

<archive-meta lang="json">
{
  "title": "中英文自动切换",
  "description": "切换页面的中英文，国家名称会自动跟着变，选中的国家不会变，也不用点刷新。",
  "index": 3
}
</archive-meta>
