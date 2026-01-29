// 安全服務 - XSS防護與開發者工具偵測
import DOMPurify from 'dompurify';

// XSS 防護 - 淨化使用者輸入
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // 不允許任何 HTML 標籤
    ALLOWED_ATTR: [], // 不允許任何屬性
  });
}

// HTML 內容淨化（允許基本格式）
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

// 跳脫 HTML 特殊字符
export function escapeHTML(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char);
}

// 開發者工具偵測
let devToolsOpen = false;
let devToolsWarned = false;

export function initDevToolsDetection(): void {
  // 方法1: 偵測視窗大小變化
  const threshold = 160;
  
  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        onDevToolsOpen();
      }
    } else {
      devToolsOpen = false;
    }
  };

  window.addEventListener('resize', checkDevTools);
  
  // 方法2: 偵測 console 操作
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      devToolsOpen = true;
      onDevToolsOpen();
      return '';
    }
  });

  // 定期檢查
  setInterval(() => {
    checkDevTools();
    console.log('%c', element);
  }, 1000);

  // 方法3: 禁用右鍵選單（可選）
  document.addEventListener('contextmenu', (e) => {
    if (devToolsOpen) {
      e.preventDefault();
    }
  });

  // 方法4: 禁用某些快捷鍵
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      showWarning();
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
      e.preventDefault();
      showWarning();
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
      e.preventDefault();
    }
  });
}

function onDevToolsOpen(): void {
  if (!devToolsWarned) {
    showWarning();
    devToolsWarned = true;
    
    // 清除 console
    console.clear();
    
    // 顯示警告訊息
    console.log(
      '%c⚠️ 安全警告',
      'font-size: 24px; color: red; font-weight: bold;'
    );
    console.log(
      '%c此應用程式已偵測到開發者工具開啟。為保護您的數據安全，請避免在此處執行任何程式碼。',
      'font-size: 14px; color: orange;'
    );
    
    // 設置 debugger 陷阱（謹慎使用）
    // setInterval(() => { debugger; }, 100);
  }
}

function showWarning(): void {
  // 建立警告彈窗
  const existingWarning = document.getElementById('devtools-warning');
  if (existingWarning) return;

  const warning = document.createElement('div');
  warning.id = 'devtools-warning';
  warning.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 12px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: white;
    text-align: center;
    font-weight: bold;
    z-index: 99999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  warning.innerHTML = `
    ⚠️ 偵測到開發者工具 - 請注意數據安全
    <button onclick="this.parentElement.remove()" style="
      margin-left: 20px;
      background: white;
      color: #ee5a24;
      border: none;
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
    ">關閉</button>
  `;
  document.body.appendChild(warning);
}

// 驗證輸入數據的類型
export function validateWorkRecord(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.content === 'string' &&
    Array.isArray(record.tags) &&
    typeof record.date === 'string'
  );
}

export function validateTodoItem(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false;
  const todo = data as Record<string, unknown>;
  return (
    typeof todo.id === 'string' &&
    typeof todo.title === 'string' &&
    typeof todo.dueDate === 'string' &&
    ['high', 'medium', 'low'].includes(todo.priority as string)
  );
}

export function validatePeriodicTask(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false;
  const task = data as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    ['daily', 'weekly', 'monthly', 'custom'].includes(task.recurrenceType as string) &&
    typeof task.interval === 'number'
  );
}
