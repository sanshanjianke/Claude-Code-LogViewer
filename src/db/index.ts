import Dexie from 'dexie';
import type { LogFile } from '@/types';

// 数据库记录类型（带文件ID和行号）
interface DBRecord {
  fileId: string;
  lineNumber: number;
  [key: string]: any;
}

// 数据库定义
class ClaudeLogDB extends Dexie {
  files!: Dexie.Table<LogFile, string>;
  records!: Dexie.Table<DBRecord, string>;

  constructor() {
    super('ClaudeLogReaderDB');
    this.version(1).stores({
      files: 'id, sessionId, loadTime',
      records: '[fileId+lineNumber], fileId, timestamp, type, sessionId'
    });
  }
}

const db = new ClaudeLogDB();

export { db };
export type { DBRecord };