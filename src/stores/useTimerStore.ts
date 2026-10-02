import { create } from 'zustand';
import { ActiveTimerState, PomodoroPhase, TimerMode, TimerSettings } from '../types/timer';
import { loadFromStorage, saveToStorage } from '../lib/storage';
import { playAlertSound } from '../lib/alertSounds';
import { useStatsStore } from './useStatsStore';
import { useTaskStore } from './useTaskStore';

const TIMER_STATE_KEY = 'aetheris_timer_state_v1';
const TIMER_SETTINGS_KEY = 'aetheris_timer_settings_v1';

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  alertSound: 'bell',
  alertVolume: 0.8,
  keepAwake: true,
  sendNotifications: false,
};

const INITIAL_TIMER_STATE: ActiveTimerState = {
  mode: 'pomodoro',
  phase: 'focus',
  isRunning: false,
  isPaused: false,
  totalDurationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  startTimestamp: null,
  targetEndTimestamp: null,
  pausedTimestamp: null,
  elapsedInPhase: 0,
  currentCycle: 1,
  currentTaskId: null,
};

interface TimerStore extends ActiveTimerState {
  settings: TimerSettings;
  updateSettings: (partial: Partial<TimerSettings>) => void;

  setMode: (mode: TimerMode) => void;
  setPhase: (phase: PomodoroPhase) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  addTime: (seconds: number) => void;
  setCurrentTask: (taskId: string | null) => void;
  tick: () => void;
  
  // Custom durations
  setCustomDurationMinutes: (minutes: number) => void;
}

// Global wake lock reference
let wakeLockSentinel: any = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator && !wakeLockSentinel) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
    }
  } catch (err) {
    // Graceful fallback if wake lock is denied or unsupported
  }
}

function releaseWakeLock() {
  if (wakeLockSentinel) {
    try {
      wakeLockSentinel.release();
    } catch (e) {}
    wakeLockSentinel = null;
  }
}

function sendNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch (e) {}
  }
}

export const useTimerStore = create<TimerStore>((set, get) => {
  const savedSettings = loadFromStorage<TimerSettings>(TIMER_SETTINGS_KEY, DEFAULT_TIMER_SETTINGS);
  const savedState = loadFromStorage<ActiveTimerState>(TIMER_STATE_KEY, INITIAL_TIMER_STATE);

  // Re-calculate remaining seconds if timer was running when page reloaded or slept
  let initialRemaining = savedState.remainingSeconds;
  let initialIsRunning = savedState.isRunning;

  if (savedState.isRunning && savedState.targetEndTimestamp) {
    const now = Date.now();
    if (savedState.mode === 'stopwatch') {
      const start = savedState.startTimestamp || now;
      initialRemaining = Math.floor((now - start) / 1000);
    } else {
      const diff = Math.max(0, Math.ceil((savedState.targetEndTimestamp - now) / 1000));
      initialRemaining = diff;
      if (diff === 0) {
        initialIsRunning = false;
      }
    }
  }

  const store: TimerStore = {
    ...savedState,
    remainingSeconds: initialRemaining,
    isRunning: initialIsRunning,
    settings: savedSettings,

    updateSettings: (partial) => {
      set((state) => {
        const nextSettings = { ...state.settings, ...partial };
        saveToStorage(TIMER_SETTINGS_KEY, nextSettings);

        // If not running, adapt total duration to new settings
        let nextDuration = state.totalDurationSeconds;
        let nextRemaining = state.remainingSeconds;

        if (!state.isRunning) {
          if (state.phase === 'focus') {
            nextDuration = (nextSettings.focusDuration || 25) * 60;
          } else if (state.phase === 'short_break') {
            nextDuration = (nextSettings.shortBreakDuration || 5) * 60;
          } else if (state.phase === 'long_break') {
            nextDuration = (nextSettings.longBreakDuration || 15) * 60;
          }
          nextRemaining = nextDuration;
        }

        return {
          settings: nextSettings,
          totalDurationSeconds: nextDuration,
          remainingSeconds: nextRemaining,
        };
      });
    },

    setMode: (mode: TimerMode) => {
      const s = get().settings;
      let duration = 25 * 60;
      let phase: PomodoroPhase = 'focus';

      if (mode === 'pomodoro') {
        duration = s.focusDuration * 60;
        phase = 'focus';
      } else if (mode === 'animedoro') {
        duration = 40 * 60; // 40m focus + 20m anime
        phase = 'focus';
      } else if (mode === '52_17') {
        duration = 52 * 60;
        phase = 'focus';
      } else if (mode === 'countdown') {
        duration = 30 * 60;
        phase = 'focus';
      } else if (mode === 'stopwatch') {
        duration = 0;
        phase = 'focus';
      }

      set({
        mode,
        phase,
        isRunning: false,
        isPaused: false,
        totalDurationSeconds: duration,
        remainingSeconds: duration,
        startTimestamp: null,
        targetEndTimestamp: null,
        pausedTimestamp: null,
        elapsedInPhase: 0,
      });

      saveToStorage(TIMER_STATE_KEY, get());
    },

    setPhase: (phase: PomodoroPhase) => {
      const s = get().settings;
      let duration = 25 * 60;

      if (get().mode === 'animedoro') {
        duration = phase === 'focus' ? 40 * 60 : 20 * 60;
      } else if (get().mode === '52_17') {
        duration = phase === 'focus' ? 52 * 60 : 17 * 60;
      } else {
        if (phase === 'focus') duration = s.focusDuration * 60;
        else if (phase === 'short_break') duration = s.shortBreakDuration * 60;
        else if (phase === 'long_break') duration = s.longBreakDuration * 60;
      }

      set({
        phase,
        isRunning: false,
        isPaused: false,
        totalDurationSeconds: duration,
        remainingSeconds: duration,
        startTimestamp: null,
        targetEndTimestamp: null,
        pausedTimestamp: null,
        elapsedInPhase: 0,
      });

      saveToStorage(TIMER_STATE_KEY, get());
    },

    setCustomDurationMinutes: (minutes: number) => {
      const sec = Math.max(60, minutes * 60);
      set({
        totalDurationSeconds: sec,
        remainingSeconds: sec,
        isRunning: false,
        isPaused: false,
        startTimestamp: null,
        targetEndTimestamp: null,
      });
      saveToStorage(TIMER_STATE_KEY, get());
    },

    startTimer: () => {
      const state = get();
      const now = Date.now();

      if (state.settings.keepAwake) {
        requestWakeLock();
      }

      if (state.mode === 'stopwatch') {
        const start = state.isPaused && state.startTimestamp ? state.startTimestamp : now;
        set({
          isRunning: true,
          isPaused: false,
          startTimestamp: start,
          targetEndTimestamp: null,
          pausedTimestamp: null,
        });
      } else {
        const targetEnd = now + state.remainingSeconds * 1000;
        set({
          isRunning: true,
          isPaused: false,
          startTimestamp: state.startTimestamp || now,
          targetEndTimestamp: targetEnd,
          pausedTimestamp: null,
        });
      }

      saveToStorage(TIMER_STATE_KEY, get());
    },

    pauseTimer: () => {
      const state = get();
      if (!state.isRunning) return;

      releaseWakeLock();
      const now = Date.now();

      let remaining = state.remainingSeconds;
      if (state.mode === 'stopwatch') {
        if (state.startTimestamp) {
          remaining = Math.floor((now - state.startTimestamp) / 1000);
        }
      } else if (state.targetEndTimestamp) {
        remaining = Math.max(0, Math.ceil((state.targetEndTimestamp - now) / 1000));
      }

      set({
        isRunning: false,
        isPaused: true,
        remainingSeconds: remaining,
        pausedTimestamp: now,
      });

      saveToStorage(TIMER_STATE_KEY, get());
    },

    resumeTimer: () => {
      get().startTimer();
    },

    resetTimer: () => {
      releaseWakeLock();
      const state = get();
      const s = state.settings;
      let duration = 25 * 60;

      if (state.mode === 'animedoro') {
        duration = state.phase === 'focus' ? 40 * 60 : 20 * 60;
      } else if (state.mode === '52_17') {
        duration = state.phase === 'focus' ? 52 * 60 : 17 * 60;
      } else if (state.mode === 'stopwatch') {
        duration = 0;
      } else {
        if (state.phase === 'focus') duration = s.focusDuration * 60;
        else if (state.phase === 'short_break') duration = s.shortBreakDuration * 60;
        else if (state.phase === 'long_break') duration = s.longBreakDuration * 60;
      }

      set({
        isRunning: false,
        isPaused: false,
        totalDurationSeconds: duration,
        remainingSeconds: duration,
        startTimestamp: null,
        targetEndTimestamp: null,
        pausedTimestamp: null,
        elapsedInPhase: 0,
      });

      saveToStorage(TIMER_STATE_KEY, get());
    },

    skipPhase: () => {
      const state = get();
      const s = state.settings;

      // Determine next phase
      let nextPhase: PomodoroPhase = 'short_break';
      let nextCycle = state.currentCycle;

      if (state.phase === 'focus') {
        if (state.currentCycle >= s.longBreakInterval) {
          nextPhase = 'long_break';
        } else {
          nextPhase = 'short_break';
        }
      } else {
        // Leaving break -> return to focus and advance cycle
        nextPhase = 'focus';
        nextCycle = state.phase === 'long_break' ? 1 : state.currentCycle + 1;
      }

      set({ currentCycle: nextCycle });
      get().setPhase(nextPhase);
    },

    addTime: (seconds: number) => {
      const state = get();
      const now = Date.now();
      const newRemaining = Math.max(0, state.remainingSeconds + seconds);
      const newTotal = Math.max(newRemaining, state.totalDurationSeconds + seconds);

      let targetEnd = state.targetEndTimestamp;
      if (state.isRunning && targetEnd) {
        targetEnd += seconds * 1000;
      }

      set({
        remainingSeconds: newRemaining,
        totalDurationSeconds: newTotal,
        targetEndTimestamp: targetEnd,
      });

      saveToStorage(TIMER_STATE_KEY, get());
    },

    setCurrentTask: (taskId: string | null) => {
      set({ currentTaskId: taskId });
      saveToStorage(TIMER_STATE_KEY, get());
    },

    tick: () => {
      const state = get();
      if (!state.isRunning) return;

      const now = Date.now();

      // Stopwatch logic
      if (state.mode === 'stopwatch') {
        const start = state.startTimestamp || now;
        const elapsed = Math.floor((now - start) / 1000);
        if (elapsed !== state.remainingSeconds) {
          set({
            remainingSeconds: elapsed,
            elapsedInPhase: elapsed,
          });

          // Add elapsed time to current task if active
          if (state.currentTaskId && elapsed > 0 && elapsed % 60 === 0) {
            useTaskStore.getState().incrementTaskElapsed(state.currentTaskId, 1);
          }
        }
        return;
      }

      // Countdown / Pomodoro logic: DRIFT-FREE (endTimestamp - now)
      if (!state.targetEndTimestamp) return;

      const diff = Math.ceil((state.targetEndTimestamp - now) / 1000);

      if (diff > 0) {
        if (diff !== state.remainingSeconds) {
          const elapsed = state.totalDurationSeconds - diff;
          set({
            remainingSeconds: diff,
            elapsedInPhase: elapsed,
          });

          // Associate focus time with current task every 60 seconds
          if (state.phase === 'focus' && state.currentTaskId && elapsed % 60 === 0 && elapsed > 0) {
            useTaskStore.getState().incrementTaskElapsed(state.currentTaskId, 1);
          }
        }
      } else {
        // --- PHASE COMPLETED ---
        const completedPhase = state.phase;
        const totalDuration = state.totalDurationSeconds;
        const taskId = state.currentTaskId;
        const taskTitle = taskId ? useTaskStore.getState().tasks.find((t) => t.id === taskId)?.title : null;

        // Record in stats store
        useStatsStore.getState().recordSession({
          durationSeconds: totalDuration,
          completed: true,
          mode: state.mode,
          phase: completedPhase,
          taskId,
          taskTitle,
        });

        // Play Alert Audio
        playAlertSound(state.settings.alertSound, state.settings.alertVolume);

        // Send browser notification
        if (state.settings.sendNotifications) {
          if (completedPhase === 'focus') {
            sendNotification('Focus Session Complete! 🎉', 'Well done. Time to take a restorative breath.');
          } else {
            sendNotification('Break Finished ✨', 'Ready to dive back into deep flow?');
          }
        }

        // Determine next phase
        let nextPhase: PomodoroPhase = 'short_break';
        let nextCycle = state.currentCycle;

        if (completedPhase === 'focus') {
          if (state.currentCycle >= state.settings.longBreakInterval) {
            nextPhase = 'long_break';
          } else {
            nextPhase = 'short_break';
          }
        } else {
          nextPhase = 'focus';
          nextCycle = completedPhase === 'long_break' ? 1 : state.currentCycle + 1;
        }

        const autoStart = completedPhase === 'focus'
          ? state.settings.autoStartBreaks
          : state.settings.autoStartFocus;

        set({
          currentCycle: nextCycle,
          isRunning: false,
          isPaused: false,
        });

        // Transition phase
        store.setPhase(nextPhase);

        if (autoStart) {
          setTimeout(() => {
            get().startTimer();
          }, 300);
        }
      }
    },
  };

  return store;
});

// Setup 100ms drift-free tick timer loop
if (typeof window !== 'undefined') {
  setInterval(() => {
    useTimerStore.getState().tick();
  }, 250);

  // Sync immediately when tab regains visibility or focus
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      useTimerStore.getState().tick();
    }
  });

  window.addEventListener('focus', () => {
    useTimerStore.getState().tick();
  });
}
