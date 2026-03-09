<script setup lang="ts">
import { useLogStore } from '@/stores/logStore'
import { useI18n } from 'vue-i18n'
import MessageCard from './MessageCard.vue'

const store = useLogStore()
const { t } = useI18n()

// 获取记录的唯一key
const getRecordKey = (record: any, index: number): string => {
  return record.uuid || `${record.type}-${index}`
}
</script>

<template>
  <div class="timeline">
    <div class="timeline-content" v-if="store.currentPageRecords.length > 0">
      <MessageCard
        v-for="(record, index) in store.currentPageRecords"
        :key="getRecordKey(record, index)"
        :record="record"
      />
    </div>
    <div class="empty-state" v-else>
      <el-empty :description="t('content.noRecords')">
        <template #description>
          <p class="empty-hint">{{ t('content.uploadPrompt') }}</p>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<style scoped lang="scss">
.timeline {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.timeline-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-hint {
  color: var(--text-color-secondary);
  font-size: 13px;
  margin-top: 8px;
}
</style>