// 工作紀錄面板
import { useState, useMemo } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { WorkRecord } from '../types';
import { cn } from '../utils/cn';

interface WorkRecordPanelProps {
  records: WorkRecord[];
  selectedDate: Date;
  onAdd: (data: Omit<WorkRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (record: WorkRecord) => void;
  onDelete: (id: string) => void;
  onDateSelect: (date: Date) => void;
}

type ViewMode = 'week' | 'day' | 'list';

export function WorkRecordPanel({
  records,
  selectedDate,
  onAdd,
  onUpdate,
  onDelete,
  onDateSelect,
}: WorkRecordPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    date: format(selectedDate, 'yyyy-MM-dd'),
  });

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { locale: zhTW });
    const end = endOfWeek(selectedDate, { locale: zhTW });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const filteredRecords = useMemo(() => {
    if (viewMode === 'day') {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      return records.filter((r) => r.date === dateStr);
    }
    if (viewMode === 'week') {
      const weekStart = format(weekDays[0], 'yyyy-MM-dd');
      const weekEnd = format(weekDays[6], 'yyyy-MM-dd');
      return records.filter((r) => r.date >= weekStart && r.date <= weekEnd);
    }
    return records.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, viewMode, selectedDate, weekDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onAdd({
      title: formData.title,
      content: formData.content,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      date: formData.date,
    });

    setFormData({ title: '', content: '', tags: '', date: format(selectedDate, 'yyyy-MM-dd') });
    setShowAddForm(false);
  };

  const handleUpdate = (record: WorkRecord) => {
    onUpdate(record);
    setIsEditing(null);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 標題列 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📋</span> 工作紀錄
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/20 rounded-lg p-1">
            {(['week', 'day', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  viewMode === mode
                    ? 'bg-white text-blue-600 font-medium'
                    : 'text-white/80 hover:text-white'
                )}
              >
                {mode === 'week' ? '週視圖' : mode === 'day' ? '日視圖' : '列表'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="ml-2 px-4 py-1.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            + 新增
          </button>
        </div>
      </div>

      {/* 週視圖日期選擇 */}
      {viewMode === 'week' && (
        <div className="flex border-b border-gray-100">
          {weekDays.map((day) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const dayRecords = records.filter((r) => r.date === format(day, 'yyyy-MM-dd'));
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={cn(
                  'flex-1 py-3 text-center transition-colors border-b-2',
                  isSelected
                    ? 'bg-blue-50 border-blue-500'
                    : 'border-transparent hover:bg-gray-50'
                )}
              >
                <div className="text-xs text-gray-500">
                  {format(day, 'EEE', { locale: zhTW })}
                </div>
                <div className={cn('text-lg font-semibold', isSelected ? 'text-blue-600' : 'text-gray-700')}>
                  {format(day, 'd')}
                </div>
                {dayRecords.length > 0 && (
                  <div className="mt-1 flex justify-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-500 text-white rounded-full">
                      {dayRecords.length}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 新增表單 */}
      {showAddForm && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="標題"
                value={formData.title}
                onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              placeholder="內容"
              value={formData.content}
              onChange={(e) => setFormData((f) => ({ ...f, content: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <input
              type="text"
              placeholder="標籤（用逗號分隔）"
              value={formData.tags}
              onChange={(e) => setFormData((f) => ({ ...f, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                儲存
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 紀錄列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>尚無工作紀錄</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-blue-500 hover:underline"
            >
              新增第一筆
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              isEditing={isEditing === record.id}
              onEdit={() => setIsEditing(record.id)}
              onSave={handleUpdate}
              onCancel={() => setIsEditing(null)}
              onDelete={() => onDelete(record.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// 紀錄卡片組件
interface RecordCardProps {
  record: WorkRecord;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (record: WorkRecord) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function RecordCard({ record, isEditing, onEdit, onSave, onCancel, onDelete }: RecordCardProps) {
  const [editData, setEditData] = useState(record);

  if (isEditing) {
    return (
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
          className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg"
        />
        <textarea
          value={editData.content}
          onChange={(e) => setEditData((d) => ({ ...d, content: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg resize-none"
        />
        <input
          type="text"
          value={editData.tags.join(', ')}
          onChange={(e) =>
            setEditData((d) => ({
              ...d,
              tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
            }))
          }
          className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg"
          placeholder="標籤"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">
            取消
          </button>
          <button
            onClick={() => onSave(editData)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            儲存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-400">
              {format(parseISO(record.date), 'MM/dd EEE', { locale: zhTW })}
            </span>
            {record.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-semibold text-gray-800">{record.title}</h3>
          {record.content && (
            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{record.content}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            更新於 {format(parseISO(record.updatedAt), 'MM/dd HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
