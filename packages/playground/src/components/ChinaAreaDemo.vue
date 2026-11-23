<script setup lang="ts">
import { computed, ref } from 'vue'
import { IxCard } from '@idux/components/card'
import { IxCascader, type CascaderData } from '@idux/components/cascader'
import { getChinaAreaOptions, getChinaArea } from '@idux/geo-areas/china'
import type { AreaOption, Locale } from '@idux/geo-areas/types'

const { locale } = defineProps<{ locale: Locale }>()

function cascaderData(options: AreaOption[]): CascaderData[] {
  return options.map(({ value, label, children }) => ({
    key: value,
    label,
    children: children && cascaderData(children),
  }))
}
const areaOptions = computed(() => cascaderData(getChinaAreaOptions(locale)))
const areaPath = ref<string[]>([])
const area = computed(() => {
  const code = areaPath.value.at(-1)
  return code ? getChinaArea(code) : undefined
})
</script>

<template>
  <IxCard header="中国行政区">
    <IxCascader
      v-model:value="areaPath"
      full-path
      :data-source="areaOptions"
      searchable
      clearable
      placeholder="选择省 / 市 / 区县"
      aria-label="中国行政区"
    />
    <p v-if="area" class="detail" aria-live="polite">
      {{ area.name[locale] }} · adcode {{ area.adcode }} ·
      {{ area.center?.join(', ') ?? '暂无中心坐标' }}
    </p>
    <p class="detail" v-else>选择区县以查看 adcode 和中心坐标</p>
  </IxCard>
</template>
