// 週期任務面板
import { useState, useMemo } from 'react';
import { format, parseISO, addDays, addWeeks, addMonths } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { PeriodicTask } from '../types';
import { cn } from '../utils/cn';

interface PeriodicTaskPanelProps {
  tasks: PeriodicTask[];
  selectedDate: Date;
  onAdd: (data: Omit<PeriodicTask, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => void;
  onUpdate: (task: PeriodicTask) => void;
  onDelete: (id: string) => void;
  onToggleCompletion: (taskId: string, date: string) => void;
}

const recurrenceLabels = {
  daily: '每日',
  weekly: '每週',
  monthly: '每月',
  custom: '自訂',
};

export function PeriodicTaskPanel({
  tasks,
  selectedDate,
  onAdd,
  onUpdate,
  onDelete,
  onToggleCompletion,
}: PeriodicTaskPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recurrenceType: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'custom',
    interval: 1,
    startDate: format(selectedDate, 'yyyy-MM-dd'),
    endDate: '',
  });

  // 計算今日與近期的週期任務
  const todayTasks = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return tasks.filter((task) => {
      const dates = getNextOccurrences(task, 1);
      return dates.includes(today);
    });
  }, [tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onAdd({
      title: formData.title,
      description: formData.description,
      recurrenceType: formData.recurrenceType,
      interval: formData.interval,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
    });

    setFormData({
      title: '',
      description: '',
      recurrenceType: 'weekly',
      interval: 1,
      startDate: format(selectedDate, 'yyyy-MM-dd'),
      endDate: '',
    });
    setShowAddForm(false);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 標題列 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🔄</span> 週期任務
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-1.5 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
        >
          + 新增
        </button>
      </div>

      {/* 今日任務快速視圖 */}
      {todayTasks.length > 0 && (
        <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
          <h3 className="text-sm font-semibold text-purple-700 mb-2">📌 今日週期任務</h3>
          <div className="flex flex-wrap gap-2">
            {todayTasks.map((task) => {
              const today = format(new Date(), 'yyyy-MM-dd');
              const isCompleted = task.completedDates.includes(today);
              return (
                <button
                  key={task.id}
                  onClick={() => onToggleCompletion(task.id, today)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors',
                    isCompleted
                      ? 'bg-purple-200 text-purple-600 line-through'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  )}
                >
                  {isCompleted ? '✓' : '○'} {task.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 新增表單 */}
      {showAddForm && (
        <div className="p-4 bg-purple-50 border-b border-purple-100">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="任務名稱（如：開發票、週報）"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <textarea
              placeholder="描述（選填）"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">週期類型</label>
                <select
                  value={formData.recurrenceType}
                  onChange={(e) => setFormData((f) => ({ ...f, recurrenceType: e.target.value as 'daily' | 'weekly' | 'monthly' | 'custom' }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="daily">每日</option>
                  <option value="weekly">每週</option>
                  <option value="monthly">每月</option>
                  <option value="custom">自訂間隔</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  間隔 ({formData.recurrenceType === 'daily' ? '天' : formData.recurrenceType === 'weekly' ? '週' : formData.recurrenceType === 'monthly' ? '月' : '天'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.interval}
                  onChange={(e) => setFormData((f) => ({ ...f, interval: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">開始日期</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">結束日期（選填）</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                儲存
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 任務列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p>尚無週期任務</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-purple-500 hover:underline"
            >
              建立第一個
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isEditing={editingId === task.id}
              onEdit={() => setEditingId(task.id)}
              onSave={(updated) => {
                onUpdate(updated);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onDelete={() => onDelete(task.id)}
              onToggleCompletion={onToggleCompletion}
            />
          ))
        )}
      </div>
    </div>
  );
}

// 計算下N次出現日期
function getNextOccurrences(task: PeriodicTask, count: number): string[] {
  const dates: string[] = [];
  let current = parseISO(task.startDate);
  const endDate = task.endDate ? parseISO(task.endDate) : addMonths(new Date(), 12);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (dates.length < count && current <= endDate) {
    if (current >= today || format(current, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      dates.push(format(current, 'yyyy-MM-dd'));
    }

    switch (task.recurrenceType) {
      case 'daily':
        current = addDays(current, task.interval);
        break;
      case 'weekly':
        current = addWeeks(current, task.interval);
        break;
      case 'monthly':
        current = addMonths(current, task.interval);
        break;
      case 'custom':
        current = addDays(current, task.interval);
        break;
    }
  }

  return dates;
}

// 任務卡片
interface TaskCardProps {
  task: PeriodicTask;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (task: PeriodicTask) => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggleCompletion: (taskId: string, date: string) => void;
}

function TaskCard({ task, isEditing, onEdit, onSave, onCancel, onDelete, onToggleCompletion }: TaskCardProps) {
  const [editData, setEditData] = useState(task);
  const nextDates = getNextOccurrences(task, 5);
  const completedCount = task.completedDates.length;

  if (isEditing) {
    return (
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
          className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg"
        />
        <textarea
          value={editData.description}
          onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg resize-none"
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select
            value={editData.recurrenceType}
            onChange={(e) => setEditData((d) => ({ ...d, recurrenceType: e.target.value as 'daily' | 'weekly' | 'monthly' | 'custom' }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="daily">每日</option>
            <option value="weekly">每週</option>
            <option value="monthly">每月</option>
            <option value="custom">自訂</option>
          </select>
          <input
            type="number"
            min="1"
            value={editData.interval}
            onChange={(e) => setEditData((d) => ({ ...d, interval: parseInt(e.target.value) || 1 }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">
            取消
          </button>
          <button onClick={() => onSave(editData)} className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">
            儲存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          🔄 {recurrenceLabels[task.recurrenceType]}
          {task.interval > 1 && ` × ${task.interval}`}
        </span>
        <span className="flex items-center gap-1">
          ✓ 已完成 {completedCount} 次
        </span>
      </div>

      {/* 近期日期快速標記 */}
      <div className="flex flex-wrap gap-2">
        {nextDates.map((date) => {
          const isCompleted = task.completedDates.includes(date);
          const isToday = date === format(new Date(), 'yyyy-MM-dd');
          return (
            <button
              key={date}
              onClick={() => onToggleCompletion(task.id, date)}
              className={cn(
                'px-2 py-1 text-xs rounded-md border transition-colors',
                isCompleted
                  ? 'bg-purple-100 border-purple-300 text-purple-600 line-through'
                  : isToday
                  ? 'bg-purple-500 border-purple-500 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300'
              )}
            >
              {format(parseISO(date), 'MM/dd', { locale: zhTW })}
              {isToday && ' (今)'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
