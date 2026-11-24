<script setup lang="ts">
import { IxDesc, IxDescItem } from '@idux/components/desc'
import { t } from '@/shared/i18n'
import { locale, useLocalizedData } from '@/shared/locale'
import { computed, ref } from 'vue'
import { IxInput } from '@idux/components/input'
import { IxSelect } from '@idux/components/select'
import { getPhoneRegion } from '@idux/geo-areas/phone'
import { getCommonGroupedPhoneOptions } from '@/shared/region-options'

const phoneOptions = useLocalizedData(getCommonGroupedPhoneOptions)
const phone = ref('')
const phoneRegion = ref('CN')
const selectedPhoneRegion = computed(() => getPhoneRegion(phoneRegion.value))
const callingCode = computed(() => selectedPhoneRegion.value?.callingCode)
</script>

<template>
  <div class="geo-demo">
    <p class="demo-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>getPhoneOptions()</code>
      <code>getGroupedPhoneOptions()</code>
      <code>getPhoneRegion(countryCode)</code>
    </p>
    <IxInput v-model:value="phone" :placeholder="t('输入本地号码')" :aria-label="t('本地号码')">
      <template #addonBefore>
        <IxSelect
          v-model:value="phoneRegion"
          class="dial"
          style="width: 90px"
          :data-source="phoneOptions"
          get-key="value"
          searchable="overlay"
          :overlay-match-width="false"
          :aria-label="t('电话地区')"
        >
          <template #selectedLabel>{{ callingCode }}</template>
        </IxSelect>
      </template>
    </IxInput>
    <IxDesc
      :label-width="locale === 'en' ? 200 : 120"
      label-align="start"
      v-if="selectedPhoneRegion"
      class="demo-desc"
      :col="1"
      size="sm"
      aria-live="polite"
    >
      <IxDescItem :label="t('电话地区')">{{ selectedPhoneRegion.name[locale] }}</IxDescItem>
      <IxDescItem :label="t('国家代码')">{{ phoneRegion }}</IxDescItem>
      <IxDescItem :label="t('国际呼叫码')">{{ callingCode }}</IxDescItem>
      <IxDescItem v-if="phone" :label="t('本地号码')">{{ phone }}</IxDescItem>
    </IxDesc>
  </div>
</template>

<archive-meta lang="json">
{
  "title": "选择国际区号并输入号码",
  "description": "选择电话地区后显示对应区号，再输入本地号码；列表按洲分组，常用地区放在最前面。",
  "index": 0
}
</archive-meta>
