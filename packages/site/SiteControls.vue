<script setup lang="ts">
import { t } from '@/shared/i18n'
import ThemeToggle from './ThemeToggle.vue'
import { locale, toggleLocale } from '@/shared/locale'
</script>

<template>
  <div class="site-controls" role="group" :aria-label="t('站点设置')">
    <button
      class="site-theme-toggle site-locale-toggle"
      type="button"
      :aria-label="t(locale === 'zh-CN' ? '切换站点语言为英文' : '切换站点语言为中文')"
      :title="t(locale === 'zh-CN' ? '语言：中文，切换为英文' : '语言：英文，切换为中文')"
      @click="toggleLocale"
    >
      <span aria-hidden="true">{{ locale === 'zh-CN' ? '中' : 'EN' }}</span>
    </button>
    <ThemeToggle />
  </div>
</template>
