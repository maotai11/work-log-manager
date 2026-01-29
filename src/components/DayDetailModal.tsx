// 日期詳情彈窗
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { CalendarEvent, WorkRecord, TodoItem, PeriodicTask } from '../types';
import { cn } from '../utils/cn';

interface DayDetailModalProps {
  date: Date;
  events: CalendarEvent[];
  workRecords: WorkRecord[];
  todos: TodoItem[];
  periodicTasks: PeriodicTask[];
  onClose: () => void;
  onToggleTodo: (id: string) => void;
  onTogglePeriodic: (taskId: string, date: string) => void;
  onViewChange: (view: 'work' | 'todo' | 'periodic') => void;
}

export function DayDetailModal({
  date,
  events,
  workRecords,
  todos,
  periodicTasks,
  onClose,
  onToggleTodo,
  onTogglePeriodic,
  onViewChange,
}: DayDetailModalProps) {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  const dayWorkRecords = workRecords.filter((r) => r.date === dateStr);
  const dayTodos = todos.filter((t) => t.dueDate === dateStr);
  const dayPeriodicTasks = periodicTasks.filter((p) => {
    return events.some((e) => e.type === 'periodic' && e.sourceId === p.id && e.date === dateStr);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* 標題 */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div>
            <h2 className="text-xl font-bold text-white">
              {format(date, 'yyyy年MM月dd日', { locale: zhTW })}
            </h2>
            <p className="text-sm text-white/70">
              {format(date, 'EEEE', { locale: zhTW })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 內容 */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* 工作紀錄 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                工作紀錄 ({dayWorkRecords.length})
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onViewChange('work');
                }}
                className="text-sm text-blue-500 hover:underline"
              >
                查看全部 →
              </button>
            </div>
            {dayWorkRecords.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">此日無工作紀錄</p>
            ) : (
              <div className="space-y-2">
                {dayWorkRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <div className="font-medium text-gray-800">{record.title}</div>
                    {record.content && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{record.content}</p>
                    )}
                    {record.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {record.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 待辦事項 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                待辦事項 ({dayTodos.length})
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onViewChange('todo');
                }}
                className="text-sm text-emerald-500 hover:underline"
              >
                查看全部 →
              </button>
            </div>
            {dayTodos.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">此日無待辦事項</p>
            ) : (
              <div className="space-y-2">
                {dayTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={cn(
                      'p-3 rounded-lg border flex items-center gap-3',
                      todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-emerald-50 border-emerald-100'
                    )}
                  >
                    <button
                      onClick={() => onToggleTodo(todo.id)}
                      className={cn(
                        'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors',
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
                    <div className={cn('flex-1', todo.completed && 'line-through text-gray-400')}>
                      <div className="font-medium">{todo.title}</div>
                      {todo.description && (
                        <p className="text-sm text-gray-500">{todo.description}</p>
                      )}
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      todo.priority === 'high' ? 'bg-red-100 text-red-600' :
                      todo.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    )}>
                      {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 週期任務 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full" />
                週期任務 ({dayPeriodicTasks.length})
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onViewChange('periodic');
                }}
                className="text-sm text-purple-500 hover:underline"
              >
                查看全部 →
              </button>
            </div>
            {dayPeriodicTasks.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">此日無週期任務</p>
            ) : (
              <div className="space-y-2">
                {dayPeriodicTasks.map((task) => {
                  const isCompleted = task.completedDates.includes(dateStr);
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'p-3 rounded-lg border flex items-center gap-3',
                        isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-purple-50 border-purple-100'
                      )}
                    >
                      <button
                        onClick={() => onTogglePeriodic(task.id, dateStr)}
                        className={cn(
                          'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors',
                          isCompleted
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-gray-300 hover:border-purple-500'
                        )}
                      >
                        {isCompleted && (
                          <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className={cn('flex-1', isCompleted && 'line-through text-gray-400')}>
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <p className="text-sm text-gray-500">{task.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-purple-500">
                        🔄 {task.recurrenceType === 'daily' ? '每日' : 
                            task.recurrenceType === 'weekly' ? '每週' : 
                            task.recurrenceType === 'monthly' ? '每月' : '自訂'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* 底部操作 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
