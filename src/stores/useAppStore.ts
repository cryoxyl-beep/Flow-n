import { create } from 'zustand';
import { WorkspaceMode } from '../types/theme';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}

interface AppStore {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;

  // Active Modals / Drawers
  settingsOpen: boolean;
  settingsTab: string;
  setSettingsOpen: (open: boolean, tab?: string) => void;

  themePickerOpen: boolean;
  setThemePickerOpen: (open: boolean) => void;

  soundscapeOpen: boolean;
  setSoundscapeOpen: (open: boolean) => void;

  musicPlayerOpen: boolean;
  setMusicPlayerOpen: (open: boolean) => void;

  statsOpen: boolean;
  setStatsOpen: (open: boolean) => void;

  taskDrawerOpen: boolean;
  setTaskDrawerOpen: (open: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;

  // Fullscreen state
  isFullscreen: boolean;
  toggleFullscreen: () => void;

  // Toast System
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  removeToast: (id: string) => void;

  // Ambient mouse activity state
  isAmbientActive: boolean;
  setAmbientActive: (active: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  mode: 'focus',
  setMode: (mode) => set({ mode }),

  settingsOpen: false,
  settingsTab: 'themes',
  setSettingsOpen: (open, tab = 'themes') => set({ settingsOpen: open, settingsTab: tab }),

  themePickerOpen: false,
  setThemePickerOpen: (open) => set({ themePickerOpen: open }),

  soundscapeOpen: false,
  setSoundscapeOpen: (open) => set({ soundscapeOpen: open }),

  musicPlayerOpen: false,
  setMusicPlayerOpen: (open) => set({ musicPlayerOpen: open }),

  statsOpen: false,
  setStatsOpen: (open) => set({ statsOpen: open }),

  taskDrawerOpen: false,
  setTaskDrawerOpen: (open) => set({ taskDrawerOpen: open }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  shortcutsModalOpen: false,
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),

  isFullscreen: false,
  toggleFullscreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        set({ isFullscreen: true });
      }).catch((err) => {
        console.warn('Fullscreen denied:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          set({ isFullscreen: false });
        }).catch((err) => {
          console.warn('Exit fullscreen error:', err);
        });
      }
    }
  },

  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  isAmbientActive: true,
  setAmbientActive: (active) => set({ isAmbientActive: active }),
}));
