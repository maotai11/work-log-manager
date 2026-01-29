# 架構設計文件

## 系統架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                         使用者介面層                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐  │
│  │ Sidebar │ │Calendar │ │WorkPanel│ │TodoPanel│ │PeriodicPanel│
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └─────┬─────┘  │
│       │           │           │           │             │        │
│       └───────────┴───────────┴───────────┴─────────────┘        │
│                               │                                   │
│                        ┌──────┴──────┐                           │
│                        │   App.tsx   │                           │
│                        └──────┬──────┘                           │
└───────────────────────────────┼─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                         狀態管理層                                │
│                        ┌──────┴──────┐                           │
│                        │useAppState  │                           │
│                        │   (Hook)    │                           │
│                        └──────┬──────┘                           │
│                               │                                   │
│   ┌───────────────────────────┼───────────────────────────┐      │
│   │                           │                           │      │
│   ▼                           ▼                           ▼      │
│ workRecords[]             todos[]                 periodicTasks[]│
│ todoTemplates[]           calendarEvents          UI States      │
└───────────────────────────────┼─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                          服務層                                   │
│                               │                                   │
│   ┌───────────────┬───────────┼───────────┬───────────────┐      │
│   │               │           │           │               │      │
│   ▼               ▼           ▼           ▼               ▼      │
│ Storage       Calendar    Security     Export        Validation │
│ Service       Service     Service      Service       Service    │
│   │                           │           │                      │
│   │                           │           │                      │
└───┼───────────────────────────┼───────────┼─────────────────────┘
    │                           │           │
    ▼                           ▼           ▼
┌─────────┐               ┌─────────┐  ┌─────────┐
│IndexedDB│               │DOMPurify│  │xlsx/    │
│  (idb)  │               │         │  │html2canvas│
└─────────┘               └─────────┘  └─────────┘
```

## 數據流圖

```
使用者操作
    │
    ▼
┌─────────────────────────────────────────────────┐
│                 React 組件                        │
│  (Calendar / WorkPanel / TodoPanel / Periodic)   │
└─────────────────────┬───────────────────────────┘
                      │ 呼叫 action
                      ▼
┌─────────────────────────────────────────────────┐
│              useAppState Hook                    │
│  ┌─────────────────────────────────────────┐    │
│  │ addWorkRecord / updateTodo / etc.       │    │
│  └─────────────────────────────────────────┘    │
│                      │                           │
│       ┌──────────────┼──────────────┐           │
│       ▼              ▼              ▼           │
│  sanitizeInput   setState    storageService     │
│  (XSS防護)       (更新狀態)   (持久化)           │
└─────────────────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    React 重新渲染           IndexedDB 寫入
          │                       │
          ▼                       ▼
     UI 更新完成             數據持久化完成
```

## 組件關係圖

```
App (根組件)
│
├── Sidebar
│   ├── 導航選單
│   ├── 統計數據
│   └── 數據操作按鈕
│
├── Header
│   ├── 搜尋框
│   └── 今日按鈕
│
├── Calendar (月曆視圖)
│   ├── MonthNavigation
│   ├── WeekdayHeaders
│   ├── DayGrid
│   │   └── DayCell
│   │       └── EventDot
│   └── Legend
│
├── WorkRecordPanel
│   ├── ViewModeToggle
│   ├── WeekSelector
│   ├── AddForm
│   └── RecordList
│       └── RecordCard
│
├── TodoPanel
│   ├── StatsBar
│   ├── FilterBar
│   ├── TemplatePanel
│   ├── AddForm
│   └── TodoList
│       └── TodoCard
│
├── PeriodicTaskPanel
│   ├── TodayTasks
│   ├── AddForm
│   └── TaskList
│       └── TaskCard
│
└── DayDetailModal
    ├── WorkRecordSection
    ├── TodoSection
    └── PeriodicTaskSection
```

## IndexedDB Schema

```
Database: productivity-app-db
Version: 1

ObjectStores:
├── workRecords
│   ├── keyPath: id
│   └── indexes:
│       ├── by-date: date
│       └── by-updated: updatedAt
│
├── todos
│   ├── keyPath: id
│   └── indexes:
│       ├── by-dueDate: dueDate
│       └── by-priority: priority
│
├── todoTemplates
│   └── keyPath: id
│
├── periodicTasks
│   ├── keyPath: id
│   └── indexes:
│       └── by-startDate: startDate
│
└── backups
    └── keyPath: timestamp
```

## 安全機制

### XSS 防護流程
```
使用者輸入
    │
    ▼
┌─────────────────┐
│ sanitizeInput() │ ◄── DOMPurify
└────────┬────────┘
         │
         ▼
    淨化後的文字
         │
    ┌────┴────┐
    ▼         ▼
  儲存      顯示
```

### DevTools 偵測
```
┌─────────────────────────────────────┐
│        偵測機制                      │
│                                     │
│  1. 視窗大小變化監測                  │
│     (outerWidth - innerWidth > 160) │
│                                     │
│  2. Console 存取監測                 │
│     (自訂物件 getter)                │
│                                     │
│  3. 快捷鍵攔截                       │
│     (F12, Ctrl+Shift+I/J/C)         │
│                                     │
└─────────────────┬───────────────────┘
                  │
                  ▼ 觸發時
┌─────────────────────────────────────┐
│  1. 顯示警告橫幅                     │
│  2. Console 輸出警告訊息              │
│  3. 清除 Console                     │
└─────────────────────────────────────┘
```

## 效能優化策略

### 虛擬化 (大量數據)
- 使用 `useMemo` 進行計算結果快取
- 日曆只渲染可見月份 ±1 月的事件
- 列表採用分頁/無限滾動

### 狀態更新優化
- `useCallback` 包裝事件處理器
- 避免不必要的重新渲染
- 批次更新 IndexedDB

### 備份策略
```
自動備份間隔: 30 分鐘
保留備份數量: 5 份
備份內容: 完整數據快照
備份格式: JSON
```

## 匯出功能流程

### Excel 匯出
```
選擇匯出範圍
    │
    ▼
┌────────────────┐
│ 收集數據       │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ 格式化欄位     │
│ (中文標題等)   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ xlsx 生成      │
│ 工作簿         │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ 觸發下載       │
└────────────────┘
```

### PDF 匯出 (截圖模式)
```
選擇區域
    │
    ▼
┌────────────────┐
│ html2canvas    │
│ 截圖           │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Canvas → PNG   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ 觸發下載       │
└────────────────┘
```
