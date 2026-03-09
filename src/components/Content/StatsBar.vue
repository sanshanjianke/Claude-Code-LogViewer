<script setup lang="ts">
import { useLogStore } from '@/stores/logStore'
import { useI18n } from 'vue-i18n'
import { formatTime } from '@/utils/format'
import { SortDown, SortUp } from '@element-plus/icons-vue'

const store = useLogStore()
const { t } = useI18n()
</script>

<template>
  <div class="stats-bar">
    <!-- 排序按钮 -->
    <div class="sort-control">
      <el-tooltip :content="store.sortOrder === 'desc' ? t('stats.newestFirst') : t('stats.oldestFirst')" placement="bottom">
        <el-button
          :type="store.sortOrder === 'desc' ? 'primary' : 'default'"
          size="small"
          @click="store.toggleSortOrder()"
        >
          <el-icon><SortDown v-if="store.sortOrder === 'desc'" /><SortUp v-else /></el-icon>
          <span class="sort-text">{{ store.sortOrder === 'desc' ? t('stats.newest') : t('stats.oldest') }}</span>
        </el-button>
      </el-tooltip>
    </div>

    <div class="stats-divider"></div>

    <div class="stat-item">
      <span class="stat-label">{{ t('stats.totalRecords') }}</span>
      <span class="stat-value">{{ store.stats.totalRecords }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">{{ t('stats.filteredRecords') }}</span>
      <span class="stat-value">{{ store.stats.filteredRecords }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">{{ t('stats.userMessages') }}</span>
      <span class="stat-value">{{ store.stats.userMessages }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">{{ t('stats.assistantMessages') }}</span>
      <span class="stat-value">{{ store.stats.assistantMessages }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">{{ t('stats.toolCalls') }}</span>
      <span class="stat-value">{{ store.stats.toolCalls }}</span>
    </div>

    <div class="file-info" v-if="store.currentFile">
      <span class="info-label">{{ t('stats.currentFile') }}:</span>
      <span class="info-value">{{ store.currentFile.name }}</span>
      <span class="info-divider">|</span>
      <span class="info-label">{{ t('stats.timeRange') }}:</span>
      <span class="info-value">
        {{ formatTime(store.currentFile.startTime) }} ~ {{ formatTime(store.currentFile.endTime) }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stats-bar {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color-lighter);
  gap: 20px;
  flex-wrap: wrap;
}

.sort-control {
  display: flex;
  align-items: center;

  .sort-text {
    margin-left: 4px;
    font-size: 12px;
  }
}

.stats-divider {
  width: 1px;
  height: 20px;
  background-color: var(--border-color-lighter);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.file-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.info-label {
  color: var(--text-color-secondary);
}

.info-value {
  color: var(--text-color-regular);
}

.info-divider {
  color: var(--border-color);
  margin: 0 6px;
}
</style>