<script setup lang="ts">
import { ref } from 'vue'
import { IxButton } from '@idux/components/button'
import type { Locale } from '@idux/geo-areas/types'
import InternationalTelephoneDemo from './components/InternationalTelephoneDemo.vue'
import ChinaAreaDemo from './components/ChinaAreaDemo.vue'
import CountrySubdivisionDemo from './components/CountrySubdivisionDemo.vue'
import MapDemo from './components/MapDemo.vue'

const locale = ref<Locale>('zh-CN')
</script>

<template>
  <main>
    <header>
      <div>
        <p class="package">@idux/geo-areas</p>
        <h1>Geo Areas Playground</h1>
      </div>
      <div class="languages" aria-label="数据语言">
        <IxButton :mode="locale === 'zh-CN' ? 'primary' : 'default'" @click="locale = 'zh-CN'"
          >中文</IxButton
        >
        <IxButton :mode="locale === 'en' ? 'primary' : 'default'" @click="locale = 'en'"
          >English</IxButton
        >
      </div>
    </header>

    <div class="examples">
      <InternationalTelephoneDemo :locale="locale" />
      <ChinaAreaDemo :locale="locale" />
      <CountrySubdivisionDemo :locale="locale" />
    </div>
    <MapDemo :locale="locale" />
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: #f0f4f9;
  color: #162841;
  font:
    16px/1.5 Inter,
    system-ui,
    sans-serif;
}
main {
  max-width: 1440px;
  margin: auto;
  padding: clamp(16px, 4vw, 54px);
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
header {
  margin-bottom: 26px;
}
h1 {
  margin: 4px 0 0;
  font-size: clamp(26px, 4vw, 44px);
  line-height: 1.15;
}
.package {
  color: #315688;
  font:
    14px ui-monospace,
    monospace;
  margin: 0;
}
.examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 14px;
  margin-bottom: 16px;
}
.languages {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.detail {
  font-size: 14px;
  color: #49607b;
  margin: 8px 0 0;
}
</style>
