<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IxCard } from '@idux/components/card'
import { IxSelect } from '@idux/components/select'
import { getCountry } from '@idux/geo-areas/countries'
import { getSubdivisions } from '@idux/geo-areas/subdivisions'
import type { Locale } from '@idux/geo-areas/types'
import { getGroupedCountryOptions } from '../region-options'

const { locale } = defineProps<{ locale: Locale }>()

const countryOptions = computed(() => getGroupedCountryOptions(locale))
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
  <IxCard header="国家与一级行政区">
    <div class="pickers">
      <IxSelect
        v-model:value="country"
        :data-source="countryOptions"
        get-key="value"
        searchable
        aria-label="国家或地区"
      />
      <IxSelect
        v-model:value="subdivision"
        :data-source="subdivisions.map((item) => ({ key: item.code, label: item.name[locale] }))"
        searchable
        clearable
        :disabled="!subdivisions.length"
        placeholder="选择一级行政区"
        aria-label="一级行政区"
      />
    </div>
    <p v-if="selectedCountry" class="detail" aria-live="polite">
      {{ selectedCountry.name[locale] }}（{{ country }}）
      <template v-if="selectedSubdivision">
        · {{ selectedSubdivision.name[locale] }}（{{ selectedSubdivision.code }}）
      </template>
      <template v-else> · {{ subdivisions.length }} 个一级行政区</template>
    </p>
  </IxCard>
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
