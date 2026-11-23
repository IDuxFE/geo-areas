<script setup lang="ts">
import { computed, ref } from 'vue'
import { IxCard } from '@idux/components/card'
import { IxInput } from '@idux/components/input'
import { IxSelect } from '@idux/components/select'
import { getPhoneRegion } from '@idux/geo-areas/phone'
import type { Locale } from '@idux/geo-areas/types'
import { getGroupedPhoneOptions } from '../region-options'

const { locale } = defineProps<{ locale: Locale }>()

const phoneOptions = computed(() => getGroupedPhoneOptions(locale))
const phone = ref('')
const phoneRegion = ref('CN')
const selectedPhoneRegion = computed(() => getPhoneRegion(phoneRegion.value))
const callingCode = computed(() => selectedPhoneRegion.value?.callingCode)
</script>

<template>
  <IxCard header="国际电话">
    <IxInput v-model:value="phone" placeholder="输入本地号码" aria-label="本地号码">
      <template #addonBefore>
        <IxSelect
          v-model:value="phoneRegion"
          class="dial"
          style="width: 90px"
          :data-source="phoneOptions"
          get-key="value"
          searchable="overlay"
          :overlay-match-width="false"
          aria-label="电话地区"
        >
          <template #selectedLabel>{{ callingCode }}</template>
        </IxSelect>
      </template>
    </IxInput>
    <p v-if="selectedPhoneRegion" class="detail" aria-live="polite">
      {{ selectedPhoneRegion.name[locale] }}（{{ phoneRegion }}） · {{ callingCode
      }}<template v-if="phone"> {{ phone }}</template>
    </p>
  </IxCard>
</template>
