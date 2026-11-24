<script setup lang="ts">
import { IxDesc, IxDescItem } from '@idux/components/desc'
import { computed, ref } from 'vue'
import { IxInput } from '@idux/components/input'
import { IxButton } from '@idux/components/button'
import { getRegionsByCallingCode } from '@idux/geo-areas/phone'
import { locale } from '@/shared/locale'
import { t } from '@/shared/i18n'
const callingCode = ref('1')
const regions = computed(() => getRegionsByCallingCode(callingCode.value.trim()))
const samples = ['1', '86', '999']
</script>

<template>
  <div class="geo-demo">
    <p class="demo-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>getRegionsByCallingCode(callingCode)</code>
    </p>
    <IxInput
      v-model:value="callingCode"
      inputmode="numeric"
      suffix="search"
      :placeholder="t('输入国际区号，如 1 或 86')"
      :aria-label="t('国际呼叫码')"
    >
      <template #addonBefore>+</template>
    </IxInput>
    <div class="demo-actions">
      <IxButton v-for="sample in samples" :key="sample" @click="callingCode = sample">{{
        `+${sample}`
      }}</IxButton>
    </div>
    <IxDesc
      :label-width="locale === 'en' ? 200 : 120"
      label-align="start"
      class="demo-desc"
      :col="1"
      size="sm"
      aria-live="polite"
    >
      <IxDescItem :label="t('匹配地区')">{{ regions.length }}</IxDescItem>
    </IxDesc>
    <IxDesc
      :label-width="locale === 'en' ? 200 : 120"
      label-align="start"
      v-if="regions.length"
      class="demo-desc demo-results"
      :col="1"
      size="sm"
    >
      <IxDescItem v-for="region in regions" :key="region.countryCode" :label="region.name[locale]"
        >{{ region.countryCode }} · {{ region.callingCode }}</IxDescItem
      >
    </IxDesc>
    <p v-else class="detail">{{ t('未找到匹配地区') }}</p>
  </div>
</template>

<archive-meta lang="json">
{
  "title": "输入区号查地区",
  "description": "输入 +1 查看共用这个区号的所有地区，输入 +86 查看中国；找不到时显示空结果。",
  "index": 1
}
</archive-meta>
