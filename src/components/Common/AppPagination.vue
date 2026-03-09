<script setup lang="ts">
import { useLogStore } from '@/stores/logStore'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const store = useLogStore()
const { t } = useI18n()

const currentPage = computed({
  get: () => store.pagination.page,
  set: (val) => store.setPage(val),
})

const pageSize = computed(() => store.pagination.pageSize)
const total = computed(() => store.pagination.total)
</script>

<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next, jumper"
      background
    >
      <template #total>
        {{ t('pagination.of') }} {{ total }} {{ t('pagination.records') }}
      </template>
    </el-pagination>
  </div>
</template>

<style scoped lang="scss">
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 15px;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color-lighter);
}
</style>