<script setup lang="ts">
import { useLogStore } from '@/stores/logStore'
import StatsBar from './StatsBar.vue'
import Timeline from './Timeline.vue'
import AppPagination from '@/components/Common/AppPagination.vue'

const store = useLogStore()
</script>

<template>
  <main class="app-content">
    <StatsBar v-if="store.files.length > 0" />
    <Timeline v-if="store.files.length > 0 && store.filteredRecords.length > 0" />
    <AppPagination v-if="store.pagination.total > 0" />

    <!-- 空状态 -->
    <div v-if="store.files.length === 0" class="empty-state">
      <el-empty description="请上传日志文件开始查看">
        <template #image>
          <div style="font-size: 80px">📂</div>
        </template>
      </el-empty>
    </div>

    <!-- 无搜索结果 -->
    <div v-else-if="store.filteredRecords.length === 0" class="empty-state">
      <el-empty description="没有找到匹配的记录">
        <template #image>
          <div style="font-size: 80px">🔍</div>
        </template>
        <el-button type="primary" @click="store.resetFilters">重置筛选</el-button>
      </el-empty>
    </div>
  </main>
</template>

<style scoped lang="scss">
.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-color-page);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>