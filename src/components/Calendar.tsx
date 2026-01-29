// 月曆核心組件
import { format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { getCalendarDays, formatDate } from '../services/calendarService';
import type { CalendarEvent } from '../types';
import { cn } from '../utils/cn';

interface CalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  events: Map<string, CalendarEvent[]>;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function Calendar({
  currentMonth,
  selectedDate,
  events,
  onMonthChange,
  onDateSelect,
  onEventClick,
}: CalendarProps) {
  const days = getCalendarDays(currentMonth);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();

  const getEventColor = (event: CalendarEvent): string => {
    if (event.type === 'work') return 'bg-blue-500';
    if (event.type === 'todo') {
      if (event.completed) return 'bg-gray-400';
      if (event.priority === 'high') return 'bg-red-500';
      if (event.priority === 'medium') return 'bg-amber-500';
      return 'bg-green-500';
    }
    if (event.type === 'periodic') {
      return event.completed ? 'bg-purple-300' : 'bg-purple-500';
    }
    return 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 月份導航 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">
            {format(currentMonth, 'yyyy年 MMMM', { locale: zhTW })}
          </h2>
          <button
            onClick={() => onMonthChange(new Date())}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            回到今天
          </button>
        </div>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {weekdays.map((day, index) => (
          <div
            key={day}
            className={cn(
              'py-3 text-center text-sm font-semibold',
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dateKey = formatDate(day);
          const dayEvents = events.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={index}
              onClick={() => onDateSelect(day)}
              className={cn(
                'min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer transition-colors',
                !isCurrentMonth && 'bg-gray-50/50',
                isSelected && 'bg-indigo-50 ring-2 ring-inset ring-indigo-500',
                !isSelected && 'hover:bg-gray-50'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full transition-colors',
                    isToday && 'bg-indigo-500 text-white font-bold',
                    !isToday && !isCurrentMonth && 'text-gray-300',
                    !isToday && isCurrentMonth && isWeekend && (day.getDay() === 0 ? 'text-red-500' : 'text-blue-500'),
                    !isToday && isCurrentMonth && !isWeekend && 'text-gray-700'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 3 && (
                  <span className="text-xs text-gray-400">+{dayEvents.length - 3}</span>
                )}
              </div>

              {/* 事件列表 */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={cn(
                      'px-1.5 py-0.5 text-xs text-white rounded truncate cursor-pointer hover:opacity-80 transition-opacity',
                      getEventColor(event),
                      event.completed && 'line-through opacity-60'
                    )}
                    title={event.title}
                  >
                    {event.type === 'work' && '📋 '}
                    {event.type === 'todo' && '✅ '}
                    {event.type === 'periodic' && '🔄 '}
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 圖例 */}
      <div className="flex items-center justify-center gap-6 px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-xs text-gray-600">工作紀錄</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-xs text-gray-600">高優先待辦</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-xs text-gray-600">中優先待辦</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-xs text-gray-600">低優先待辦</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-purple-500 rounded-full" />
          <span className="text-xs text-gray-600">週期任務</span>
        </div>
      </div>
    </div>
  );
}
