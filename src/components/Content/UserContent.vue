<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { MessageContent } from '@/types'

const { t } = useI18n()

defineProps<{
  content?: MessageContent[]
}>()
</script>

<template>
  <div class="user-content">
    <template v-if="content && Array.isArray(content)">
      <div v-for="(item, index) in content" :key="index" class="content-item">
        <!-- 文本消息 -->
        <div v-if="item.type === 'text'" class="text-content">
          {{ item.text }}
        </div>

        <!-- 工具结果（不在这里处理） -->
        <div v-else-if="item.type === 'tool_result'" class="tool-result-preview">
          <span class="badge">{{ t('messageCard.toolResult') }}</span>
        </div>

        <!-- 其他类型 -->
        <div v-else class="other-type">
          <span class="badge">{{ item.type }}</span>
        </div>
      </div>
    </template>
    <div v-else class="empty">-</div>
  </div>
</template>

<style scoped lang="scss">
.user-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-item {
  padding: 8px 12px;
  background-color: var(--fill-color-lighter);
  border-radius: 6px;
}

.text-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.tool-result-preview,
.other-type {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 11px;
}

.empty {
  color: var(--text-color-placeholder);
  font-size: 13px;
}
</style>