import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LogFile, LogRecord, FilterOptions, Pagination, ThemeMode, AssistantContent, WorkDirectory, WatchedFile, SortOrder } from '@/types';
import { db } from '@/db/index';
import { parseJSONL, extractMetadata, readFile } from '@/utils/parser';

export const useLogStore = defineStore('log', () => {
  // State
  const files = ref<LogFile[]>([]);
  const activeFileId = ref<string | null>(null);
  const allRecords = ref<LogRecord[]>([]);
  const filteredRecords = ref<LogRecord[]>([]);
  const filters = ref<FilterOptions>({
    sessionId: null,
    startTime: null,
    endTime: null,
    types: ['user', 'assistant'],
    toolNames: [],
    keyword: '',
    filePath: '',
  });
  const pagination = ref<Pagination>({
    page: 1,
    pageSize: 50,
    total: 0,
  });
  const theme = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) || 'light');
  const sidebarCollapsed = ref(false);
  const expandedUuids = ref<Set<string>>(new Set());
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 排序状态，默认倒序（最新在前）
  const sortOrder = ref<SortOrder>((localStorage.getItem('sortOrder') as SortOrder) || 'desc');

  // 工作目录状态
  const workDirectory = ref<WorkDirectory>({
    handle: null,
    path: '',
    files: [],
    isWatching: false,
    autoRefresh: true,
    refreshInterval: 3000,
  });

  // 文件监控定时器
  let watchTimer: ReturnType<typeof setInterval> | null = null;

  // Getters
  const currentFile = computed(() =>
    files.value.find(f => f.id === activeFileId.value)
  );

  // 排序后的筛选记录
  const sortedFilteredRecords = computed(() => {
    const records = [...filteredRecords.value];

    records.sort((a, b) => {
      const tsA = (a as any).timestamp ? new Date((a as any).timestamp).getTime() : 0;
      const tsB = (b as any).timestamp ? new Date((b as any).timestamp).getTime() : 0;

      return sortOrder.value === 'desc' ? tsB - tsA : tsA - tsB;
    });

    return records;
  });

  const currentPageRecords = computed(() => {
    const { page, pageSize } = pagination.value;
    const start = (page - 1) * pageSize;
    return sortedFilteredRecords.value.slice(start, start + pageSize);
  });

  const availableTools = computed(() => {
    const tools = new Set<string>();
    allRecords.value.forEach(record => {
      if (record.type === 'assistant' && (record as any).message?.content) {
        (record as any).message.content.forEach((item: AssistantContent) => {
          if (item.type === 'tool_use') {
            tools.add(item.name);
          }
        });
      }
    });
    return Array.from(tools).sort();
  });

  const stats = computed(() => ({
    totalRecords: allRecords.value.length,
    filteredRecords: filteredRecords.value.length,
    userMessages: allRecords.value.filter(r => r.type === 'user').length,
    assistantMessages: allRecords.value.filter(r => r.type === 'assistant').length,
    toolCalls: allRecords.value.filter(r => {
      if (r.type !== 'assistant') return false;
      return (r as any).message?.content?.some((c: AssistantContent) => c.type === 'tool_use');
    }).length,
  }));

  // Actions
  async function uploadFile(file: File) {
    loading.value = true;
    error.value = null;

    try {
      const content = await readFile(file);
      const records = parseJSONL(content);
      const fileMeta = extractMetadata(records, file.name, file.size) as LogFile;

      // 保存文件元数据
      await db.files.add(fileMeta);

      // 保存记录到数据库
      const dbRecords = records.map((record, index) => ({
        ...record,
        fileId: fileMeta.id,
        lineNumber: index + 1,
      }));
      await db.records.bulkAdd(dbRecords);

      // 更新状态
      files.value.push(fileMeta);
      await loadRecords(fileMeta.id);

      return fileMeta;
    } catch (e: any) {
      error.value = e.message || '上传失败';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // 从 FileSystemFileHandle 读取并加载文件
  async function uploadFileFromHandle(fileHandle: FileSystemFileHandle) {
    loading.value = true;
    error.value = null;

    try {
      const file = await fileHandle.getFile();
      const content = await readFile(file);
      const records = parseJSONL(content);
      const fileMeta = extractMetadata(records, file.name, file.size) as LogFile;

      // 保存文件元数据
      await db.files.add(fileMeta);

      // 保存记录到数据库
      const dbRecords = records.map((record, index) => ({
        ...record,
        fileId: fileMeta.id,
        lineNumber: index + 1,
      }));
      await db.records.bulkAdd(dbRecords);

      // 更新状态
      files.value.push(fileMeta);
      await loadRecords(fileMeta.id);

      return fileMeta;
    } catch (e: any) {
      error.value = e.message || '读取文件失败';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // 选择工作目录
  async function selectWorkDirectory() {
    try {
      // 检查浏览器是否支持 File System Access API
      if (!('showDirectoryPicker' in window)) {
        throw new Error('您的浏览器不支持文件系统访问功能，请使用 Chrome、Edge 等现代浏览器');
      }

      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'read',
      });

      workDirectory.value.handle = dirHandle;
      workDirectory.value.path = dirHandle.name;

      // 扫描目录中的 .jsonl 文件
      await scanDirectoryFiles();

      return true;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        error.value = e.message || '选择目录失败';
      }
      throw e;
    }
  }

  // 扫描目录中的 .jsonl 文件
  async function scanDirectoryFiles() {
    if (!workDirectory.value.handle) return [];

    const jsonlFiles: WatchedFile[] = [];

    try {
      for await (const entry of (workDirectory.value.handle as any).values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.jsonl')) {
          const file = await entry.getFile();
          jsonlFiles.push({
            handle: entry,
            name: entry.name,
            size: file.size,
            lastModified: file.lastModified,
          });
        }
      }

      // 按修改时间排序（最新的在前）
      jsonlFiles.sort((a, b) => b.lastModified - a.lastModified);
      workDirectory.value.files = jsonlFiles;

      return jsonlFiles;
    } catch (e: any) {
      error.value = e.message || '扫描目录失败';
      throw e;
    }
  }

  // 开始监控文件变化
  function startWatching() {
    if (watchTimer) {
      clearInterval(watchTimer);
    }

    workDirectory.value.isWatching = true;

    // 定时检查文件变化
    watchTimer = setInterval(async () => {
      if (!workDirectory.value.autoRefresh || !workDirectory.value.handle) {
        return;
      }

      try {
        const oldFiles = [...workDirectory.value.files];
        await scanDirectoryFiles();
        const newFiles = workDirectory.value.files;

        // 检查是否有文件被修改或新增
        for (const newFile of newFiles) {
          const oldFile = oldFiles.find(f => f.name === newFile.name);

          // 新文件或文件被修改
          if (!oldFile || oldFile.lastModified !== newFile.lastModified) {
            // 检查该文件是否已加载
            const loadedFile = files.value.find(f => f.name === newFile.name);

            if (loadedFile && loadedFile.id === activeFileId.value) {
              // 如果是当前活动的文件，自动刷新
              await refreshFile(newFile);
            }
          }
        }
      } catch (e) {
        console.error('监控文件变化时出错:', e);
      }
    }, workDirectory.value.refreshInterval);
  }

  // 停止监控
  function stopWatching() {
    if (watchTimer) {
      clearInterval(watchTimer);
      watchTimer = null;
    }
    workDirectory.value.isWatching = false;
  }

  // 刷新文件内容
  async function refreshFile(watchedFile: WatchedFile) {
    loading.value = true;
    try {
      const file = await watchedFile.handle.getFile();
      const content = await readFile(file);
      const records = parseJSONL(content);

      // 查找现有的文件记录
      const existingFile = files.value.find(f => f.name === watchedFile.name);
      if (!existingFile) return;

      // 删除旧记录
      await db.records.where('fileId').equals(existingFile.id).delete();

      // 保存新记录
      const dbRecords = records.map((record, index) => ({
        ...record,
        fileId: existingFile.id,
        lineNumber: index + 1,
      }));
      await db.records.bulkAdd(dbRecords);

      // 更新文件元数据
      const fileMeta = extractMetadata(records, watchedFile.name, file.size) as LogFile;
      fileMeta.id = existingFile.id;
      fileMeta.loadTime = existingFile.loadTime;
      await db.files.put(fileMeta);

      // 更新状态中的文件信息
      const index = files.value.findIndex(f => f.id === existingFile.id);
      if (index !== -1) {
        files.value[index] = fileMeta;
      }

      // 如果是当前活动的文件，重新加载记录
      if (activeFileId.value === existingFile.id) {
        const updatedRecords = await db.records.where('fileId').equals(existingFile.id).toArray();
        allRecords.value = updatedRecords.map((r: any) => {
          const { fileId: _, lineNumber: __, ...rest } = r;
          return rest as LogRecord;
        });
        applyFilters();
      }
    } catch (e: any) {
      error.value = e.message || '刷新文件失败';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // 从工作目录加载文件
  async function loadFileFromDirectory(watchedFile: WatchedFile) {
    // 检查是否已加载
    const existingFile = files.value.find(f => f.name === watchedFile.name);
    if (existingFile) {
      // 已加载，直接切换
      await loadRecords(existingFile.id);
      return existingFile;
    }

    // 未加载，从 handle 读取
    return await uploadFileFromHandle(watchedFile.handle);
  }

  // 清除工作目录
  function clearWorkDirectory() {
    stopWatching();
    workDirectory.value.handle = null;
    workDirectory.value.path = '';
    workDirectory.value.files = [];
  }

  // 切换自动刷新
  function toggleAutoRefresh() {
    workDirectory.value.autoRefresh = !workDirectory.value.autoRefresh;
  }

  // 设置刷新间隔
  function setRefreshInterval(interval: number) {
    workDirectory.value.refreshInterval = interval;
    if (workDirectory.value.isWatching) {
      startWatching();
    }
  }

  // 切换排序
  function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    localStorage.setItem('sortOrder', sortOrder.value);
  }

  // 设置排序
  function setSortOrder(order: SortOrder) {
    sortOrder.value = order;
    localStorage.setItem('sortOrder', order);
  }

  async function loadRecords(fileId: string) {
    activeFileId.value = fileId;
    const records = await db.records.where('fileId').equals(fileId).toArray();
    allRecords.value = records.map((r: any) => {
      const { fileId: _, lineNumber: __, ...rest } = r;
      return rest as LogRecord;
    });
    applyFilters();
  }

  function applyFilters() {
    let result = [...allRecords.value];
    const { startTime, endTime, types, keyword, toolNames, filePath } = filters.value;

    // 时间筛选
    if (startTime) {
      result = result.filter(r => {
        const ts = (r as any).timestamp;
        return ts && new Date(ts) >= startTime;
      });
    }
    if (endTime) {
      result = result.filter(r => {
        const ts = (r as any).timestamp;
        return ts && new Date(ts) <= endTime;
      });
    }

    // 类型筛选
    if (types.length > 0) {
      result = result.filter(r => types.includes(r.type));
    }

    // 关键词筛选
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(r => {
        const content = JSON.stringify((r as any).message || r);
        return content.toLowerCase().includes(kw);
      });
    }

    // 工具名称筛选
    if (toolNames.length > 0) {
      result = result.filter(r => {
        if (r.type !== 'assistant') return false;
        return (r as any).message?.content?.some((c: AssistantContent) =>
          c.type === 'tool_use' && toolNames.includes(c.name)
        );
      });
    }

    // 文件路径筛选
    if (filePath) {
      result = result.filter(r => {
        const content = JSON.stringify(r);
        return content.toLowerCase().includes(filePath.toLowerCase());
      });
    }

    filteredRecords.value = result;
    pagination.value.total = result.length;
    pagination.value.page = 1;
  }

  function resetFilters() {
    filters.value = {
      sessionId: null,
      startTime: null,
      endTime: null,
      types: ['user', 'assistant'],
      toolNames: [],
      keyword: '',
      filePath: '',
    };
    applyFilters();
  }

  function toggleExpand(uuid: string) {
    if (expandedUuids.value.has(uuid)) {
      expandedUuids.value.delete(uuid);
    } else {
      expandedUuids.value.add(uuid);
    }
    // 触发响应式更新
    expandedUuids.value = new Set(expandedUuids.value);
  }

  function isExpanded(uuid: string): boolean {
    return expandedUuids.value.has(uuid);
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', theme.value === 'dark');
    localStorage.setItem('theme', theme.value);
  }

  async function removeFile(fileId: string) {
    await db.records.where('fileId').equals(fileId).delete();
    await db.files.delete(fileId);
    files.value = files.value.filter(f => f.id !== fileId);

    if (activeFileId.value === fileId) {
      activeFileId.value = null;
      allRecords.value = [];
      filteredRecords.value = [];
    }
  }

  async function clearAll() {
    await db.records.clear();
    await db.files.clear();
    files.value = [];
    activeFileId.value = null;
    allRecords.value = [];
    filteredRecords.value = [];
  }

  async function loadSavedFiles() {
    const savedFiles = await db.files.toArray();
    files.value = savedFiles;
  }

  function setPage(page: number) {
    pagination.value.page = page;
  }

  return {
    // State
    files,
    activeFileId,
    allRecords,
    filteredRecords,
    filters,
    pagination,
    theme,
    sidebarCollapsed,
    expandedUuids,
    loading,
    error,
    workDirectory,
    sortOrder,

    // Getters
    currentFile,
    currentPageRecords,
    sortedFilteredRecords,
    availableTools,
    stats,

    // Actions
    uploadFile,
    uploadFileFromHandle,
    loadRecords,
    applyFilters,
    resetFilters,
    toggleExpand,
    isExpanded,
    toggleTheme,
    removeFile,
    clearAll,
    loadSavedFiles,
    setPage,

    // 工作目录相关
    selectWorkDirectory,
    scanDirectoryFiles,
    startWatching,
    stopWatching,
    refreshFile,
    loadFileFromDirectory,
    clearWorkDirectory,
    toggleAutoRefresh,
    setRefreshInterval,

    // 排序相关
    toggleSortOrder,
    setSortOrder,
  };
});