// 待辦事項面板
import { useState, useMemo } from 'react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { TodoItem, TodoTemplate } from '../types';
import { cn } from '../utils/cn';

interface TodoPanelProps {
  todos: TodoItem[];
  templates: TodoTemplate[];
  selectedDate: Date;
  onAdd: (data: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAddTemplate: (data: Omit<TodoTemplate, 'id' | 'createdAt'>) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateFromTemplate: (templateId: string, dueDate: string) => void;
}

type FilterType = 'all' | 'active' | 'completed' | 'overdue';
type SortType = 'dueDate' | 'priority' | 'createdAt';

const priorityOrder = { high: 0, medium: 1, low: 2 };
const priorityLabels = { high: '高', medium: '中', low: '低' };
const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export function TodoPanel({
  todos,
  templates,
  selectedDate,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
  onAddTemplate,
  onDeleteTemplate,
  onCreateFromTemplate,
}: TodoPanelProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('dueDate');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: format(selectedDate, 'yyyy-MM-dd'),
  });

  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos];

    // 過濾
    switch (filter) {
      case 'active':
        result = result.filter((t) => !t.completed);
        break;
      case 'completed':
        result = result.filter((t) => t.completed);
        break;
      case 'overdue':
        result = result.filter((t) => !t.completed && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)));
        break;
    }

    // 排序
    result.sort((a, b) => {
      if (sort === 'priority') {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sort === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

    return result;
  }, [todos, filter, sort]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const overdue = todos.filter((t) => !t.completed && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))).length;
    return { total, completed, active: total - completed, overdue };
  }, [todos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onAdd({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate,
      completed: false,
    });

    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: format(selectedDate, 'yyyy-MM-dd'),
    });
    setShowAddForm(false);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 標題列 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>✅</span> 待辦事項
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplatePanel(!showTemplatePanel)}
            className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition-colors"
          >
            📑 模板
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-1.5 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
          >
            + 新增
          </button>
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-700">{stats.total}</div>
          <div className="text-xs text-gray-500">總計</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-600">{stats.active}</div>
          <div className="text-xs text-gray-500">進行中</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-400">{stats.completed}</div>
          <div className="text-xs text-gray-500">已完成</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-500">{stats.overdue}</div>
          <div className="text-xs text-gray-500">已過期</div>
        </div>
      </div>

      {/* 過濾與排序 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex gap-1">
          {(['all', 'active', 'completed', 'overdue'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1 text-sm rounded-full transition-colors',
                filter === f
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {f === 'all' ? '全部' : f === 'active' ? '進行中' : f === 'completed' ? '已完成' : '過期'}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
          className="text-sm text-gray-600 border border-gray-200 rounded-lg px-2 py-1"
        >
          <option value="dueDate">依截止日</option>
          <option value="priority">依優先級</option>
          <option value="createdAt">依建立時間</option>
        </select>
      </div>

      {/* 模板面板 */}
      {showTemplatePanel && (
        <TemplatePanel
          templates={templates}
          selectedDate={selectedDate}
          onClose={() => setShowTemplatePanel(false)}
          onAddTemplate={onAddTemplate}
          onDeleteTemplate={onDeleteTemplate}
          onCreateFromTemplate={onCreateFromTemplate}
        />
      )}

      {/* 新增表單 */}
      {showAddForm && (
        <div className="p-4 bg-emerald-50 border-b border-emerald-100">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="標題"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <textarea
              placeholder="描述（選填）"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <div className="flex gap-3">
              <select
                value={formData.priority}
                onChange={(e) => setFormData((f) => ({ ...f, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="high">🔴 高優先</option>
                <option value="medium">🟡 中優先</option>
                <option value="low">🟢 低優先</option>
              </select>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((f) => ({ ...f, dueDate: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
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
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                儲存
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 待辦列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredAndSortedTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>沒有待辦事項</p>
          </div>
        ) : (
          filteredAndSortedTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              isEditing={editingId === todo.id}
              onEdit={() => setEditingId(todo.id)}
              onSave={(updated) => {
                onUpdate(updated);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onDelete={() => onDelete(todo.id)}
              onToggle={() => onToggle(todo.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// 待辦卡片
interface TodoCardProps {
  todo: TodoItem;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (todo: TodoItem) => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function TodoCard({ todo, isEditing, onEdit, onSave, onCancel, onDelete, onToggle }: TodoCardProps) {
  const [editData, setEditData] = useState(todo);
  const isOverdue = !todo.completed && isPast(parseISO(todo.dueDate)) && !isToday(parseISO(todo.dueDate));
  const isDueToday = isToday(parseISO(todo.dueDate));

  if (isEditing) {
    return (
      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
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
        <div className="flex gap-2 mb-2">
          <select
            value={editData.priority}
            onChange={(e) => setEditData((d) => ({ ...d, priority: e.target.value as 'high' | 'medium' | 'low' }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <input
            type="date"
            value={editData.dueDate}
            onChange={(e) => setEditData((d) => ({ ...d, dueDate: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">
            取消
          </button>
          <button onClick={() => onSave(editData)} className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600">
            儲存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-3 rounded-xl border transition-all group',
        todo.completed
          ? 'bg-gray-50 border-gray-200'
          : isOverdue
          ? 'bg-red-50 border-red-200'
          : isDueToday
          ? 'bg-amber-50 border-amber-200'
          : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors',
            todo.completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-300 hover:border-emerald-500'
          )}
        >
          {todo.completed && (
            <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn('font-medium', todo.completed && 'line-through text-gray-400')}>
              {todo.title}
            </h3>
            <span className={cn('px-2 py-0.5 text-xs rounded-full border', priorityColors[todo.priority])}>
              {priorityLabels[todo.priority]}
            </span>
          </div>
          {todo.description && (
            <p className={cn('text-sm text-gray-600 mb-1', todo.completed && 'text-gray-400')}>
              {todo.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={cn(isOverdue && 'text-red-500 font-medium', isDueToday && 'text-amber-600 font-medium')}>
              📅 {format(parseISO(todo.dueDate), 'MM/dd EEE', { locale: zhTW })}
              {isOverdue && ' (已過期)'}
              {isDueToday && ' (今天)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded">
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
    </div>
  );
}

// 模板面板
interface TemplatePanelProps {
  templates: TodoTemplate[];
  selectedDate: Date;
  onClose: () => void;
  onAddTemplate: (data: Omit<TodoTemplate, 'id' | 'createdAt'>) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateFromTemplate: (templateId: string, dueDate: string) => void;
}

function TemplatePanel({
  templates,
  selectedDate,
  onClose,
  onAddTemplate,
  onDeleteTemplate,
  onCreateFromTemplate,
}: TemplatePanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim()) return;
    onAddTemplate(formData);
    setFormData({ name: '', title: '', description: '', priority: 'medium' });
    setShowAdd(false);
  };

  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">📑 快速模板</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-sm text-emerald-600 hover:underline"
          >
            + 新增模板
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAddTemplate} className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
          <input
            type="text"
            placeholder="模板名稱"
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="任務標題"
            value={formData.title}
            onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <select
              value={formData.priority}
              onChange={(e) => setFormData((f) => ({ ...f, priority: e.target.value as 'high' | 'medium' | 'low' }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="high">高優先</option>
              <option value="medium">中優先</option>
              <option value="low">低優先</option>
            </select>
            <button type="submit" className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm">
              儲存
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {templates.length === 0 ? (
          <p className="text-sm text-gray-400">尚無模板，點擊上方新增</p>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 group"
            >
              <button
                onClick={() => onCreateFromTemplate(template.id, format(selectedDate, 'yyyy-MM-dd'))}
                className="text-sm text-gray-700 hover:text-emerald-600"
              >
                {template.name}
              </button>
              <button
                onClick={() => onDeleteTemplate(template.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
