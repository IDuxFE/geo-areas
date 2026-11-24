<script setup lang="ts">
import { IxDesc, IxDescItem } from '@idux/components/desc'
import { computed, ref } from 'vue'
import { IxInput } from '@idux/components/input'
import { IxButton } from '@idux/components/button'
import { getCountry } from '@idux/geo-areas/countries'
import { locale } from '@/shared/locale'
import { t } from '@/shared/i18n'
const code = ref('CHN')
const country = computed(() => getCountry(code.value.trim()))
const samples = ['cn', 'CHN', '156', '4', 'ZZ']
</script>

<template>
  <div class="geo-demo">
    <p class="demo-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>getCountry(code)</code>
    </p>
    <IxInput
      v-model:value="code"
      suffix="search"
      :placeholder="t('输入二位码、三位码或数字码，如 CN / CHN / 156')"
      :aria-label="t('国家代码')"
    />
    <div class="demo-actions" :aria-label="t('试用代码')">
      <IxButton v-for="sample in samples" :key="sample" @click="code = sample">{{
        sample
      }}</IxButton>
    </div>
    <IxDesc
      :label-width="locale === 'en' ? 200 : 120"
      label-align="start"
      v-if="country"
      class="demo-desc"
      :col="1"
      size="sm"
      aria-live="polite"
    >
      <IxDescItem :label="t('国家或地区')">{{ country.name[locale] }}</IxDescItem>
      <IxDescItem label="alpha-2">{{ country.code }}</IxDescItem>
      <IxDescItem label="alpha-3">{{ country.alpha3 }}</IxDescItem>
      <IxDescItem :label="t('数字代码')">{{ country.numeric }}</IxDescItem>
    </IxDesc>
    <p v-else class="detail" aria-live="polite">{{ t('未找到国家或地区') }}</p>
  </div>
</template>

<archive-meta lang="json">
{
  "title": "国家代码查询",
  "description": "输入 CN、CHN 或 156 都能查到中国；输入不存在的代码会显示“未找到”。",
  "index": 2
}
</archive-meta>
