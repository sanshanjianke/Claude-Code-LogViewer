import type { LogRecord, LogFile } from '@/types';

/**
 * 解析JSONL文件内容
 */
export function parseJSONL(content: string): LogRecord[] {
  const lines = content.split('\n').filter(line => line.trim());
  const records: LogRecord[] = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      const line = lines[i];
      if (!line) continue;
      const record = JSON.parse(line) as LogRecord;
      (record as any)._lineNumber = i + 1;
      records.push(record);
    } catch {
      console.warn(`Failed to parse line ${i + 1}`);
      records.push({
        _parseError: true,
        _lineNumber: i + 1,
        _raw: lines[i],
        type: 'parse-error',
        timestamp: new Date().toISOString(),
        sessionId: '',
        uuid: `error-${i}`,
        parentUuid: null,
        isSidechain: false,
      } as any);
    }
  }

  return records;
}

/**
 * 提取文件元数据
 */
export function extractMetadata(records: LogRecord[], fileName: string, fileSize: number): Partial<LogFile> {
  const timestamps = records
    .filter((r: any) => r.timestamp)
    .map((r: any) => new Date(r.timestamp));

  const sessionId = (records.find((r: any) => r.sessionId) as any)?.sessionId || '';

  return {
    id: generateId(),
    name: fileName,
    size: fileSize,
    sessionId,
    loadTime: new Date(),
    recordCount: records.length,
    startTime: timestamps.length ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : undefined,
    endTime: timestamps.length ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : undefined,
  };
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 读取文件内容
 */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}