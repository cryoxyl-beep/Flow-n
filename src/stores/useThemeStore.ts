import { create } from 'zustand';
import { CustomBackgroundConfig, ModeThemes, ThemeCategory, ThemeItem, WorkspaceMode } from '../types/theme';
import { THEME_LIBRARY } from '../data/themes';
import { loadFromStorage, saveToStorage } from '../lib/storage';

const MODE_THEMES_KEY = 'aetheris_mode_themes_v1';
const CUSTOM_BG_KEY = 'aetheris_custom_bg_v1';

const DEFAULT_MODE_THEMES: ModeThemes = {
  home: 'obsidian_noir',
  focus: 'obsidian_noir',
  ambient: 'obsidian_noir',
};

interface ThemeStore {
  modeThemes: ModeThemes;
  customBackground: CustomBackgroundConfig | null;
  selectedCategory: ThemeCategory;
  
  setThemeForMode: (mode: WorkspaceMode, themeId: string) => void;
  setAllModeThemes: (themeId: string) => void;
  setSelectedCategory: (cat: ThemeCategory) => void;
  setCustomBackground: (config: CustomBackgroundConfig | null) => void;
  randomizeTheme: (mode?: WorkspaceMode) => void;
  getActiveTheme: (mode: WorkspaceMode) => ThemeItem;
}

export const useThemeStore = create<ThemeStore>((set, get) => {
  const initialModeThemes = loadFromStorage<ModeThemes>(MODE_THEMES_KEY, DEFAULT_MODE_THEMES);
  const initialCustomBg = loadFromStorage<CustomBackgroundConfig | null>(CUSTOM_BG_KEY, null);

  return {
    modeThemes: initialModeThemes,
    customBackground: initialCustomBg,
    selectedCategory: 'all',

    setThemeForMode: (mode, themeId) => {
      set((state) => {
        const next = { ...state.modeThemes, [mode]: themeId };
        saveToStorage(MODE_THEMES_KEY, next);
        return { modeThemes: next };
      });
    },

    setAllModeThemes: (themeId) => {
      set(() => {
        const next = { home: themeId, focus: themeId, ambient: themeId };
        saveToStorage(MODE_THEMES_KEY, next);
        return { modeThemes: next };
      });
    },

    setSelectedCategory: (cat) => {
      set({ selectedCategory: cat });
    },

    setCustomBackground: (config) => {
      set({ customBackground: config });
      saveToStorage(CUSTOM_BG_KEY, config);
    },

    randomizeTheme: (mode) => {
      const randomTheme = THEME_LIBRARY[Math.floor(Math.random() * THEME_LIBRARY.length)];
      if (mode) {
        get().setThemeForMode(mode, randomTheme.id);
      } else {
        get().setAllModeThemes(randomTheme.id);
      }
    },

    getActiveTheme: (mode) => {
      const id = get().modeThemes[mode] || 'obsidian_noir';
      const found = THEME_LIBRARY.find((t) => t.id === id);
      return found || THEME_LIBRARY[0];
    },
  };
});
