<script setup lang="ts">
import { IxButton } from '@idux/components/button'
import { IxDesc, IxDescItem } from '@idux/components/desc'
import { IxInput } from '@idux/components/input'
import { computed, ref } from 'vue'
import { availableMaps, hasGeoJSON, localizeGeoJSON } from '@idux/geo-areas/geojson'
import rawMap from '@idux/geo-areas/geojson/china.json' with { type: 'json' }
import manifest from '@idux/geo-areas/manifest' with { type: 'json' }
import { locale, toggleLocale, useLocalizedData } from '@/shared/locale'
import { t } from '@/shared/i18n'

const id = ref('CN-provinces')
const exists = computed(() => hasGeoJSON(id.value))
// JSON imports preserve bilingual source data; localization returns a separate deep copy.
const original = JSON.stringify(rawMap)
const localized = useLocalizedData(() => localizeGeoJSON(rawMap))
const sourcePreview = rawMap.features.slice(0, 3).map(({ properties }) => properties)
const resultPreview = computed(() =>
  localized.value.features.slice(0, 3).map(({ properties }) => properties),
)
const unchanged = computed(() => {
  void localized.value
  return JSON.stringify(rawMap) === original
})
</script>

<template>
  <div class="geo-demo inspect-demo">
    <section class="inspect-localization">
      <div class="inspect-heading">
        <div>
          <h3>{{ t('名称本地化') }}</h3>
          <p class="detail">
            {{ t('以中国省级地图的 3 个区域为例，对照原始名称与当前语言的名称。') }}
          </p>
        </div>
        <IxButton @click="toggleLocale">{{
          locale === 'en' ? t('切换为中文') : t('切换为英文')
        }}</IxButton>
      </div>
      <div class="inspect-comparison">
        <section class="inspect-card">
          <header>
            <strong>{{ t('原始数据') }}</strong>
            <code>china.json</code>
          </header>
          <div class="inspect-card-body">
            <p class="detail">{{ t('直接导入 JSON，保留原始名称。') }}</p>
            <table>
              <thead>
                <tr>
                  <th>{{ t('区域代码') }}</th>
                  <th>{{ t('名称') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="feature in sourcePreview" :key="feature.code">
                  <td><code>{{ feature.code }}</code></td>
                  <td>{{ feature.name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="inspect-card inspect-card-result" aria-live="polite">
          <header>
            <strong>{{ t('本地化结果') }}</strong>
            <span class="inspect-locale">{{ locale === 'en' ? 'English' : '简体中文' }}</span>
          </header>
          <div class="inspect-card-body">
            <p class="detail">{{ t('根据当前页面语言生成独立副本。') }}</p>
            <table>
              <thead>
                <tr>
                  <th>{{ t('区域代码') }}</th>
                  <th>{{ t('名称') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="feature in resultPreview" :key="feature.code">
                  <td><code>{{ feature.code }}</code></td>
                  <td>{{ feature.name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <p class="inspect-note" role="status">
        {{ unchanged ? t('原始 JSON 未被修改') : t('原始 JSON 已被修改') }} ·
        {{ t('区域代码保持不变，仅转换名称。') }}
      </p>
      <details class="inspect-details">
        <summary>{{ t('查看原始双语属性') }}</summary>
        <pre class="demo-json">{{
          JSON.stringify(
            sourcePreview.map(({ code, name, names }) => ({ code, name, names })),
            null,
            2,
          )
        }}</pre>
      </details>
    </section>

    <section class="inspect-availability">
      <h3>{{ t('地图可用性检查') }}</h3>
      <p class="detail">{{ t('输入地图 ID，检查是否收录对应地图；此处不影响上方的名称示例。') }}</p>
      <div class="inspect-check">
        <IxInput
          v-model:value="id"
          suffix="search"
          :placeholder="t('输入地图 ID，如 CN-provinces / US')"
          :aria-label="t('地图 ID')"
        />
        <span
          class="inspect-status"
          :class="{ 'inspect-status-available': id && exists }"
          role="status"
        >
          {{ !id ? t('请输入地图 ID') : exists ? t('地图可用') : t('地图不存在') }}
        </span>
      </div>
      <div class="inspect-presets">
        <span>{{ t('试一试') }}:</span>
        <IxButton
          v-for="map in ['CN-provinces', 'US', 'missing-map']"
          :key="map"
          size="sm"
          @click="id = map"
          >{{ map }}</IxButton
        >
      </div>
    </section>

    <details class="inspect-details inspect-manifest">
      <summary>{{ t('数据版本与来源') }}</summary>
      <IxDesc
        :label-width="locale === 'en' ? 200 : 120"
        label-align="start"
        class="demo-desc"
        :col="1"
        size="sm"
      >
        <IxDescItem :label="t('数据生成时间')">{{ manifest.updatedAt }}</IxDescItem>
        <IxDescItem :label="t('数据指纹')">{{ manifest.fingerprint }}</IxDescItem>
        <IxDescItem :label="t('地图文件数量')">{{ manifest.coverage.maps.length }}</IxDescItem>
        <IxDescItem label="availableMaps">{{ availableMaps.length }}</IxDescItem>
        <IxDescItem :label="t('数据来源')">
          <ul class="demo-sources">
            <li v-for="source in manifest.sources" :key="source.url">
              <a :href="source.url" target="_blank" rel="noreferrer">{{ source.url }}</a>
            </li>
          </ul>
        </IxDescItem>
      </IxDesc>
    </details>
    <p class="demo-apis inspect-apis">
      <span>{{ t('使用接口') }}:</span>
      <code>localizeGeoJSON(map)</code><code>hasGeoJSON(id)</code><code>availableMaps</code>
      <code>@idux/geo-areas/manifest</code>
    </p>
  </div>
</template>

<style scoped>
.inspect-demo {
  --inspect-border: var(--site-color-border, #e1e5eb);
  --inspect-surface: var(--site-color-info-container-bg, #f7f9fc);
}
.inspect-demo h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.inspect-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.inspect-comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}
.inspect-card {
  min-width: 0;
  border: 1px solid var(--inspect-border);
  border-radius: 8px;
  overflow: hidden;
}
.inspect-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px;
  background: var(--inspect-surface);
  border-bottom: 1px solid var(--inspect-border);
}
.inspect-card header code,
.inspect-locale {
  color: var(--geo-demo-text);
  font-size: 12px;
}
.inspect-card-body {
  padding: 0 16px 8px;
}
.inspect-card-body > .detail {
  margin: 14px 0;
  font-size: 13px;
}
.inspect-card table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
}
.inspect-card th,
.inspect-card td {
  padding: 12px 0;
  text-align: start;
  overflow-wrap: anywhere;
  border-bottom: 1px solid var(--inspect-border);
}
.inspect-card th {
  color: var(--geo-demo-text);
  font-size: 12px;
  font-weight: 400;
}
.inspect-card th:first-child {
  width: 42%;
}
.inspect-card tr:last-child td {
  border-bottom: 0;
}
.inspect-card-result {
  border-color: var(--site-color-primary, #458fff);
}
.inspect-note {
  color: var(--geo-demo-text);
  font-size: 13px;
  margin: 12px 0;
}
.inspect-details {
  font-size: 13px;
}
.inspect-details summary {
  cursor: pointer;
  color: var(--geo-demo-text);
  padding: 8px 0;
}
.inspect-details summary:focus-visible {
  outline: 2px solid var(--site-color-primary, #458fff);
  outline-offset: 2px;
}
.inspect-details pre {
  padding: 16px;
  background: var(--inspect-surface);
  border-radius: 6px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.inspect-availability {
  border-top: 1px solid var(--inspect-border);
  margin-top: 24px;
  padding-top: 24px;
}
.inspect-check {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}
.inspect-check :deep(.ix-input) {
  width: min(100%, 360px);
}
.inspect-status {
  color: var(--geo-demo-text);
  font-size: 13px;
}
.inspect-status-available {
  color: var(--site-color-success, #16856a);
}
.inspect-presets {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--geo-demo-text);
}
.inspect-manifest {
  border-top: 1px solid var(--inspect-border);
  margin-top: 24px;
  padding-top: 12px;
}
.inspect-apis {
  margin: 16px 0 0;
  font-size: 12px;
}
@media (max-width: 640px) {
  .inspect-comparison {
    grid-template-columns: 1fr;
  }
}
</style>

<archive-meta lang="json">
{
  "title": "地图名称本地化与可用性检查",
  "description": "对照原始数据与本地化结果，切换中英文观察名称变化；也可独立检查地图 ID 是否可用。",
  "index": 2
}
</archive-meta>
