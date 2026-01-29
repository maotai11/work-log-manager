// 匯出服務 - PDF 與 Excel 匯出功能
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import type { WorkRecord, TodoItem, PeriodicTask, BackupData } from '../types';
import { formatDate } from './calendarService';

// PDF 匯出 - 使用 html2canvas 截圖後轉換
export async function exportToPDF(
  elementId: string,
  filename: string = 'export.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // 轉換為圖片並下載
    const link = document.createElement('a');
    link.download = filename.replace('.pdf', '.png');
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

// 匯出工作紀錄到 Excel
export function exportWorkRecordsToExcel(
  records: WorkRecord[],
  filename: string = 'work-records.xlsx'
): void {
  const data = records.map((record) => ({
    '標題': record.title,
    '內容': record.content,
    '標籤': record.tags.join(', '),
    '日期': record.date,
    '建立時間': formatDate(record.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    '更新時間': formatDate(record.updatedAt, 'yyyy-MM-dd HH:mm:ss'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '工作紀錄');
  
  // 設置列寬
  worksheet['!cols'] = [
    { wch: 30 }, // 標題
    { wch: 50 }, // 內容
    { wch: 20 }, // 標籤
    { wch: 12 }, // 日期
    { wch: 20 }, // 建立時間
    { wch: 20 }, // 更新時間
  ];

  XLSX.writeFile(workbook, filename);
}

// 匯出待辦事項到 Excel
export function exportTodosToExcel(
  todos: TodoItem[],
  filename: string = 'todos.xlsx'
): void {
  const priorityMap = {
    high: '高',
    medium: '中',
    low: '低',
  };

  const data = todos.map((todo) => ({
    '標題': todo.title,
    '描述': todo.description,
    '優先級': priorityMap[todo.priority],
    '截止日期': todo.dueDate,
    '狀態': todo.completed ? '已完成' : '進行中',
    '建立時間': formatDate(todo.createdAt, 'yyyy-MM-dd HH:mm:ss'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '待辦事項');
  
  worksheet['!cols'] = [
    { wch: 30 },
    { wch: 50 },
    { wch: 8 },
    { wch: 12 },
    { wch: 10 },
    { wch: 20 },
  ];

  XLSX.writeFile(workbook, filename);
}

// 匯出週期任務到 Excel
export function exportPeriodicTasksToExcel(
  tasks: PeriodicTask[],
  filename: string = 'periodic-tasks.xlsx'
): void {
  const recurrenceMap = {
    daily: '每日',
    weekly: '每週',
    monthly: '每月',
    custom: '自訂',
  };

  const data = tasks.map((task) => ({
    '標題': task.title,
    '描述': task.description,
    '週期類型': recurrenceMap[task.recurrenceType],
    '間隔': task.interval,
    '開始日期': task.startDate,
    '結束日期': task.endDate || '無限期',
    '已完成次數': task.completedDates.length,
    '建立時間': formatDate(task.createdAt, 'yyyy-MM-dd HH:mm:ss'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '週期任務');
  
  worksheet['!cols'] = [
    { wch: 30 },
    { wch: 50 },
    { wch: 10 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
  ];

  XLSX.writeFile(workbook, filename);
}

// 匯出所有數據到 Excel（多個工作表）
export function exportAllToExcel(
  workRecords: WorkRecord[],
  todos: TodoItem[],
  periodicTasks: PeriodicTask[],
  filename: string = 'all-data.xlsx'
): void {
  const workbook = XLSX.utils.book_new();

  // 工作紀錄
  const workData = workRecords.map((record) => ({
    '標題': record.title,
    '內容': record.content,
    '標籤': record.tags.join(', '),
    '日期': record.date,
    '建立時間': formatDate(record.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    '更新時間': formatDate(record.updatedAt, 'yyyy-MM-dd HH:mm:ss'),
  }));
  const workSheet = XLSX.utils.json_to_sheet(workData);
  XLSX.utils.book_append_sheet(workbook, workSheet, '工作紀錄');

  // 待辦事項
  const todoData = todos.map((todo) => ({
    '標題': todo.title,
    '描述': todo.description,
    '優先級': todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低',
    '截止日期': todo.dueDate,
    '狀態': todo.completed ? '已完成' : '進行中',
    '建立時間': formatDate(todo.createdAt, 'yyyy-MM-dd HH:mm:ss'),
  }));
  const todoSheet = XLSX.utils.json_to_sheet(todoData);
  XLSX.utils.book_append_sheet(workbook, todoSheet, '待辦事項');

  // 週期任務
  const periodicData = periodicTasks.map((task) => ({
    '標題': task.title,
    '描述': task.description,
    '週期類型': task.recurrenceType,
    '間隔': task.interval,
    '開始日期': task.startDate,
    '結束日期': task.endDate || '無限期',
    '已完成次數': task.completedDates.length,
  }));
  const periodicSheet = XLSX.utils.json_to_sheet(periodicData);
  XLSX.utils.book_append_sheet(workbook, periodicSheet, '週期任務');

  XLSX.writeFile(workbook, filename);
}

// 建立可列印的 HTML 內容
export function createPrintableHTML(
  title: string,
  content: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
        th { background: #f1f5f9; font-weight: 600; }
        tr:nth-child(even) { background: #f8fafc; }
        .priority-high { color: #dc2626; }
        .priority-medium { color: #f59e0b; }
        .priority-low { color: #10b981; }
        .completed { text-decoration: line-through; color: #94a3b8; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${content}
      <footer style="margin-top: 40px; color: #94a3b8; font-size: 12px;">
        匯出時間：${new Date().toLocaleString('zh-TW')}
      </footer>
    </body>
    </html>
  `;
}

// 匯出為 HTML 檔案
export function exportToHTML(
  backup: BackupData,
  filename: string = 'productivity-export.html'
): void {
  let content = '';

  // 工作紀錄
  if (backup.workRecords.length > 0) {
    content += '<h2>📋 工作紀錄</h2><table>';
    content += '<tr><th>標題</th><th>日期</th><th>標籤</th></tr>';
    backup.workRecords.forEach((r) => {
      content += `<tr><td>${r.title}</td><td>${r.date}</td><td>${r.tags.join(', ')}</td></tr>`;
    });
    content += '</table>';
  }

  // 待辦事項
  if (backup.todos.length > 0) {
    content += '<h2>✅ 待辦事項</h2><table>';
    content += '<tr><th>標題</th><th>截止日期</th><th>優先級</th><th>狀態</th></tr>';
    backup.todos.forEach((t) => {
      const priorityClass = `priority-${t.priority}`;
      const completedClass = t.completed ? 'completed' : '';
      content += `<tr class="${completedClass}"><td>${t.title}</td><td>${t.dueDate}</td>`;
      content += `<td class="${priorityClass}">${t.priority}</td>`;
      content += `<td>${t.completed ? '已完成' : '進行中'}</td></tr>`;
    });
    content += '</table>';
  }

  // 週期任務
  if (backup.periodicTasks.length > 0) {
    content += '<h2>🔄 週期任務</h2><table>';
    content += '<tr><th>標題</th><th>週期</th><th>間隔</th><th>已完成次數</th></tr>';
    backup.periodicTasks.forEach((p) => {
      content += `<tr><td>${p.title}</td><td>${p.recurrenceType}</td>`;
      content += `<td>${p.interval}</td><td>${p.completedDates.length}</td></tr>`;
    });
    content += '</table>';
  }

  const html = createPrintableHTML('生產力應用數據匯出', content);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
