<script setup lang="ts">
import { useLogStore } from '@/stores/logStore'
import FileList from './FileList.vue'
import FilterPanel from './FilterPanel.vue'
import WorkDirectoryPanel from './WorkDirectoryPanel.vue'

const store = useLogStore()
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: store.sidebarCollapsed }">
    <WorkDirectoryPanel />
    <FileList />
    <FilterPanel />
  </aside>
</template>

<style scoped lang="scss">
.app-sidebar {
  width: var(--sidebar-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  border-right: 1px solid var(--border-color-lighter);
  overflow: hidden;
  transition: width 0.3s ease;

  &.collapsed {
    width: var(--sidebar-collapsed-width);
  }
}
</style>