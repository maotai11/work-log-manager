# 📅 Work Log Manager

一個功能完整的工作日誌與待辦事項管理系統，幫助你高效追蹤工作進度、管理任務和週期性工作。

## ✨ 核心功能

### 📊 工作日誌管理
- **日誌記錄** - 記錄每日工作內容、時間和狀態
- **統計分析** - 自動計算工作時數和完成度
- **匯出報表** - 支援 Excel、PDF、圖片格式匯出

### ✅ 待辦事項
- **智能分類** - 支援標籤、優先級、截止日期
- **模板功能** - 快速建立重複性任務
- **狀態追蹤** - 待處理、進行中、已完成狀態管理

### 🔄 週期性任務
- **自動提醒** - 設定每日、每週、每月重複任務
- **靈活配置** - 自訂執行頻率和時間
- **完成記錄** - 追蹤歷史執行狀態

### 📆 日曆檢視
- **月曆視圖** - 直覺的日期選擇介面
- **工作負載視覺化** - 顏色標示工作量
- **快速導覽** - 點擊日期查看詳細內容

## 🛠 技術架構

### 前端技術棧
- **React 19.2** - 現代化 UI 框架
- **TypeScript 5.9** - 型別安全開發
- **Tailwind CSS 4.1** - 原子化 CSS 框架
- **Vite 7.2** - 極速開發建構工具

### 核心套件
- **IndexedDB (idb)** - 本地資料持久化
- **date-fns** - 日期處理工具
- **DOMPurify** - XSS 防護
- **html2canvas** - 畫面截圖
- **xlsx** - Excel 匯出功能
- **uuid** - 唯一識別碼生成

### 資料安全
- **本地儲存** - 所有資料存在瀏覽器 IndexedDB
- **XSS 防護** - DOMPurify 過濾惡意腳本
- **資料驗證** - 完整的輸入驗證機制

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```
開啟瀏覽器訪問 `http://localhost:5173`

### 生產建構
```bash
npm run build
```

### 預覽建構結果
```bash
npm run preview
```

## 📁 專案結構

```
work-log-manager/
├── src/
│   ├── components/          # React 元件
│   │   ├── Calendar.tsx           # 日曆檢視
│   │   ├── WorkRecordPanel.tsx    # 工作日誌面板
│   │   ├── TodoPanel.tsx          # 待辦事項面板
│   │   ├── PeriodicTaskPanel.tsx  # 週期任務面板
│   │   ├── Sidebar.tsx            # 側邊欄導覽
│   │   └── DayDetailModal.tsx     # 日期詳情彈窗
│   ├── services/            # 業務邏輯層
│   │   ├── storageService.ts      # IndexedDB 儲存
│   │   ├── calendarService.ts     # 日曆邏輯
│   │   ├── exportService.ts       # 匯出功能
│   │   └── securityService.ts     # 安全驗證
│   ├── hooks/               # React Hooks
│   │   └── useAppState.ts         # 全域狀態管理
│   ├── types/               # TypeScript 型別定義
│   │   └── index.ts
│   ├── utils/               # 工具函式
│   │   └── cn.ts                  # className 工具
│   ├── App.tsx              # 主應用元件
│   ├── main.tsx             # 應用入口
│   └── index.css            # 全域樣式
├── docs/                    # 專案文件
│   ├── ARCHITECTURE.md            # 架構設計文件
│   └── UI-DESIGN.md              # UI 設計規範
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 設計特色

### 響應式設計
- 支援桌面、平板、手機多種裝置
- 自適應佈局，流暢的使用體驗

### 深色模式
- 自動偵測系統主題
- 眼睛友善的配色方案

### 無障礙設計
- 鍵盤導覽支援
- 語意化 HTML 結構
- ARIA 標籤完整

## 📖 使用指南

### 新增工作日誌
1. 點擊左側「工作日誌」面板
2. 填寫工作內容、開始/結束時間
3. 選擇狀態（進行中/已完成/待處理）
4. 儲存後自動更新日曆

### 建立待辦事項
1. 切換到「待辦事項」面板
2. 輸入任務標題和描述
3. 設定優先級和截止日期
4. 支援從模板快速建立

### 設定週期任務
1. 進入「週期任務」面板
2. 定義任務名稱和頻率
3. 系統自動在指定時間提醒
4. 完成後記錄執行歷史

### 匯出報表
1. 選擇要匯出的日期範圍
2. 點擊「匯出」按鈕
3. 選擇格式：Excel / PDF / PNG
4. 自動下載檔案

## 🔒 隱私與安全

- **離線優先** - 無需伺服器，資料完全本地存儲
- **無追蹤** - 不收集任何使用者資料
- **資料控制** - 隨時匯出或清除資料

## 🤝 貢獻指南

歡迎提交 Issue 或 Pull Request！

## 📄 授權

MIT License

---

**建議最低需求：**
- Node.js 18+
- 現代瀏覽器（Chrome 90+, Firefox 88+, Safari 14+）
- 支援 IndexedDB 的環境

**開發建議：**
- 使用 VS Code + TypeScript 插件
- 開啟 ESLint 和 Prettier
- 建議使用 pnpm 作為套件管理器

**問題回報：**
發現 Bug 或有功能建議？歡迎到 [Issues](https://github.com/maotai11/work-log-manager/issues) 回報！
