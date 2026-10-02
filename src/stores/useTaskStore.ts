import { create } from 'zustand';
import { Task, TaskPriority } from '../types/task';
import { loadFromStorage, saveToStorage } from '../lib/storage';
import { useStatsStore } from './useStatsStore';

const STORAGE_KEY = 'aetheris_tasks_v1';

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Review Project Roadmap & Core Architecture',
    completed: false,
    priority: 'high',
    estimatedMinutes: 45,
    elapsedMinutes: 20,
    createdAt: new Date().toISOString(),
    color: '#8b5cf6',
    emoji: '🎯',
    order: 0,
  },
  {
    id: 't-2',
    title: 'Write technical documentation & specifications',
    completed: false,
    priority: 'medium',
    estimatedMinutes: 30,
    elapsedMinutes: 10,
    createdAt: new Date().toISOString(),
    color: '#3b82f6',
    emoji: '📝',
    order: 1,
  },
  {
    id: 't-3',
    title: 'Organize workspace & review daily intentions',
    completed: true,
    priority: 'low',
    estimatedMinutes: 15,
    elapsedMinutes: 15,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    color: '#10b981',
    emoji: '🌱',
    order: 2,
  },
];

interface TaskStore {
  tasks: Task[];
  currentTaskId: string | null;
  addTask: (data: { title: string; estimatedMinutes?: number; priority?: TaskPriority; emoji?: string; color?: string }) => Task;
  updateTask: (id: string, partial: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setCurrentTask: (id: string | null) => void;
  reorderTasks: (tasks: Task[]) => void;
  incrementTaskElapsed: (id: string, minutes?: number) => void;
  clearCompleted: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => {
  const initialTasks = loadFromStorage<Task[]>(STORAGE_KEY, INITIAL_TASKS);
  const activeUnfinished = initialTasks.find((t) => !t.completed);

  return {
    tasks: initialTasks,
    currentTaskId: activeUnfinished ? activeUnfinished.id : null,

    addTask: (data) => {
      const state = get();
      const newTask: Task = {
        id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: data.title.trim(),
        completed: false,
        priority: data.priority || 'medium',
        estimatedMinutes: data.estimatedMinutes || 25,
        elapsedMinutes: 0,
        createdAt: new Date().toISOString(),
        emoji: data.emoji || '✨',
        color: data.color || '#8b5cf6',
        order: state.tasks.length,
      };

      const updated = [newTask, ...state.tasks];
      set({
        tasks: updated,
        currentTaskId: state.currentTaskId || newTask.id,
      });
      saveToStorage(STORAGE_KEY, updated);
      return newTask;
    },

    updateTask: (id, partial) => {
      set((state) => {
        const updated = state.tasks.map((t) => (t.id === id ? { ...t, ...partial } : t));
        saveToStorage(STORAGE_KEY, updated);
        return { tasks: updated };
      });
    },

    deleteTask: (id) => {
      set((state) => {
        const updated = state.tasks.filter((t) => t.id !== id);
        saveToStorage(STORAGE_KEY, updated);
        return {
          tasks: updated,
          currentTaskId: state.currentTaskId === id ? null : state.currentTaskId,
        };
      });
    },

    toggleTask: (id) => {
      set((state) => {
        const updated = state.tasks.map((t) => {
          if (t.id === id) {
            const nextCompleted = !t.completed;
            if (nextCompleted) {
              useStatsStore.getState().recordTaskCompletion();
            }
            return {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            };
          }
          return t;
        });

        saveToStorage(STORAGE_KEY, updated);
        return { tasks: updated };
      });
    },

    setCurrentTask: (id) => {
      set({ currentTaskId: id });
    },

    reorderTasks: (tasks) => {
      const indexed = tasks.map((t, idx) => ({ ...t, order: idx }));
      set({ tasks: indexed });
      saveToStorage(STORAGE_KEY, indexed);
    },

    incrementTaskElapsed: (id, minutes = 1) => {
      set((state) => {
        const updated = state.tasks.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              elapsedMinutes: t.elapsedMinutes + minutes,
            };
          }
          return t;
        });
        saveToStorage(STORAGE_KEY, updated);
        return { tasks: updated };
      });
    },

    clearCompleted: () => {
      set((state) => {
        const remaining = state.tasks.filter((t) => !t.completed);
        saveToStorage(STORAGE_KEY, remaining);
        return { tasks: remaining };
      });
    },
  };
});
