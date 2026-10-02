import { create } from 'zustand';
import { AppSettings } from '../types/settings';
import { loadFromStorage, saveToStorage } from '../lib/storage';

const STORAGE_KEY = 'aetheris_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Santosh',
  showGreeting: true,
  showDynamicGreetings: true,
  clockFormat: '12h',
  clockSize: 'regular',
  clockStyle: 'default_bold',
  showClockSeconds: false,
  showDate: true,

  showQuotes: true,
  quoteCategory: 'all',

  dailyIntention: 'Focus with clarity and intention',
  dailyIntentionDate: new Date().toISOString().split('T')[0],
  showDailyIntention: true,

  reducedMotion: false,
  highContrast: false,
  animationIntensity: 'normal',

  masterVolume: 0.8,
  soundscapeVolume: 0.7,
  musicVolume: 0.6,

  notificationsEnabled: false,
  timerCompletionAlert: true,

  isPlusMember: false,
};

interface SettingsStore extends AppSettings {
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => {
  const initial = loadFromStorage<AppSettings>(STORAGE_KEY, DEFAULT_SETTINGS);

  return {
    ...initial,
    updateSettings: (partial) => {
      set((state) => {
        const next = { ...state, ...partial };
        saveToStorage(STORAGE_KEY, next);
        return next;
      });
    },
    resetSettings: () => {
      set(DEFAULT_SETTINGS);
      saveToStorage(STORAGE_KEY, DEFAULT_SETTINGS);
    },
  };
});
