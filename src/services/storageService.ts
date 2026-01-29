// IndexedDB 儲存服務 - 處理所有數據的持久化
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { WorkRecord, TodoItem, TodoTemplate, PeriodicTask, BackupData } from '../types';

interface ProductivityDB extends DBSchema {
  workRecords: {
    key: string;
    value: WorkRecord;
    indexes: { 'by-date': string; 'by-updated': string };
  };
  todos: {
    key: string;
    value: TodoItem;
    indexes: { 'by-dueDate': string; 'by-priority': string };
  };
  todoTemplates: {
    key: string;
    value: TodoTemplate;
  };
  periodicTasks: {
    key: string;
    value: PeriodicTask;
    indexes: { 'by-startDate': string };
  };
  backups: {
    key: string;
    value: BackupData;
  };
}

const DB_NAME = 'productivity-app-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<ProductivityDB> | null = null;

// 初始化數據庫
export async function initDB(): Promise<IDBPDatabase<ProductivityDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ProductivityDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Work Records Store
      if (!db.objectStoreNames.contains('workRecords')) {
        const workStore = db.createObjectStore('workRecords', { keyPath: 'id' });
        workStore.createIndex('by-date', 'date');
        workStore.createIndex('by-updated', 'updatedAt');
      }

      // Todos Store
      if (!db.objectStoreNames.contains('todos')) {
        const todoStore = db.createObjectStore('todos', { keyPath: 'id' });
        todoStore.createIndex('by-dueDate', 'dueDate');
        todoStore.createIndex('by-priority', 'priority');
      }

      // Todo Templates Store
      if (!db.objectStoreNames.contains('todoTemplates')) {
        db.createObjectStore('todoTemplates', { keyPath: 'id' });
      }

      // Periodic Tasks Store
      if (!db.objectStoreNames.contains('periodicTasks')) {
        const periodicStore = db.createObjectStore('periodicTasks', { keyPath: 'id' });
        periodicStore.createIndex('by-startDate', 'startDate');
      }

      // Backups Store
      if (!db.objectStoreNames.contains('backups')) {
        db.createObjectStore('backups', { keyPath: 'timestamp' });
      }
    },
  });

  return dbInstance;
}

// Work Records CRUD
export async function getAllWorkRecords(): Promise<WorkRecord[]> {
  const db = await initDB();
  return db.getAll('workRecords');
}

export async function getWorkRecordsByDateRange(start: string, end: string): Promise<WorkRecord[]> {
  const db = await initDB();
  const range = IDBKeyRange.bound(start, end);
  return db.getAllFromIndex('workRecords', 'by-date', range);
}

export async function addWorkRecord(record: WorkRecord): Promise<void> {
  const db = await initDB();
  await db.put('workRecords', record);
}

export async function updateWorkRecord(record: WorkRecord): Promise<void> {
  const db = await initDB();
  await db.put('workRecords', record);
}

export async function deleteWorkRecord(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('workRecords', id);
}

// Todos CRUD
export async function getAllTodos(): Promise<TodoItem[]> {
  const db = await initDB();
  return db.getAll('todos');
}

export async function addTodo(todo: TodoItem): Promise<void> {
  const db = await initDB();
  await db.put('todos', todo);
}

export async function updateTodo(todo: TodoItem): Promise<void> {
  const db = await initDB();
  await db.put('todos', todo);
}

export async function deleteTodo(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('todos', id);
}

// Todo Templates CRUD
export async function getAllTodoTemplates(): Promise<TodoTemplate[]> {
  const db = await initDB();
  return db.getAll('todoTemplates');
}

export async function addTodoTemplate(template: TodoTemplate): Promise<void> {
  const db = await initDB();
  await db.put('todoTemplates', template);
}

export async function deleteTodoTemplate(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('todoTemplates', id);
}

// Periodic Tasks CRUD
export async function getAllPeriodicTasks(): Promise<PeriodicTask[]> {
  const db = await initDB();
  return db.getAll('periodicTasks');
}

export async function addPeriodicTask(task: PeriodicTask): Promise<void> {
  const db = await initDB();
  await db.put('periodicTasks', task);
}

export async function updatePeriodicTask(task: PeriodicTask): Promise<void> {
  const db = await initDB();
  await db.put('periodicTasks', task);
}

export async function deletePeriodicTask(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('periodicTasks', id);
}

// Backup Functions
export async function createBackup(): Promise<BackupData> {
  const db = await initDB();
  const backup: BackupData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    workRecords: await db.getAll('workRecords'),
    todos: await db.getAll('todos'),
    todoTemplates: await db.getAll('todoTemplates'),
    periodicTasks: await db.getAll('periodicTasks'),
  };

  // 保留最近5個備份
  const allBackups = await db.getAll('backups');
  if (allBackups.length >= 5) {
    const oldestBackup = allBackups.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )[0];
    await db.delete('backups', oldestBackup.timestamp);
  }

  await db.put('backups', backup);
  return backup;
}

export async function restoreFromBackup(backup: BackupData): Promise<void> {
  const db = await initDB();
  
  const tx = db.transaction(['workRecords', 'todos', 'todoTemplates', 'periodicTasks'], 'readwrite');
  
  // Clear existing data
  await tx.objectStore('workRecords').clear();
  await tx.objectStore('todos').clear();
  await tx.objectStore('todoTemplates').clear();
  await tx.objectStore('periodicTasks').clear();

  // Restore data
  for (const record of backup.workRecords) {
    await tx.objectStore('workRecords').put(record);
  }
  for (const todo of backup.todos) {
    await tx.objectStore('todos').put(todo);
  }
  for (const template of backup.todoTemplates) {
    await tx.objectStore('todoTemplates').put(template);
  }
  for (const task of backup.periodicTasks) {
    await tx.objectStore('periodicTasks').put(task);
  }

  await tx.done;
}

export async function getAllBackups(): Promise<BackupData[]> {
  const db = await initDB();
  return db.getAll('backups');
}

// Export backup as JSON file
export function downloadBackup(backup: BackupData): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `productivity-backup-${backup.timestamp.split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import backup from JSON file
export async function importBackup(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string) as BackupData;
        resolve(backup);
      } catch {
        reject(new Error('Invalid backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
