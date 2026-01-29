// 應用狀態管理 Hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { WorkRecord, TodoItem, TodoTemplate, PeriodicTask, CalendarEvent } from '../types';
import * as storage from '../services/storageService';
import { sanitizeInput } from '../services/securityService';
import { aggregateCalendarEvents } from '../services/calendarService';
import { startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

export type ViewType = 'calendar' | 'work' | 'todo' | 'periodic';

export function useAppState() {
  // 核心數據狀態
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todoTemplates, setTodoTemplates] = useState<TodoTemplate[]>([]);
  const [periodicTasks, setPeriodicTasks] = useState<PeriodicTask[]>([]);
  
  // UI 狀態
  const [activeView, setActiveView] = useState<ViewType>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 初始化數據
  useEffect(() => {
    const loadData = async () => {
      try {
        await storage.initDB();
        const [records, todoItems, templates, periodic] = await Promise.all([
          storage.getAllWorkRecords(),
          storage.getAllTodos(),
          storage.getAllTodoTemplates(),
          storage.getAllPeriodicTasks(),
        ]);
        setWorkRecords(records);
        setTodos(todoItems);
        setTodoTemplates(templates);
        setPeriodicTasks(periodic);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 自動備份（每30分鐘）
  useEffect(() => {
    const interval = setInterval(async () => {
      if (workRecords.length > 0 || todos.length > 0 || periodicTasks.length > 0) {
        await storage.createBackup();
        setLastSaved(new Date());
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [workRecords, todos, periodicTasks]);

  // 日曆事件
  const calendarEvents = useMemo((): Map<string, CalendarEvent[]> => {
    const start = startOfMonth(subMonths(currentMonth, 1));
    const end = endOfMonth(addMonths(currentMonth, 1));
    return aggregateCalendarEvents(workRecords, todos, periodicTasks, start, end);
  }, [workRecords, todos, periodicTasks, currentMonth]);

  // 搜尋過濾
  const filteredWorkRecords = useMemo(() => {
    if (!searchQuery) return workRecords;
    const query = searchQuery.toLowerCase();
    return workRecords.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.content.toLowerCase().includes(query) ||
        r.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [workRecords, searchQuery]);

  const filteredTodos = useMemo(() => {
    if (!searchQuery) return todos;
    const query = searchQuery.toLowerCase();
    return todos.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  }, [todos, searchQuery]);

  // === 工作紀錄操作 ===
  const addWorkRecord = useCallback(async (
    data: Omit<WorkRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setIsSaving(true);
    const now = new Date().toISOString();
    const record: WorkRecord = {
      ...data,
      id: uuidv4(),
      title: sanitizeInput(data.title),
      content: sanitizeInput(data.content),
      tags: data.tags.map(sanitizeInput),
      createdAt: now,
      updatedAt: now,
    };
    await storage.addWorkRecord(record);
    setWorkRecords((prev) => [...prev, record]);
    setIsSaving(false);
    setLastSaved(new Date());
    return record;
  }, []);

  const updateWorkRecord = useCallback(async (record: WorkRecord) => {
    setIsSaving(true);
    const updated = {
      ...record,
      title: sanitizeInput(record.title),
      content: sanitizeInput(record.content),
      tags: record.tags.map(sanitizeInput),
      updatedAt: new Date().toISOString(),
    };
    await storage.updateWorkRecord(updated);
    setWorkRecords((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    setIsSaving(false);
    setLastSaved(new Date());
  }, []);

  const deleteWorkRecord = useCallback(async (id: string) => {
    await storage.deleteWorkRecord(id);
    setWorkRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // === 待辦事項操作 ===
  const addTodo = useCallback(async (
    data: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setIsSaving(true);
    const now = new Date().toISOString();
    const todo: TodoItem = {
      ...data,
      id: uuidv4(),
      title: sanitizeInput(data.title),
      description: sanitizeInput(data.description),
      createdAt: now,
      updatedAt: now,
    };
    await storage.addTodo(todo);
    setTodos((prev) => [...prev, todo]);
    setIsSaving(false);
    setLastSaved(new Date());
    return todo;
  }, []);

  const updateTodo = useCallback(async (todo: TodoItem) => {
    setIsSaving(true);
    const updated = {
      ...todo,
      title: sanitizeInput(todo.title),
      description: sanitizeInput(todo.description),
      updatedAt: new Date().toISOString(),
    };
    await storage.updateTodo(updated);
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setIsSaving(false);
    setLastSaved(new Date());
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    await storage.deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      await updateTodo({ ...todo, completed: !todo.completed });
    }
  }, [todos, updateTodo]);

  // === 待辦模板操作 ===
  const addTodoTemplate = useCallback(async (
    data: Omit<TodoTemplate, 'id' | 'createdAt'>
  ) => {
    const template: TodoTemplate = {
      ...data,
      id: uuidv4(),
      name: sanitizeInput(data.name),
      title: sanitizeInput(data.title),
      description: sanitizeInput(data.description),
      createdAt: new Date().toISOString(),
    };
    await storage.addTodoTemplate(template);
    setTodoTemplates((prev) => [...prev, template]);
    return template;
  }, []);

  const deleteTodoTemplate = useCallback(async (id: string) => {
    await storage.deleteTodoTemplate(id);
    setTodoTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const createTodoFromTemplate = useCallback(async (
    templateId: string,
    dueDate: string
  ) => {
    const template = todoTemplates.find((t) => t.id === templateId);
    if (template) {
      return addTodo({
        title: template.title,
        description: template.description,
        priority: template.priority,
        dueDate,
        completed: false,
        templateId,
      });
    }
  }, [todoTemplates, addTodo]);

  // === 週期任務操作 ===
  const addPeriodicTask = useCallback(async (
    data: Omit<PeriodicTask, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>
  ) => {
    setIsSaving(true);
    const now = new Date().toISOString();
    const task: PeriodicTask = {
      ...data,
      id: uuidv4(),
      title: sanitizeInput(data.title),
      description: sanitizeInput(data.description),
      completedDates: [],
      createdAt: now,
      updatedAt: now,
    };
    await storage.addPeriodicTask(task);
    setPeriodicTasks((prev) => [...prev, task]);
    setIsSaving(false);
    setLastSaved(new Date());
    return task;
  }, []);

  const updatePeriodicTask = useCallback(async (task: PeriodicTask) => {
    setIsSaving(true);
    const updated = {
      ...task,
      title: sanitizeInput(task.title),
      description: sanitizeInput(task.description),
      updatedAt: new Date().toISOString(),
    };
    await storage.updatePeriodicTask(updated);
    setPeriodicTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    setIsSaving(false);
    setLastSaved(new Date());
  }, []);

  const deletePeriodicTask = useCallback(async (id: string) => {
    await storage.deletePeriodicTask(id);
    setPeriodicTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const togglePeriodicTaskCompletion = useCallback(async (
    taskId: string,
    date: string
  ) => {
    const task = periodicTasks.find((t) => t.id === taskId);
    if (task) {
      const completedDates = task.completedDates.includes(date)
        ? task.completedDates.filter((d) => d !== date)
        : [...task.completedDates, date];
      await updatePeriodicTask({
        ...task,
        completedDates,
        lastCompletedDate: completedDates.length > 0 
          ? completedDates.sort().reverse()[0] 
          : undefined,
      });
    }
  }, [periodicTasks, updatePeriodicTask]);

  // === 備份操作 ===
  const createBackup = useCallback(async () => {
    const backup = await storage.createBackup();
    storage.downloadBackup(backup);
    return backup;
  }, []);

  const importBackup = useCallback(async (file: File) => {
    const backup = await storage.importBackup(file);
    await storage.restoreFromBackup(backup);
    setWorkRecords(backup.workRecords);
    setTodos(backup.todos);
    setTodoTemplates(backup.todoTemplates);
    setPeriodicTasks(backup.periodicTasks);
  }, []);

  return {
    // 數據
    workRecords: filteredWorkRecords,
    allWorkRecords: workRecords,
    todos: filteredTodos,
    allTodos: todos,
    todoTemplates,
    periodicTasks,
    calendarEvents,
    
    // UI 狀態
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
    
    // 工作紀錄操作
    addWorkRecord,
    updateWorkRecord,
    deleteWorkRecord,
    
    // 待辦操作
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    
    // 模板操作
    addTodoTemplate,
    deleteTodoTemplate,
    createTodoFromTemplate,
    
    // 週期任務操作
    addPeriodicTask,
    updatePeriodicTask,
    deletePeriodicTask,
    togglePeriodicTaskCompletion,
    
    // 備份操作
    createBackup,
    importBackup,
  };
}
