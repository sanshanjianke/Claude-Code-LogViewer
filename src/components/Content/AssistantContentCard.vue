<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AssistantContent } from '@/types'
import CodeBlock from '@/components/Common/CodeBlock.vue'
import { escapeHtml } from '@/utils/format'

const props = defineProps<{
  content?: AssistantContent[]
  keyword?: string
}>()

const { t } = useI18n()

// 高亮关键词
const highlightKeyword = (text: string): string => {
  if (!props.keyword) return escapeHtml(text)
  const escaped = escapeHtml(text)
  const regex = new RegExp(`(${escapeRegex(props.keyword)})`, 'gi')
  return escaped.replace(regex, '<mark class="highlight">$1</mark>')
}

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<template>
  <div class="assistant-content">
    <template v-if="content && Array.isArray(content)">
      <div v-for="(item, index) in content" :key="index" class="content-block">
        <!-- 思考内容 -->
        <div v-if="item.type === 'thinking'" class="thinking-block">
          <div class="thinking-header">💭 {{ t('messageCard.thinking') }}</div>
          <div class="thinking-content">{{ item.thinking }}</div>
        </div>

        <!-- 文本内容 -->
        <div v-else-if="item.type === 'text'" class="text-block">
          <div
            class="text-content"
            v-html="highlightKeyword(item.text)"
          />
        </div>

        <!-- 工具调用 -->
        <div v-else-if="item.type === 'tool_use'" class="tool-use-block">
          <div class="tool-header">
            <span class="tool-icon">🔧</span>
            <span class="tool-name">{{ item.name }}</span>
            <span class="tool-id">{{ item.id }}</span>
          </div>
          <div class="tool-input">
            <CodeBlock :code="JSON.stringify(item.input, null, 2)" language="json" />
          </div>
        </div>

        <!-- 其他类型 -->
        <div v-else class="unknown-block">
          <span class="type-badge">{{ (item as any).type }}</span>
        </div>
      </div>
    </template>
    <div v-else class="empty">-</div>
  </div>
</template>

<style scoped lang="scss">
.assistant-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-block {
  border-radius: 6px;
  overflow: hidden;
}

.thinking-block {
  background-color: var(--thinking-message-bg);
  border-left: 3px solid var(--thinking-message-border);
  padding: 12px;
}

.thinking-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.thinking-content {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-color-secondary);
  font-style: italic;
  white-space: pre-wrap;
  word-break: break-word;
}

.text-block {
  background-color: var(--fill-color-lighter);
  padding: 12px;
}

.text-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.tool-use-block {
  background-color: var(--tool-message-bg);
  border: 1px solid var(--tool-message-border);
  border-radius: 6px;
  overflow: hidden;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: rgba(255, 152, 0, 0.1);
  border-bottom: 1px solid var(--tool-message-border);
}

.tool-icon {
  font-size: 16px;
}

.tool-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-primary);
}

.tool-id {
  font-size: 11px;
  color: var(--text-color-secondary);
  margin-left: auto;
}

.tool-input {
  padding: 10px;
}

.unknown-block {
  padding: 10px;
  background-color: var(--fill-color);
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--info-color);
  color: white;
  border-radius: 4px;
  font-size: 11px;
}

.empty {
  color: var(--text-color-placeholder);
  font-size: 13px;
}
</style>