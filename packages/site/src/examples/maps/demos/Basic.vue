<script setup lang="ts">
import { t, mapLabel } from '@/shared/i18n'
import { mapPalette } from '@/theme'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { IxSelect } from '@idux/components/select'
import { IxButton } from '@idux/components/button'
import { init, registerMap, use, type EChartsType } from 'echarts/core'
import { GeoComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { loadGeoJSON, type MapId } from '@idux/geo-areas/geojson'
import { locale } from '@/shared/locale'

use([GeoComponent, CanvasRenderer])

const mapId = ref<MapId>('world')
const maps = computed(() => [
  { key: 'world', label: t('世界') },
  { key: 'CN-provinces', label: t('中国省级行政区') },
  { key: 'US', label: t('美国') },
])
const element = ref<HTMLDivElement>()
const loading = ref(false)
const error = ref(false)
const retry = ref(0)
let chart: EChartsType | undefined
let observer: ResizeObserver | undefined

onMounted(() => {
  chart = init(element.value!)
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(element.value!)
})
watch(
  [mapId, locale, retry, mapPalette],
  async ([id, language], _, onCleanup) => {
    let stale = false
    onCleanup(() => {
      stale = true
    })
    loading.value = true
    error.value = false
    chart?.clear()
    try {
      const data = await loadGeoJSON(id)
      if (stale) return
      const name = id === 'CN-provinces' ? 'china' : `basic-${id}-${language}`
      registerMap(name, data)
      chart?.setOption({
        geo: {
          map: name,
          roam: true,
          preserveAspect: 'contain',
          left: '3%',
          right: '3%',
          top: '3%',
          bottom: '3%',
          itemStyle: { areaColor: mapPalette.value.area, borderColor: mapPalette.value.border },
          emphasis: {
            label: { show: true, color: mapPalette.value.text },
            itemStyle: { areaColor: mapPalette.value.emphasis },
          },
        },
      })
    } catch {
      if (!stale) error.value = true
    } finally {
      if (!stale) loading.value = false
    }
  },
  { immediate: true, flush: 'post' },
)
onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
  chart = undefined
})
</script>

<template>
  <div class="geo-demo">
    <p class="demo-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>loadGeoJSON(id)</code>
      <code>ECharts.registerMap(name, data)</code>
    </p>
    <IxSelect v-model:value="mapId" :data-source="maps" :aria-label="t('基础地图区域')" />
    <div class="basic-map">
      <div
        ref="element"
        class="basic-map-canvas"
        role="img"
        :aria-label="mapLabel(maps.find((item) => item.key === mapId)?.label ?? mapId)"
      />
      <div v-if="loading || error" class="basic-map-status" role="status">
        <IxButton v-if="error" @click="retry++">{{ t('地图加载失败，重试') }}</IxButton>
        <span v-else>{{ t('正在加载地图…') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-map {
  position: relative;
  margin-top: 16px;
}
.basic-map-canvas {
  height: 420px;
  width: 100%;
}
.basic-map-status {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}
</style>

<archive-meta lang="json">
{
  "title": "选择并显示地图",
  "description": "选择世界、中国省级或美国地图后自动加载；切换中英文，地图上的名称也会更新。",
  "index": 0
}
</archive-meta>
