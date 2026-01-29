// 主應用入口
import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useAppState } from './hooks/useAppState';
import { initDevToolsDetection } from './services/securityService';
import { exportAllToExcel } from './services/exportService';
import { Calendar } from './components/Calendar';
import { WorkRecordPanel } from './components/WorkRecordPanel';
import { TodoPanel } from './components/TodoPanel';
import { PeriodicTaskPanel } from './components/PeriodicTaskPanel';
import { Sidebar } from './components/Sidebar';
import { DayDetailModal } from './components/DayDetailModal';
import type { CalendarEvent } from './types';

export function App() {
  const {
    workRecords,
    allWorkRecords,
    todos,
    allTodos,
    todoTemplates,
    periodicTasks,
    calendarEvents,
    activeView,
    setActiveView,
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSaving,
    lastSaved,
    addWorkRecord,
    updateWorkRecord,
    deleteWorkRecord,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    addTodoTemplate,
    deleteTodoTemplate,
    createTodoFromTemplate,
    addPeriodicTask,
    updatePeriodicTask,
    deletePeriodicTask,
    togglePeriodicTaskCompletion,
    createBackup,
    importBackup,
  } = useAppState();

  const [showDayDetail, setShowDayDetail] = useState(false);

  // 初始化安全檢測
  useEffect(() => {
    initDevToolsDetection();
  }, []);

  // 統計數據
  const stats = useMemo(() => ({
    workRecords: allWorkRecords.length,
    todos: allTodos.length,
    todosCompleted: allTodos.filter((t) => t.completed).length,
    periodicTasks: periodicTasks.length,
  }), [allWorkRecords, allTodos, periodicTasks]);

  // 匯出全部數據
  const handleExportAll = () => {
    const filename = `productivity-export-${format(new Date(), 'yyyyMMdd')}.xlsx`;
    exportAllToExcel(allWorkRecords, allTodos, periodicTasks, filename);
  };

  // 處理日曆事件點擊
  const handleEventClick = (event: CalendarEvent) => {
    const eventDate = new Date(event.date);
    setSelectedDate(eventDate);
    setShowDayDetail(true);
  };

  // 處理日期選擇
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (activeView === 'calendar') {
      setShowDayDetail(true);
    }
  };

  // 載入中畫面
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">載入數據中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* 側邊欄 */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        selectedDate={selectedDate}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onExport={handleExportAll}
        onBackup={createBackup}
        onImport={importBackup}
        stats={stats}
      />

      {/* 主內容區 */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* 頂部搜尋欄 */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              {activeView === 'calendar' && '📅 月曆總覽'}
              {activeView === 'work' && '📋 工作紀錄'}
              {activeView === 'todo' && '✅ 待辦事項'}
              {activeView === 'periodic' && '🔄 週期任務'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* 搜尋框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 今日按鈕 */}
            <button
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentMonth(today);
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
            >
              今天
            </button>
          </div>
        </header>

        {/* 內容區域 */}
        <div className="flex-1 p-6 overflow-auto">
          {activeView === 'calendar' && (
            <Calendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              events={calendarEvents}
              onMonthChange={setCurrentMonth}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          )}

          {activeView === 'work' && (
            <WorkRecordPanel
              records={workRecords}
              selectedDate={selectedDate}
              onAdd={addWorkRecord}
              onUpdate={updateWorkRecord}
              onDelete={deleteWorkRecord}
              onDateSelect={setSelectedDate}
            />
          )}

          {activeView === 'todo' && (
            <TodoPanel
              todos={todos}
              templates={todoTemplates}
              selectedDate={selectedDate}
              onAdd={addTodo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
              onToggle={toggleTodo}
              onAddTemplate={addTodoTemplate}
              onDeleteTemplate={deleteTodoTemplate}
              onCreateFromTemplate={createTodoFromTemplate}
            />
          )}

          {activeView === 'periodic' && (
            <PeriodicTaskPanel
              tasks={periodicTasks}
              selectedDate={selectedDate}
              onAdd={addPeriodicTask}
              onUpdate={updatePeriodicTask}
              onDelete={deletePeriodicTask}
              onToggleCompletion={togglePeriodicTaskCompletion}
            />
          )}
        </div>
      </main>

      {/* 日期詳情彈窗 */}
      {showDayDetail && (
        <DayDetailModal
          date={selectedDate}
          events={calendarEvents.get(format(selectedDate, 'yyyy-MM-dd')) || []}
          workRecords={allWorkRecords}
          todos={allTodos}
          periodicTasks={periodicTasks}
          onClose={() => setShowDayDetail(false)}
          onToggleTodo={toggleTodo}
          onTogglePeriodic={togglePeriodicTaskCompletion}
          onViewChange={(view) => {
            setActiveView(view);
            setShowDayDetail(false);
          }}
        />
      )}
    </div>
  );
}
