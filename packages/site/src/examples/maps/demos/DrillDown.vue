<script setup lang="ts">
import { t, mapLabel } from '@/shared/i18n'
import { mapPalette } from '@/theme'
import { locale } from '@/shared/locale'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { IxButton } from '@idux/components/button'
import { IxCascader, type CascaderData } from '@idux/components/cascader'
import { init, registerMap, use, type ComposeOption, type EChartsType } from 'echarts/core'
import { ScatterChart, type ScatterSeriesOption } from 'echarts/charts'
import {
  GeoComponent,
  TooltipComponent,
  type GeoComponentOption,
  type TooltipComponentOption,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { loadGeoJSON, type MapId } from '@idux/geo-areas/geojson'
import { getChinaArea } from '@idux/geo-areas/china'
import type { Coordinate, Locale, MapGeoJSON } from '@idux/geo-areas/types'
import mapIndex from '@/.cache/map-index.json'

use([GeoComponent, TooltipComponent, ScatterChart, CanvasRenderer])

type MapStep = {
  id: string
  sourceMapId: MapId
  featureCode?: string
  names: Record<Locale, string>
}
const world: MapStep = {
  id: 'world',
  sourceMapId: 'world',
  names: { 'zh-CN': '世界', en: 'World' },
}
type DrillTarget = MapStep & { code: string }
const targetsByMap = mapIndex as Partial<Record<string, DrillTarget[]>>
const trail = ref<MapStep[]>([world])
const active = computed(() => trail.value[trail.value.length - 1])
const map = shallowRef<MapGeoJSON>()
const mapKey = ref('')
const loading = ref(false)
const error = ref(false)
const retry = ref(0)

watch(
  [active, () => locale.value, retry],
  async ([step, language], _, onCleanup) => {
    let stale = false
    onCleanup(() => {
      stale = true
    })
    loading.value = true
    error.value = false
    map.value = undefined
    try {
      const source = await loadGeoJSON(step.sourceMapId)
      const data = step.featureCode
        ? {
            ...source,
            features: source.features.filter(
              ({ properties }) => properties.code === step.featureCode,
            ),
          }
        : source
      if (!data.features.length) throw new Error(`Missing boundary: ${step.id}`)
      if (stale) return
      // ECharts adds its built-in South China Sea inset only for the exact map name 'china'.
      const key = step.id === 'CN-provinces' ? 'china' : `geo-areas-${step.id}-${language}`
      registerMap(key, data)
      mapKey.value = key
      map.value = data
    } catch {
      if (!stale) error.value = true
    } finally {
      if (!stale) loading.value = false
    }
  },
  { immediate: true },
)

function optionsForPath(path: MapStep[]): CascaderData[] {
  const step = path[path.length - 1]
  const targets = targetsByMap[step.id]
  const children = targets
    ?.filter((target) => !path.some((ancestor) => ancestor.id === target.id))
    .flatMap((target) => optionsForPath([...path, target]))
  return [
    {
      key: path.map(({ id }) => id).join('/'),
      label: step.names[locale.value],
      children,
      isLeaf: !children?.length,
      searchText: path.flatMap(({ names }) => [names['zh-CN'], names.en]).join(' ') + ` ${step.id}`,
    },
  ]
}

const mapOptions = computed(() => optionsForPath([world]))
const selectedMap = computed(() =>
  trail.value.map((_, index) =>
    trail.value
      .slice(0, index + 1)
      .map(({ id }) => id)
      .join('/'),
  ),
)
const drillTargets = computed(() =>
  (targetsByMap[active.value.id] ?? []).filter(
    (target) => !trail.value.some((ancestor) => ancestor.id === target.id),
  ),
)

function searchMap(option: CascaderData, query: string) {
  const text = typeof option.searchText === 'string' ? option.searchText.toLowerCase() : ''
  const compactText = text.replace(/\s+/g, '')
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((word) => compactText.includes(word))
}

function selectMap(key: string | undefined) {
  if (!key) {
    trail.value = [world]
    return
  }
  const path: MapStep[] = [world]
  for (const id of key.split('/').slice(1)) {
    const target = targetsByMap[path[path.length - 1].id]?.find((item) => item.id === id)
    if (!target) return
    path.push(target)
  }
  if (key !== selectedMap.value.at(-1)) trail.value = path
}

function drill(code: string) {
  const target = drillTargets.value.find((item) => item.code === code)
  if (target) selectMap(`${selectedMap.value.at(-1)}/${target.id}`)
}

function goBack() {
  if (trail.value.length > 1) trail.value = trail.value.slice(0, -1)
}

const riskColors = ['#e85b5b', '#ef8d4b', '#e8b949', '#6bbd80', '#5899da']
function riskColor(value: number) {
  return riskColors[value >= 700 ? 0 : value >= 500 ? 1 : value >= 300 ? 2 : value >= 200 ? 3 : 4]
}

type StatusItem = { id: string; name: string; coordinate: Coordinate; value: number; color: string }
const worldCoordinates: Record<string, Coordinate> = {
  US: [-100, 39],
  AU: [134, -25],
  PE: [-75, -10],
  KZ: [68, 48],
  CN: [104, 35],
}

function featureCoordinate(feature: MapGeoJSON['features'][number]): Coordinate {
  const { code, adcode, center, centroid } = feature.properties
  // Province outlines may omit coordinates; look up the administrative center by code.
  const area = getChinaArea(adcode ?? code)
  const coordinate = area?.center ?? center ?? area?.centroid ?? centroid
  if (coordinate) return coordinate
  // Outline-only maps may lack a label point; use the largest ring's bounding-box center.
  const rings =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates[0]]
      : feature.geometry.coordinates.map((polygon) => polygon[0])
  const ring = rings.reduce((largest, next) => (next.length > largest.length ? next : largest))
  const longitudes = ring.map(([longitude]) => longitude)
  const latitudes = ring.map(([, latitude]) => latitude)
  return [
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  ]
}

// Generate demo values once per loaded map, keeping colors, pins and legend in sync.
const statusData = computed<StatusItem[]>(() => {
  const features = map.value?.features.filter(({ properties }) => properties.level) ?? []
  const selected =
    active.value.id === 'world'
      ? Object.keys(worldCoordinates).flatMap(
          (code) => features.find((feature) => feature.properties.code === code) ?? [],
        )
      : features.slice(0, 5)
  return selected.map((feature) => {
    const { code, name } = feature.properties
    const value = Math.floor(Math.random() * 900) + 1
    return {
      id: code,
      name,
      coordinate: active.value.id === 'world' ? worldCoordinates[code] : featureCoordinate(feature),
      value,
      color: riskColor(value),
    }
  })
})

type MapOption = ComposeOption<GeoComponentOption | TooltipComponentOption | ScatterSeriesOption>
const chartElement = ref<HTMLDivElement>()
let chart: EChartsType | undefined
let resizeObserver: ResizeObserver | undefined
const chartOption = computed<MapOption | undefined>(() => {
  if (!map.value) return undefined
  const names = new Map(
    map.value.features.map(({ properties }) => [properties.code, properties.name]),
  )
  const values = new Map(statusData.value.map((item) => [item.id, item]))
  return {
    tooltip: {
      textStyle: { color: mapPalette.value.text },
      backgroundColor: mapPalette.value.area,
      borderColor: mapPalette.value.border,
      trigger: 'item',
      renderMode: 'richText',
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params
        const code = item.componentType === 'geo' ? item.name : (item.data as { id?: string })?.id
        const status = code ? values.get(code) : undefined
        const name = (code && names.get(code)) || item.name
        return `${name}\n${t('攻击次数')}: ${status?.value ?? '-'}`
      },
    },
    geo: {
      map: mapKey.value,
      nameProperty: 'code',
      roam: true,
      scaleLimit: { min: 1, max: 8 },
      preserveAspect: 'contain',
      left: '3%',
      right: '3%',
      top: '3%',
      bottom: '3%',
      selectedMode: false,
      itemStyle: {
        areaColor: mapPalette.value.area,
        borderColor: mapPalette.value.border,
        borderWidth: 0.8,
      },
      label: { show: false, formatter: (params) => names.get(params.name) ?? params.name },
      emphasis: {
        label: { show: true, color: mapPalette.value.text },
        itemStyle: { areaColor: mapPalette.value.emphasis },
      },
      regions: statusData.value.map((item) => ({
        name: item.id,
        itemStyle: { areaColor: item.color, opacity: 0.55 },
        emphasis: { itemStyle: { areaColor: item.color, opacity: 0.8 } },
      })),
    },
    series: [
      {
        id: 'locations',
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'pin',
        symbolSize: 36,
        label: { show: false },
        data: statusData.value.map((item) => ({
          id: item.id,
          name: item.name,
          value: [...item.coordinate, item.value],
          itemStyle: { color: item.color, opacity: 1 },
        })),
      },
    ],
  }
})

function renderChart() {
  if (!chart) return
  if (chartOption.value) chart.setOption(chartOption.value, { notMerge: true })
  else chart.clear()
}

onMounted(() => {
  chart = init(chartElement.value!)
  chart.on('click', (params) => {
    const code =
      params.componentType === 'geo'
        ? params.name
        : params.seriesId === 'locations'
          ? (params.data as { id?: string })?.id
          : undefined
    if (code) drill(code)
  })
  resizeObserver = new ResizeObserver(() => chart?.resize())
  resizeObserver.observe(chartElement.value!)
  renderChart()
})
watch(chartOption, renderChart, { flush: 'post' })
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
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
    <div class="map-navigation">
      <IxButton :disabled="trail.length <= 1" @click="goBack">{{ t('返回上一级') }}</IxButton>
      <IxCascader
        class="map-picker"
        :value="selectedMap"
        :data-source="mapOptions"
        :search-fn="searchMap"
        strategy="off"
        expand-trigger="hover"
        full-path
        searchable
        clearable
        :placeholder="t('选择地图区域')"
        :aria-label="t('地图区域')"
        @update:value="(keys: string[]) => selectMap(keys.at(-1))"
      />
    </div>
    <p v-if="map" class="detail">
      {{
        drillTargets.length
          ? t('可通过上方选择器或点击地图下钻；无下级边界的地区显示本级轮廓')
          : t('当前地图没有可下钻的区域')
      }}
    </p>
    <div class="map-status-demo">
      <div class="map-status-chart">
        <div
          ref="chartElement"
          class="map-canvas"
          role="img"
          :aria-label="mapLabel(active.names[locale])"
        />
        <div v-if="!map" class="map-status" role="status">
          <IxButton v-if="error" @click="retry++">{{ t('地图加载失败，重试') }}</IxButton>
          <span v-else-if="loading">{{ t('正在加载地图…') }}</span>
        </div>
      </div>
      <ul v-if="map && statusData.length" class="map-legend" :aria-label="t('示例攻击次数')">
        <li v-for="item in statusData" :key="item.id">
          <span class="map-legend-dot" :style="{ background: item.color }" />
          <span>{{ item.name }}</span>
          <strong>{{ item.value }}</strong>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.map-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-navigation > :first-child {
  flex-shrink: 0;
}
.map-picker {
  flex: 1;
  min-width: 0;
}
.map-status-demo {
  margin-top: 16px;
  background: var(--map-demo-background, #f6f8fa);
  padding: 20px;
}
.map-status-chart {
  position: relative;
  width: 100%;
  height: 520px;
}
.map-canvas {
  width: 100%;
  height: 100%;
}
.map-status {
  position: absolute;
  inset: 0;
  height: 100%;
  display: grid;
  place-items: center;
}
.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding: 0;
  margin: 16px 0 0;
  list-style: none;
  font-size: 13px;
  color: var(--geo-demo-text);
}
.map-legend li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
</style>

<archive-meta lang="json">
{
  "title": "点击地图查看下一级",
  "description": "点击有下级地图的地区继续查看，用“返回上一级”返回；颜色、标记和次数都是演示数据。",
  "index": 1
}
</archive-meta>
