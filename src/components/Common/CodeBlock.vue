<script setup lang="ts">
import { ref, computed } from 'vue'
import { hljs } from '@/main'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  code: string
  language?: string
}>()

const { t } = useI18n()

// 自动换行状态
const wordWrap = ref(true)

const highlightedCode = computed(() => {
  if (!props.language || !props.code) {
    return escapeHtml(props.code || '')
  }
  try {
    const result = hljs.highlight(props.code, { language: props.language })
    return result.value
  } catch {
    return escapeHtml(props.code)
  }
})

const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char] || char)
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    ElMessage.success(t('common.copied'))
  } catch {
    ElMessage.error(t('common.error'))
  }
}

const toggleWordWrap = () => {
  wordWrap.value = !wordWrap.value
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="language-badge" v-if="language">{{ language }}</span>
      <div class="header-actions">
        <el-button
          size="small"
          text
          :type="wordWrap ? 'primary' : 'default'"
          @click="toggleWordWrap"
          :title="wordWrap ? 'Disable word wrap' : 'Enable word wrap'"
        >
          {{ wordWrap ? 'Wrap' : 'No Wrap' }}
        </el-button>
        <el-button size="small" text @click="copyCode">
          {{ t('common.copy') }}
        </el-button>
      </div>
    </div>
    <pre class="code-content" :class="{ 'word-wrap': wordWrap }">
      <code :class="`language-${language}`" v-html="highlightedCode"></code>
    </pre>
  </div>
</template>

<style scoped lang="scss">
.code-block {
  background-color: var(--fill-color-lighter);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color-lighter);
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background-color: var(--fill-color);
  border-bottom: 1px solid var(--border-color-lighter);
}

.language-badge {
  font-size: 11px;
  padding: 2px 6px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 3px;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.code-content {
  padding: 12px;
  margin: 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;

  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  // 默认不换行，横向滚动
  &:not(.word-wrap) {
    white-space: pre;
  }

  // 自动换行模式
  &.word-wrap {
    white-space: pre-wrap;
    word-break: break-all;
    overflow-x: hidden;
  }
}
</style>