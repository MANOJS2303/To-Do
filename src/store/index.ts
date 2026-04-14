import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Task, Category, ThemeMode, ThemeName } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/themes';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: DEFAULT_CATEGORIES,
      themeMode: 'dark',
      themeName: 'violet',
      showSplash: true,

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ tasks: [...s.tasks, task] }));
      },

      updateTask: (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },

      toggleTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
            ),
          }));
        }
      },

      togglePin: (id) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, pinned: !t.pinned, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      addCategory: (catData) => {
        const category: Category = { ...catData, id: uuidv4() };
        set((s) => ({ categories: [...s.categories, category] }));
      },

      deleteCategory: (id) => {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
      },

      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
      setThemeName: (name: ThemeName) => set({ themeName: name }),
      setShowSplash: (v: boolean) => set({ showSplash: v }),

      importTasks: (tasks: Task[]) => {
        set((s) => {
          const existing = new Set(s.tasks.map((t) => t.id));
          const newTasks = tasks.filter((t) => !existing.has(t.id));
          return { tasks: [...s.tasks, ...newTasks] };
        });
      },

      purgeTasks: () => set({ tasks: [] }),
    }),
    {
      name: 'taskflow-store',
      version: 1,
    }
  )
);
