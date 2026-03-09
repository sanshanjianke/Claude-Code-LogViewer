<script setup lang="ts">
import { useLogStore } from '@/stores/logStore'
import { useI18n } from 'vue-i18n'
import { formatSize } from '@/utils/format'
import { Document, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const store = useLogStore()
const { t } = useI18n()

const selectFile = (fileId: string) => {
  store.loadRecords(fileId)
}

const removeFile = async (fileId: string) => {
  try {
    await store.removeFile(fileId)
    ElMessage.success(t('messages.fileDeleted'))
  } catch (e: any) {
    ElMessage.error(t('messages.deleteFailed', { message: e.message }))
  }
}
</script>

<template>
  <div class="file-list">
    <div class="section-header">
      <span class="section-title">{{ t('sidebar.loadedFiles') }}</span>
      <span class="file-count">({{ store.files.length }})</span>
    </div>

    <div class="file-items" v-if="store.files.length > 0">
      <div
        v-for="file in store.files"
        :key="file.id"
        class="file-item"
        :class="{ active: file.id === store.activeFileId }"
        @click="selectFile(file.id)"
      >
        <el-icon class="file-icon"><Document /></el-icon>
        <div class="file-info">
          <div class="file-name" :title="file.name">{{ file.name }}</div>
          <div class="file-meta">
            {{ formatSize(file.size) }} · {{ file.recordCount }} {{ t('pagination.records') }}
          </div>
        </div>
        <el-button
          type="danger"
          size="small"
          circle
          class="remove-btn"
          @click.stop="removeFile(file.id)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty :description="t('sidebar.noFiles')" :image-size="60" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.file-list {
  padding: 15px;
  border-bottom: 1px solid var(--border-color-lighter);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-primary);
}

.file-count {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-left: 5px;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--fill-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--fill-color);
  }

  &.active {
    background-color: var(--primary-color);
    color: white;

    .file-name,
    .file-meta {
      color: white;
    }

    .file-icon {
      color: white;
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

.remove-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .remove-btn {
  opacity: 1;
}

.empty-state {
  padding: 20px 0;
}
</style>