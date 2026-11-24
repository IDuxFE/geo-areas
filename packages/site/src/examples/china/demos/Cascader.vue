<script setup lang="ts">
import { IxDesc, IxDescItem } from '@idux/components/desc'
import { t } from '@/shared/i18n'
import { locale, useLocalizedData } from '@/shared/locale'
import { computed, ref } from 'vue'
import { IxCascader, type CascaderData } from '@idux/components/cascader'
import { getChinaAreaOptions, getChinaArea } from '@idux/geo-areas/china'
import type { AreaOption } from '@idux/geo-areas/types'

function cascaderData(options: AreaOption[]): CascaderData[] {
  return options.map(({ value, label, children }) => ({
    key: value,
    label,
    children: children && cascaderData(children),
  }))
}
const areaOptions = useLocalizedData(() => cascaderData(getChinaAreaOptions()))
const areaPath = ref<string[]>([])
const area = computed(() => {
  const code = areaPath.value.at(-1)
  return code ? getChinaArea(code) : undefined
})
</script>

<template>
  <div class="geo-demo">
    <p class="demo-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>getChinaAreaOptions()</code>
      <code>getChinaArea(adcode)</code>
    </p>
    <IxCascader
      v-model:value="areaPath"
      full-path
      strategy="off"
      expand-trigger="hover"
      :data-source="areaOptions"
      searchable
      clearable
      :placeholder="t('选择省 / 市 / 区县')"
      :aria-label="t('中国行政区')"
    />
    <IxDesc
      :label-width="locale === 'en' ? 200 : 120"
      label-align="start"
      v-if="area"
      class="demo-desc"
      :col="1"
      size="sm"
      aria-live="polite"
    >
      <IxDescItem :label="t('中国行政区')">{{ area.name[locale] }}</IxDescItem>
      <IxDescItem label="adcode">{{ area.adcode }}</IxDescItem>
      <IxDescItem :label="t('行政中心坐标')">{{
        area.center?.join(', ') ?? t('暂无行政中心坐标')
      }}</IxDescItem>
      <IxDescItem :label="t('几何中心坐标')">{{
        area.centroid?.join(', ') ?? t('暂无几何中心坐标')
      }}</IxDescItem>
    </IxDesc>
    <p class="detail" v-if="area">
      {{
        t(
          '坐标顺序为经度、纬度。行政中心为省会／首府、市或区县驻地等；几何中心反映区域形状。两者均沿用 DataV 数据，缺失时分别显示暂无。',
        )
      }}
    </p>
    <p class="detail" v-else>{{ t('选择区县以查看 adcode、行政中心和几何中心坐标') }}</p>
  </div>
</template>

<archive-meta lang="json">
{
  "title": "省市区级联选择",
  "description": "依次选择省、市、区县，分别查看所选地区的行政中心坐标和几何中心坐标。",
  "index": 0
}
</archive-meta>
