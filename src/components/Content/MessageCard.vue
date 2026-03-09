<script setup lang="ts">
import { computed } from 'vue'
import type { LogRecord } from '@/types'
import { useLogStore } from '@/stores/logStore'
import { useI18n } from 'vue-i18n'
import { formatTime } from '@/utils/format'
import UserContent from './UserContent.vue'
import AssistantContentCard from './AssistantContentCard.vue'
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps<{
  record: LogRecord
}>()

const store = useLogStore()
const { t } = useI18n()

// 获取uuid
const recordUuid = computed(() => (props.record as any).uuid || '')

// 获取timestamp
const recordTimestamp = computed(() => (props.record as any).timestamp || '')

// 消息类型
const messageType = computed(() => {
  if (props.record.type === 'user') {
    // 检查是否是工具结果
    const content = (props.record as any).message?.content
    if (Array.isArray(content) && content[0]?.type === 'tool_result') {
      return 'tool-result'
    }
    return 'user'
  }
  if (props.record.type === 'assistant') return 'assistant'
  if (props.record.type === 'queue-operation') return 'queue'
  if (props.record.type === 'file-history-snapshot') return 'snapshot'
  if (props.record.type === 'progress') return 'progress'
  return 'other'
})

// 图标
const icon = computed(() => {
  switch (messageType.value) {
    case 'user': return '👤'
    case 'assistant': return '🤖'
    case 'tool-result': return '📋'
    case 'queue': return '⚡'
    case 'snapshot': return '📷'
    case 'progress': return '⏳'
    default: return '📄'
  }
})

// 类型标签
const typeLabel = computed(() => {
  switch (messageType.value) {
    case 'user': return t('messageCard.user')
    case 'assistant': return `${t('messageCard.assistant')} (${(props.record as any).message?.model || 'unknown'})`
    case 'tool-result': return t('messageCard.toolResult')
    case 'queue': return `${t('messageCard.queue')} - ${(props.record as any).operation}`
    case 'snapshot': return t('messageCard.snapshot')
    case 'progress': return t('messageCard.progress')
    default: return props.record.type
  }
})

// 是否可展开
const isExpandable = computed(() => {
  return messageType.value === 'assistant' || messageType.value === 'user' || messageType.value === 'tool-result'
})

const isExpanded = computed(() => store.isExpanded(recordUuid.value))

const toggleExpand = () => {
  if (isExpandable.value) {
    store.toggleExpand(recordUuid.value)
  }
}
</script>

<template>
  <div class="message-card" :class="messageType">
    <!-- 消息头部 -->
    <div class="message-header" @click="toggleExpand">
      <div class="header-left">
        <span class="message-icon">{{ icon }}</span>
        <span class="message-type">{{ typeLabel }}</span>
        <span class="message-time">{{ formatTime(recordTimestamp) }}</span>
      </div>
      <el-icon v-if="isExpandable" class="expand-icon" :class="{ expanded: isExpanded }">
        <ArrowDown />
      </el-icon>
    </div>

    <!-- 消息内容 -->
    <div class="message-body" v-show="!isExpandable || isExpanded">
      <!-- 用户消息 -->
      <UserContent
        v-if="messageType === 'user'"
        :content="(record as any).message?.content"
      />

      <!-- 助手消息 -->
      <AssistantContentCard
        v-else-if="messageType === 'assistant'"
        :content="(record as any).message?.content"
        :keyword="store.filters.keyword"
      />

      <!-- 工具结果 -->
      <div v-else-if="messageType === 'tool-result'" class="tool-result-content">
        <div class="tool-use-id">
          {{ t('messageCard.toolId') }}: {{ (record as any).message?.content?.[0]?.tool_use_id }}
        </div>
        <pre class="result-content">{{ (record as any).message?.content?.[0]?.content }}</pre>
      </div>

      <!-- 队列操作 -->
      <div v-else-if="messageType === 'queue'" class="queue-content">
        {{ t('messageCard.operation') }}: {{ (record as any).operation }}
      </div>

      <!-- 文件快照 -->
      <div v-else-if="messageType === 'snapshot'" class="snapshot-content">
        <pre>{{ JSON.stringify(record, null, 2) }}</pre>
      </div>

      <!-- 进度 -->
      <div v-else-if="messageType === 'progress'" class="progress-content">
        <div class="progress-item">
          <span class="label">{{ t('messageCard.event') }}:</span>
          <span class="value">{{ (record as any).data?.hookEvent }}</span>
        </div>
        <div class="progress-item">
          <span class="label">{{ t('messageCard.command') }}:</span>
          <span class="value">{{ (record as any).data?.command }}</span>
        </div>
      </div>

      <!-- 其他 -->
      <div v-else class="other-content">
        <pre>{{ JSON.stringify(record, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.message-card {
  background-color: var(--bg-color);
  border-radius: 8px;
  border-left: 4px solid var(--border-color);
  box-shadow: var(--shadow-light);
  overflow: hidden;

  &.user {
    border-left-color: var(--user-message-border);
    .message-header { background-color: var(--user-message-bg); }
  }

  &.assistant {
    border-left-color: var(--assistant-message-border);
    .message-header { background-color: var(--assistant-message-bg); }
  }

  &.tool-result {
    border-left-color: var(--tool-message-border);
    .message-header { background-color: var(--tool-message-bg); }
  }
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    filter: brightness(0.98);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-icon {
  font-size: 18px;
}

.message-type {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-primary);
}

.message-time {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.expand-icon {
  transition: transform 0.3s;
  color: var(--text-color-secondary);

  &.expanded {
    transform: rotate(180deg);
  }
}

.message-body {
  padding: 15px;
  border-top: 1px solid var(--border-color-lighter);
}

.tool-result-content {
  .tool-use-id {
    font-size: 12px;
    color: var(--text-color-secondary);
    margin-bottom: 10px;
  }

  .result-content {
    background-color: var(--fill-color-lighter);
    padding: 10px;
    border-radius: 4px;
    font-size: 12px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 300px;
    overflow-y: auto;
  }
}

.queue-content {
  font-size: 13px;
  color: var(--text-color-regular);
}

.snapshot-content,
.other-content {
  pre {
    background-color: var(--fill-color-lighter);
    padding: 10px;
    border-radius: 4px;
    font-size: 12px;
    overflow-x: auto;
    max-height: 200px;
  }
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-item {
  font-size: 13px;

  .label {
    color: var(--text-color-secondary);
    margin-right: 8px;
  }

  .value {
    color: var(--text-color-regular);
  }
}
</style>