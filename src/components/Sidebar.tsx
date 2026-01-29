// 側邊欄組件
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { ViewType } from '../hooks/useAppState';
import { cn } from '../utils/cn';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedDate: Date;
  isSaving: boolean;
  lastSaved: Date | null;
  onExport: () => void;
  onBackup: () => void;
  onImport: (file: File) => void;
  stats: {
    workRecords: number;
    todos: number;
    todosCompleted: number;
    periodicTasks: number;
  };
}

const navItems = [
  { id: 'calendar' as const, icon: '📅', label: '月曆總覽' },
  { id: 'work' as const, icon: '📋', label: '工作紀錄' },
  { id: 'todo' as const, icon: '✅', label: '待辦事項' },
  { id: 'periodic' as const, icon: '🔄', label: '週期任務' },
];

export function Sidebar({
  activeView,
  onViewChange,
  selectedDate,
  isSaving,
  lastSaved,
  onExport,
  onBackup,
  onImport,
  stats,
}: SidebarProps) {
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          生產力助手
        </h1>
        <p className="text-sm text-slate-400 mt-1">離線版 v1.0</p>
      </div>

      {/* 日期顯示 */}
      <div className="px-6 py-4 bg-slate-800/50">
        <div className="text-sm text-slate-400">已選日期</div>
        <div className="text-lg font-semibold text-white">
          {format(selectedDate, 'yyyy年MM月dd日', { locale: zhTW })}
        </div>
        <div className="text-sm text-slate-400">
          {format(selectedDate, 'EEEE', { locale: zhTW })}
        </div>
      </div>

      {/* 導航選單 */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
              activeView === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 統計數據 */}
      <div className="px-4 py-4 border-t border-slate-700">
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">數據統計</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-700/50 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-400">{stats.workRecords}</div>
            <div className="text-xs text-slate-400">工作紀錄</div>
          </div>
          <div className="p-2 bg-slate-700/50 rounded-lg text-center">
            <div className="text-lg font-bold text-emerald-400">{stats.todos}</div>
            <div className="text-xs text-slate-400">待辦事項</div>
          </div>
          <div className="p-2 bg-slate-700/50 rounded-lg text-center">
            <div className="text-lg font-bold text-amber-400">{stats.todosCompleted}</div>
            <div className="text-xs text-slate-400">已完成</div>
          </div>
          <div className="p-2 bg-slate-700/50 rounded-lg text-center">
            <div className="text-lg font-bold text-purple-400">{stats.periodicTasks}</div>
            <div className="text-xs text-slate-400">週期任務</div>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="px-4 py-4 border-t border-slate-700 space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">數據管理</h3>
        
        <button
          onClick={onExport}
          className="w-full flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          匯出 Excel
        </button>

        <button
          onClick={onBackup}
          className="w-full flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          備份數據
        </button>

        <label className="w-full flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          匯入備份
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
        </label>
      </div>

      {/* 儲存狀態 */}
      <div className="px-4 py-3 bg-slate-800/80 border-t border-slate-700">
        <div className="flex items-center gap-2 text-sm">
          {isSaving ? (
            <>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-amber-400">儲存中...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-slate-400">
                {lastSaved
                  ? `已儲存 ${format(lastSaved, 'HH:mm')}`
                  : '自動儲存已啟用'}
              </span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
