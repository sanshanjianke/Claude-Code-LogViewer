<script setup lang="ts">
import { onMounted } from 'vue'
import { useLogStore } from './stores/logStore'
import AppHeader from './components/Header/AppHeader.vue'
import AppSidebar from './components/Sidebar/AppSidebar.vue'
import AppContent from './components/Content/AppContent.vue'

const store = useLogStore()

onMounted(async () => {
  await store.loadSavedFiles()
})
</script>

<template>
  <div class="app-container" :class="{ dark: store.theme === 'dark' }">
    <AppHeader />
    <div class="main-layout">
      <AppSidebar />
      <AppContent />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-page);
}

.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>