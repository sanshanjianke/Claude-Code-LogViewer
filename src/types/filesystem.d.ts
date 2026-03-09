// File System Access API 类型声明
interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
}

interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
  values(): AsyncIterableIterator<FileSystemHandle>;
  keys(): AsyncIterableIterator<string>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>;
}

interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

interface ShowDirectoryPickerOptions {
  id?: string;
  mode?: 'read' | 'readwrite';
  startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
  excludeAcceptAllOption?: boolean;
}

interface Window {
  showDirectoryPicker(options?: ShowDirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
  showOpenFilePicker(options?: {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: Array<{
      description?: string;
      accept: Record<string, string[]>;
    }>;
  }): Promise<FileSystemFileHandle[]>;
  showSaveFilePicker(options?: {
    suggestedName?: string;
    types?: Array<{
      description?: string;
      accept: Record<string, string[]>;
    }>;
  }): Promise<FileSystemFileHandle>;
}