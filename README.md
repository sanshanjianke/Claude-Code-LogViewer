# Claude Code Log Reader

[English](#english) | [中文](#中文)

---

## English

A modern web-based log viewer for Claude Code JSONL files. Features include file upload, real-time directory monitoring with customizable refresh intervals, log filtering by time/type/tool/keyword, sorting (newest/oldest first), syntax highlighting, and dark/light theme support.

### Features

- **File Upload**: Upload `.jsonl` log files directly
- **Work Directory Monitoring**: Select a directory and monitor log files in real-time
  - Customizable refresh interval (1s, 2s, 3s, 5s, 10s, 30s)
  - Auto-refresh when files are modified
- **Log Filtering**:
  - By time range
  - By message type (user, assistant, tool_use, etc.)
  - By tool name
  - By keyword
  - By file path
- **Sorting**: Toggle between newest-first (default) and oldest-first
- **Syntax Highlighting**: JSON code blocks with highlight.js
- **Theme Support**: Light and dark themes
- **Bilingual Support**: English and Chinese (中文)
- **Local Storage**: Data persisted in IndexedDB

### Tech Stack

- Vue 3 + TypeScript
- Pinia (State Management)
- Element Plus (UI Components)
- Dexie.js (IndexedDB)
- highlight.js (Syntax Highlighting)
- vue-i18n (Internationalization)
- Vite (Build Tool)

### Browser Support

This app uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) for directory monitoring. Supported browsers:
- Chrome 86+
- Edge 86+
- Opera 72+

Firefox and Safari are not currently supported for directory monitoring features.

### Getting Started

```bash
# Clone the repository
git clone https://github.com/sanshanjianke/Claude-Code-LogViewer.git

# Enter the project directory
cd Claude-Code-LogViewer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### License

MIT

---

## 中文

一个现代化的 Claude Code JSONL 日志查看器。支持文件上传、工作目录实时监控（可自定义刷新间隔）、多维度筛选（时间/类型/工具/关键词）、排序切换、语法高亮、中英文双语界面和暗色主题。

### 功能特性

- **文件上传**: 直接上传 `.jsonl` 日志文件
- **工作目录监控**: 选择目录并实时监控日志文件
  - 可自定义刷新间隔（1秒、2秒、3秒、5秒、10秒、30秒）
  - 文件修改时自动刷新
- **日志筛选**:
  - 按时间范围筛选
  - 按消息类型筛选（用户、助手、工具调用等）
  - 按工具名称筛选
  - 按关键词搜索
  - 按文件路径筛选
- **排序功能**: 支持最新在前（默认）和最早在前切换
- **语法高亮**: JSON 代码块高亮显示
- **主题支持**: 支持亮色和暗色主题
- **双语支持**: 支持中英文切换
- **本地存储**: 数据持久化存储在 IndexedDB

### 技术栈

- Vue 3 + TypeScript
- Pinia（状态管理）
- Element Plus（UI 组件库）
- Dexie.js（IndexedDB 封装）
- highlight.js（语法高亮）
- vue-i18n（国际化）
- Vite（构建工具）

### 浏览器支持

本应用使用 [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) 实现目录监控功能。支持的浏览器：
- Chrome 86+
- Edge 86+
- Opera 72+

Firefox 和 Safari 目前不支持目录监控功能。

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/sanshanjianke/Claude-Code-LogViewer.git

# 进入项目目录
cd Claude-Code-LogViewer

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 许可证

MIT