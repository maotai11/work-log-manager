// 日曆服務 - 處理日期計算與事件聚合
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addDays,
  addWeeks,
  addMonths,
  isSameDay,
  parseISO,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { WorkRecord, TodoItem, PeriodicTask, CalendarEvent } from '../types';

// 取得月曆格子（含前後填充日期）
export function getCalendarDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { locale: zhTW });
  const calendarEnd = endOfWeek(monthEnd, { locale: zhTW });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

// 取得週視圖日期
export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { locale: zhTW });
  const weekEnd = endOfWeek(date, { locale: zhTW });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

// 格式化日期
export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: zhTW });
}

// 計算週期性任務的出現日期
export function calculatePeriodicDates(
  task: PeriodicTask,
  rangeStart: Date,
  rangeEnd: Date
): string[] {
  const dates: string[] = [];
  const startDate = parseISO(task.startDate);
  const endDate = task.endDate ? parseISO(task.endDate) : rangeEnd;
  
  let currentDate = startDate;

  // 確保不超過範圍
  const maxIterations = 1000;
  let iterations = 0;

  while (currentDate <= endDate && currentDate <= rangeEnd && iterations < maxIterations) {
    if (currentDate >= rangeStart) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
    }

    // 根據週期類型計算下一個日期
    switch (task.recurrenceType) {
      case 'daily':
        currentDate = addDays(currentDate, task.interval);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, task.interval);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, task.interval);
        break;
      case 'custom':
        currentDate = addDays(currentDate, task.interval);
        break;
      default:
        currentDate = addDays(currentDate, 1);
    }

    iterations++;
  }

  return dates;
}

// 將所有數據轉換為日曆事件
export function aggregateCalendarEvents(
  workRecords: WorkRecord[],
  todos: TodoItem[],
  periodicTasks: PeriodicTask[],
  rangeStart: Date,
  rangeEnd: Date
): Map<string, CalendarEvent[]> {
  const eventMap = new Map<string, CalendarEvent[]>();

  // 初始化日期映射
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  days.forEach((day) => {
    eventMap.set(format(day, 'yyyy-MM-dd'), []);
  });

  // 添加工作紀錄
  workRecords.forEach((record) => {
    const dateKey = record.date;
    if (eventMap.has(dateKey)) {
      eventMap.get(dateKey)!.push({
        id: `work-${record.id}`,
        type: 'work',
        title: record.title,
        date: record.date,
        sourceId: record.id,
      });
    }
  });

  // 添加待辦事項
  todos.forEach((todo) => {
    const dateKey = todo.dueDate;
    if (eventMap.has(dateKey)) {
      eventMap.get(dateKey)!.push({
        id: `todo-${todo.id}`,
        type: 'todo',
        title: todo.title,
        date: todo.dueDate,
        priority: todo.priority,
        completed: todo.completed,
        sourceId: todo.id,
      });
    }
  });

  // 添加週期性任務
  periodicTasks.forEach((task) => {
    const dates = calculatePeriodicDates(task, rangeStart, rangeEnd);
    dates.forEach((date) => {
      if (eventMap.has(date)) {
        const isCompleted = task.completedDates.includes(date);
        eventMap.get(date)!.push({
          id: `periodic-${task.id}-${date}`,
          type: 'periodic',
          title: task.title,
          date,
          completed: isCompleted,
          sourceId: task.id,
        });
      }
    });
  });

  return eventMap;
}

// 檢查某日期是否在範圍內
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, { start, end });
}

// 檢查兩個日期是否為同一天
export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
}

// 計算距離下次週期任務的天數
export function getDaysUntilNextOccurrence(task: PeriodicTask): number {
  const today = new Date();
  const dates = calculatePeriodicDates(task, today, addMonths(today, 3));
  
  if (dates.length === 0) return -1;
  
  const nextDate = parseISO(dates[0]);
  return differenceInDays(nextDate, today);
}

// 取得週數
export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil(diff / oneWeek);
}

// 取得月份中文名稱
export function getMonthName(date: Date): string {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return months[date.getMonth()];
}

// 取得星期中文名稱
export function getWeekdayName(date: Date): string {
  const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return weekdays[date.getDay()];
}
