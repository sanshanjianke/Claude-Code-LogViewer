<script setup lang="ts">
import { computed } from 'vue'
import { useLogStore } from '@/stores/logStore'
import { useI18n } from 'vue-i18n'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const store = useLogStore()
const { t } = useI18n()

// 消息类型选项
const typeOptions = computed(() => [
  { value: 'user', label: t('sidebar.userMessage') },
  { value: 'assistant', label: t('sidebar.assistantReply') },
  { value: 'tool_use', label: t('sidebar.toolCall') },
  { value: 'tool_result', label: t('sidebar.toolResult') },
  { value: 'queue-operation', label: 'Queue Operation' },
  { value: 'progress', label: t('sidebar.progress') },
  { value: 'file-history-snapshot', label: 'File Snapshot' },
])

// 工具名称选项
const toolOptions = computed(() => {
  return store.availableTools.map(tool => ({
    value: tool,
    label: tool,
  }))
})

const applyFilters = () => {
  store.applyFilters()
  ElMessage.success(t('sidebar.applyFilters'))
}

const resetFilters = () => {
  store.resetFilters()
  ElMessage.success(t('sidebar.resetFilters'))
}
</script>

<template>
  <div class="filter-panel">
    <div class="section-header">
      <span class="section-title">{{ t('sidebar.timeRange') }}</span>
    </div>

    <!-- 时间范围 -->
    <div class="filter-section">
      <div class="filter-label">{{ t('sidebar.timeRange') }}</div>
      <el-date-picker
        v-model="store.filters.startTime"
        type="datetime"
        :placeholder="t('sidebar.startTime')"
        size="small"
        style="width: 100%; margin-bottom: 8px"
        clearable
      />
      <el-date-picker
        v-model="store.filters.endTime"
        type="datetime"
        :placeholder="t('sidebar.endTime')"
        size="small"
        style="width: 100%"
        clearable
      />
    </div>

    <!-- 消息类型 -->
    <div class="filter-section">
      <div class="filter-label">{{ t('sidebar.messageTypes') }}</div>
      <el-checkbox-group v-model="store.filters.types" size="small">
        <div v-for="option in typeOptions" :key="option.value" class="checkbox-item">
          <el-checkbox :value="option.value">{{ option.label }}</el-checkbox>
        </div>
      </el-checkbox-group>
    </div>

    <!-- 工具名称 -->
    <div class="filter-section" v-if="store.availableTools.length > 0">
      <div class="filter-label">{{ t('sidebar.toolNames') }}</div>
      <el-select
        v-model="store.filters.toolNames"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :placeholder="t('sidebar.selectTool')"
        size="small"
        style="width: 100%"
        clearable
      >
        <el-option
          v-for="tool in toolOptions"
          :key="tool.value"
          :label="tool.label"
          :value="tool.value"
        />
      </el-select>
    </div>

    <!-- 关键词搜索 -->
    <div class="filter-section">
      <div class="filter-label">{{ t('sidebar.keywordSearch') }}</div>
      <el-input
        v-model="store.filters.keyword"
        :placeholder="t('sidebar.enterKeyword')"
        size="small"
        clearable
        @keyup.enter="applyFilters"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 文件路径 -->
    <div class="filter-section">
      <div class="filter-label">{{ t('sidebar.filePathFilter') }}</div>
      <el-input
        v-model="store.filters.filePath"
        :placeholder="t('sidebar.enterFilePath')"
        size="small"
        clearable
        @keyup.enter="applyFilters"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="filter-actions">
      <el-button type="primary" size="small" @click="applyFilters">
        {{ t('sidebar.applyFilters') }}
      </el-button>
      <el-button size="small" @click="resetFilters">
        <el-icon><RefreshRight /></el-icon>
        {{ t('sidebar.resetFilters') }}
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filter-panel {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.section-header {
  margin-bottom: 15px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-primary);
}

.filter-section {
  margin-bottom: 20px;
}

.filter-label {
  font-size: 13px;
  color: var(--text-color-regular);
  margin-bottom: 8px;
}

.checkbox-item {
  margin-bottom: 4px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>