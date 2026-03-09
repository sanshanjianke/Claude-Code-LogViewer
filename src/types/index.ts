// 日志记录基础类型
export interface LogRecordBase {
  type: string;
  timestamp: string;
  sessionId: string;
  uuid: string;
  parentUuid: string | null;
  isSidechain: boolean;
  userType?: 'external' | 'internal';
  cwd?: string;
  version?: string;
  gitBranch?: string;
  permissionMode?: string;
  slug?: string;
}

// 用户消息
export interface UserMessage extends LogRecordBase {
  type: 'user';
  message: {
    role: 'user';
    content: MessageContent[];
  };
}

// 助手消息
export interface AssistantMessage extends LogRecordBase {
  type: 'assistant';
  message: {
    role: 'assistant';
    model: string;
    id: string;
    content: AssistantContent[];
    stop_reason?: string;
    usage?: UsageInfo;
  };
}

// 消息内容类型
export type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'tool_result'; tool_use_id: string; content: string }
  | { type: 'image'; source: ImageSource }
  | { type: 'thinking'; thinking: string; signature: string };

// 助手内容类型
export type AssistantContent =
  | { type: 'text'; text: string }
  | { type: 'thinking'; thinking: string; signature: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> };

// 图片来源
export interface ImageSource {
  type: string;
  media_type: string;
  data: string;
}

// 使用信息
export interface UsageInfo {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

// 工具结果记录
export interface ToolResultRecord extends LogRecordBase {
  type: 'user';
  message: {
    role: 'user';
    content: [{
      type: 'tool_result';
      tool_use_id: string;
      content: string;
    }];
  };
  toolUseResult?: ToolUseResultInfo;
  sourceToolAssistantUUID?: string;
}

// 工具使用结果信息
export interface ToolUseResultInfo {
  type: string;
  filePath?: string;
  content?: string;
  numLines?: number;
  startLine?: number;
  totalLines?: number;
  structuredPatch?: unknown[];
  originalFile?: string | null;
}

// 队列操作
export interface QueueOperation {
  type: 'queue-operation';
  operation: 'enqueue' | 'dequeue';
  timestamp: string;
  sessionId: string;
  uuid?: string;
}

// 文件备份信息
export interface FileBackup {
  backupFileName: string;
  version: number;
  backupTime: string;
}

// 文件历史快照
export interface FileHistorySnapshot {
  type: 'file-history-snapshot';
  messageId: string;
  snapshot: {
    messageId: string;
    trackedFileBackups: Record<string, FileBackup>;
    timestamp: string;
  };
  isSnapshotUpdate: boolean;
  uuid?: string;
  timestamp?: string;
}

// 进度数据
export interface ProgressData {
  type: string;
  hookEvent: string;
  hookName: string;
  command: string;
}

// 进度记录
export interface ProgressRecord extends LogRecordBase {
  type: 'progress';
  data: ProgressData;
  toolUseID?: string;
  parentToolUseID?: string;
}

// 联合类型
export type LogRecord = UserMessage | AssistantMessage | ToolResultRecord | QueueOperation | FileHistorySnapshot | ProgressRecord;

// 文件信息
export interface LogFile {
  id: string;
  name: string;
  size: number;
  sessionId: string;
  loadTime: Date;
  recordCount: number;
  startTime?: Date;
  endTime?: Date;
}

// 筛选条件
export interface FilterOptions {
  sessionId: string | null;
  startTime: Date | null;
  endTime: Date | null;
  types: string[];
  toolNames: string[];
  keyword: string;
  filePath: string;
}

// 分页参数
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

// 主题类型
export type ThemeMode = 'light' | 'dark';

// 排序方式
export type SortOrder = 'asc' | 'desc';

// 工作目录文件信息
export interface WatchedFile {
  handle: FileSystemFileHandle;
  name: string;
  size: number;
  lastModified: number;
}

// 工作目录状态
export interface WorkDirectory {
  handle: FileSystemDirectoryHandle | null;
  path: string;
  files: WatchedFile[];
  isWatching: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

// 应用全局状态
export interface AppState {
  files: LogFile[];
  activeFileId: string | null;
  allRecords: LogRecord[];
  filteredRecords: LogRecord[];
  filters: FilterOptions;
  pagination: Pagination;
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  expandedUuids: Set<string>;
  loading: boolean;
  error: string | null;
  workDirectory: WorkDirectory;
  sortOrder: SortOrder;
}