<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLogStore } from '@/stores/logStore'
import { useI18n } from 'vue-i18n'
import { formatSize } from '@/utils/format'
import { Document, Refresh, Close, VideoPlay, VideoPause, Timer, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const store = useLogStore()
const { t } = useI18n()

// 刷新间隔选项（秒）
const refreshIntervalOptions = computed(() => [
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
])

const showSettings = ref(false)

const isFileLoaded = computed(() => {
  return (fileName: string) => store.files.some(f => f.name === fileName)
})

const isActiveFile = computed(() => {
  return (fileName: string) => {
    const file = store.files.find(f => f.name === fileName)
    return file?.id === store.activeFileId
  }
})

const currentIntervalLabel = computed(() => {
  const option = refreshIntervalOptions.value.find(o => o.value === store.workDirectory.refreshInterval)
  return option?.label || '3s'
})

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadFile = async (watchedFile: any) => {
  try {
    await store.loadFileFromDirectory(watchedFile)
    ElMessage.success(t('messages.fileLoaded', { name: watchedFile.name }))
  } catch (e: any) {
    ElMessage.error(t('messages.loadFailed', { message: e.message }))
  }
}

const refreshFile = async (watchedFile: any) => {
  try {
    await store.refreshFile(watchedFile)
    ElMessage.success(t('messages.fileRefreshed', { name: watchedFile.name }))
  } catch (e: any) {
    ElMessage.error(t('messages.refreshFailed', { message: e.message }))
  }
}

const toggleWatch = () => {
  if (store.workDirectory.isWatching) {
    store.stopWatching()
    ElMessage.info(t('messages.monitoringStopped'))
  } else {
    store.startWatching()
    ElMessage.success(t('messages.monitoringStarted'))
  }
}

const refreshDirectory = async () => {
  try {
    await store.scanDirectoryFiles()
    ElMessage.success(t('messages.directoryRefreshed'))
  } catch (e: any) {
    ElMessage.error(t('messages.refreshFailed', { message: e.message }))
  }
}

const closeDirectory = () => {
  store.clearWorkDirectory()
  ElMessage.info(t('messages.directoryClosed'))
}

const handleIntervalChange = (value: number) => {
  store.setRefreshInterval(value)
  const option = refreshIntervalOptions.value.find(o => o.value === value)
  ElMessage.success(t('messages.intervalChanged', { interval: option?.label }))
}

onMounted(() => {
  // 默认开启监控
  if (store.workDirectory.handle && !store.workDirectory.isWatching) {
    store.startWatching()
  }
})

onUnmounted(() => {
  store.stopWatching()
})
</script>

<template>
  <div class="work-directory-panel" v-if="store.workDirectory.handle">
    <div class="panel-header">
      <div class="header-info">
        <span class="folder-icon">📁</span>
        <span class="folder-name">{{ store.workDirectory.path }}</span>
        <el-tag size="small" type="info">{{ store.workDirectory.files.length }} {{ t('workDirectory.files') }}</el-tag>
      </div>
      <div class="header-actions">
        <el-tooltip :content="t('common.settings')" placement="top">
          <el-button size="small" circle @click="showSettings = !showSettings">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="store.workDirectory.isWatching ? t('workDirectory.stopMonitoring') : t('workDirectory.startMonitoring')" placement="top">
          <el-button
            :type="store.workDirectory.isWatching ? 'warning' : 'success'"
            size="small"
            circle
            @click="toggleWatch"
          >
            <el-icon v-if="store.workDirectory.isWatching"><VideoPause /></el-icon>
            <el-icon v-else><VideoPlay /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="t('workDirectory.refreshDirectory')" placement="top">
          <el-button size="small" circle @click="refreshDirectory">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="t('workDirectory.closeDirectory')" placement="top">
          <el-button type="danger" size="small" circle @click="closeDirectory">
            <el-icon><Close /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 设置面板 -->
    <div class="settings-panel" v-if="showSettings">
      <div class="setting-item">
        <span class="setting-label">{{ t('workDirectory.refreshInterval') }}:</span>
        <el-select
          :model-value="store.workDirectory.refreshInterval"
          size="small"
          style="width: 100px"
          @change="handleIntervalChange"
        >
          <el-option
            v-for="option in refreshIntervalOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 监控状态提示 -->
    <div class="watch-status" :class="{ active: store.workDirectory.isWatching }">
      <el-icon><Timer /></el-icon>
      <span v-if="store.workDirectory.isWatching">
        {{ t('workDirectory.monitoring') }} · {{ t('workDirectory.refreshEvery') }} {{ currentIntervalLabel }}
      </span>
      <span v-else>{{ t('workDirectory.monitoringPaused') }}</span>
    </div>

    <!-- 文件列表 -->
    <div class="file-list">
      <div
        v-for="file in store.workDirectory.files"
        :key="file.name"
        class="file-item"
        :class="{ active: isActiveFile(file.name) }"
        @click="loadFile(file)"
      >
        <el-icon class="file-icon"><Document /></el-icon>
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-meta">
            {{ formatSize(file.size) }} · {{ formatTime(file.lastModified) }}
          </div>
        </div>
        <div class="file-actions">
          <el-tag v-if="isFileLoaded(file.name)" size="small" type="success">{{ t('workDirectory.loaded') }}</el-tag>
          <el-button
            v-if="isFileLoaded(file.name)"
            size="small"
            circle
            @click.stop="refreshFile(file)"
            :title="t('common.refresh')"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <div v-if="store.workDirectory.files.length === 0" class="empty-state">
        {{ t('workDirectory.noJsonlFiles') }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.work-directory-panel {
  padding: 15px;
  border-bottom: 1px solid var(--border-color-lighter);
  background-color: var(--fill-color-lighter);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .folder-icon {
    font-size: 18px;
  }

  .folder-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color-primary);
  }
}

.header-actions {
  display: flex;
  gap: 5px;
}

.settings-panel {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: var(--bg-color);
  border-radius: 6px;
  border: 1px solid var(--border-color-lighter);
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 13px;
  color: var(--text-color-regular);
}

.watch-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-bottom: 10px;
  padding: 4px 8px;
  background-color: var(--fill-color);
  border-radius: 4px;

  &.active {
    color: var(--success-color);

    .el-icon {
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--bg-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    background-color: var(--fill-color);
    border-color: var(--primary-color-light-5);
  }

  &.active {
    background-color: var(--primary-color-light-9);
    border-color: var(--primary-color);

    .file-name {
      color: var(--primary-color);
    }
  }
}

.file-icon {
  font-size: 20px;
  color: var(--primary-color);
  margin-right: 10px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 11px;
  color: var(--text-color-secondary);
  margin-top: 2px;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--text-color-secondary);
  font-size: 13px;
}
</style>