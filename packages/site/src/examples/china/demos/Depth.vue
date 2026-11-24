<script setup lang="ts">
import { IxDesc, IxDescItem } from '@idux/components/desc'
import { computed, ref, watch } from 'vue'
import { IxSelect } from '@idux/components/select'
import { IxCascader, type CascaderData } from '@idux/components/cascader'
import { IxCheckbox } from '@idux/components/checkbox'
import { chinaAreaTree, getChinaArea, getChinaAreaOptions } from '@idux/geo-areas/china'
import type { AreaOption } from '@idux/geo-areas/types'
import { locale, useLocalizedData } from '@/shared/locale'
import { t } from '@/shared/i18n'
const depth = ref<1 | 2 | 3>(2)
const includeCountry = ref(false)
const path = ref<string[]>([])
const depths = computed(() => [
  { key: 1, label: t('仅省级') },
  { key: 2, label: t('省 / 市') },
  { key: 3, label: t('省 / 市 / 区县') },
])
function convert(options: AreaOption[]): CascaderData[] {
  return options.map(({ value, label, children }) => ({
    key: value,
    label,
    children: children && convert(children),
  }))
}
const options = useLocalizedData(() => {
  const children = convert(getChinaAreaOptions(depth.value))
  return includeCountry.value
    ? [{ key: chinaAreaTree.adcode, label: chinaAreaTree.name[locale.value], children }]
    : children
})
watch([depth, includeCountry], () => {
  path.value = []
})
const selected = computed(() => getChinaArea(path.value.at(-1) ?? ''))
</script>

<template>
  <div class="geo-demo">
    <p class="demo-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>getChinaAreaOptions(depth)</code>
      <code>chinaAreaTree</code>
      <code>getChinaArea(adcode)</code>
    </p>
    <div class="demo-actions">
      <IxSelect v-model:value="depth" :data-source="depths" :aria-label="t('选择层级')" />
      <IxCheckbox v-model:checked="includeCountry">{{ t('从“中国”开始选择') }}</IxCheckbox>
    </div>
    <IxCascader
      v-model:value="path"
      :data-source="options"
      full-path
      strategy="off"
      expand-trigger="hover"
      searchable
      clearable
      :aria-label="t('中国行政区')"
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
      <IxDescItem :label="t('中国行政区')">{{ selected.name[locale] }}</IxDescItem>
      <IxDescItem label="adcode">{{ selected.adcode }}</IxDescItem>
      <IxDescItem :label="t('行政区层级')">{{ selected.level }}</IxDescItem>
      <IxDescItem label="parentCode">{{ selected.parentCode ?? 'null' }}</IxDescItem>
    </IxDesc>
    <p v-else class="detail" aria-live="polite">{{ t('选择行政区以查看节点信息') }}</p>
  </div>
</template>

<archive-meta lang="json">
{
  "title": "选择到省、市或区县",
  "description": "切换选择范围：只选省、选到市或选到区县；也可以让列表从“中国”开始。",
  "index": 1
}
</archive-meta>
