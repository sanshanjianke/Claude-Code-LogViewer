<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { availableLocales, setLocale } from '@/locales'

const { locale } = useI18n()

const handleLocaleChange = (localeCode: string) => {
  setLocale(localeCode)
}
</script>

<template>
  <el-dropdown trigger="click" @command="handleLocaleChange">
    <el-button circle>
      <span class="locale-icon">🌐</span>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="loc in availableLocales"
          :key="loc.code"
          :command="loc.code"
          :class="{ 'is-active': locale === loc.code }"
        >
          <span class="locale-flag">{{ loc.flag }}</span>
          <span class="locale-name">{{ loc.name }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
.locale-icon {
  font-size: 16px;
}

.locale-flag {
  margin-right: 8px;
}

.locale-name {
  font-size: 13px;
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--primary-color);
  font-weight: 600;
}
</style>