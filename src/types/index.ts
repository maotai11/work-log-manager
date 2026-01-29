// 核心類型定義

export interface WorkRecord {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  date: string; // YYYY-MM-DD format
}

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string; // YYYY-MM-DD format
  completed: boolean;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface PeriodicTask {
  id: string;
  title: string;
  description: string;
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // every N days/weeks/months
  startDate: string;
  endDate?: string;
  lastCompletedDate?: string;
  completedDates: string[]; // Array of completion dates
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  type: 'work' | 'todo' | 'periodic';
  title: string;
  date: string;
  priority?: 'high' | 'medium' | 'low';
  completed?: boolean;
  sourceId: string;
}

export interface AppState {
  workRecords: WorkRecord[];
  todos: TodoItem[];
  todoTemplates: TodoTemplate[];
  periodicTasks: PeriodicTask[];
  activeView: 'calendar' | 'work' | 'todo' | 'periodic';
  selectedDate: string;
  searchQuery: string;
}

export interface BackupData {
  version: string;
  timestamp: string;
  workRecords: WorkRecord[];
  todos: TodoItem[];
  todoTemplates: TodoTemplate[];
  periodicTasks: PeriodicTask[];
}
