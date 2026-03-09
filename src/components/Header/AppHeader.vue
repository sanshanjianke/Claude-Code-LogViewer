<script setup lang="ts">
import { ref } from 'vue'
import { useLogStore } from '@/stores/logStore'
import { useI18n } from 'vue-i18n'
import { Upload, Delete, Sunny, Moon, FolderOpened } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import LocaleSwitcher from '@/components/Common/LocaleSwitcher.vue'

const store = useLogStore()
const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  for (const file of Array.from(files)) {
    if (!file.name.endsWith('.jsonl')) {
      ElMessage.warning(t('messages.notJsonlFile', { name: file.name }))
      continue
    }
    try {
      await store.uploadFile(file)
      ElMessage.success(t('messages.fileUploadSuccess', { name: file.name }))
    } catch (e: any) {
      ElMessage.error(t('messages.fileUploadFailed', { message: e.message }))
    }
  }

  // 重置input
  target.value = ''
}

const handleClear = async () => {
  try {
    await ElMessageBox.confirm(t('messages.clearConfirm'), t('common.confirm'), {
      type: 'warning',
    })
    await store.clearAll()
    ElMessage.success(t('messages.clearSuccess'))
  } catch {
    // 用户取消
  }
}

const handleSelectDirectory = async () => {
  try {
    await store.selectWorkDirectory()
    ElMessage.success(t('messages.directorySelected', { path: store.workDirectory.path }))
  } catch (e: any) {
    if (e.message) {
      ElMessage.error(e.message)
    }
  }
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">
        <span class="logo-icon">📋</span>
        <span class="logo-text">{{ t('header.title') }}</span>
      </div>
    </div>

    <div class="header-right">
      <el-tooltip :content="t('header.workDirectory')" placement="bottom">
        <el-button type="success" @click="handleSelectDirectory">
          <el-icon><FolderOpened /></el-icon>
          {{ t('header.workDirectory') }}
        </el-button>
      </el-tooltip>

      <el-button type="primary" @click="triggerUpload" :loading="store.loading">
        <el-icon><Upload /></el-icon>
        {{ t('header.uploadLog') }}
      </el-button>

      <el-button @click="handleClear" :disabled="store.files.length === 0">
        <el-icon><Delete /></el-icon>
        {{ t('common.clear') }}
      </el-button>

      <el-button @click="store.toggleTheme()" circle>
        <el-icon v-if="store.theme === 'light'"><Moon /></el-icon>
        <el-icon v-else><Sunny /></el-icon>
      </el-button>

      <LocaleSwitcher />
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".jsonl"
      multiple
      style="display: none"
      @change="handleFileChange"
    />
  </header>
</template>

<style scoped lang="scss">
.app-header {
  height: var(--header-height);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color-lighter);
  box-shadow: var(--shadow-base);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;

  .logo-icon {
    font-size: 24px;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color-primary);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>