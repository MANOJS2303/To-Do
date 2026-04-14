export type Priority = 'low' | 'medium' | 'high';
export type ThemeMode = 'dark' | 'light';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  categoryId?: string;
  color: string;
  priority: Priority;
  completed: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  sharedBy?: string;
}

export interface AppTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}

export type ThemeName = 'violet' | 'ocean' | 'sunset' | 'forest' | 'rose' | 'midnight';

export interface AppState {
  tasks: Task[];
  categories: Category[];
  themeMode: ThemeMode;
  themeName: ThemeName;
  showSplash: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  togglePin: (id: string) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeName: (name: ThemeName) => void;
  setShowSplash: (v: boolean) => void;
  importTasks: (tasks: Task[]) => void;
  purgeTasks: () => void;
}

export interface RTCMessage {
  type: 'sync-request' | 'sync-response' | 'task-update' | 'ping';
  payload?: unknown;
}
