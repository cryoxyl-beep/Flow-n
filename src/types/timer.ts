export type TimerMode = 'pomodoro' | 'countdown' | 'stopwatch' | 'animedoro' | '52_17' | 'custom';

export type PomodoroPhase = 'focus' | 'short_break' | 'long_break';

export interface TimerSettings {
  focusDuration: number;       // in minutes
  shortBreakDuration: number;  // in minutes
  longBreakDuration: number;   // in minutes
  longBreakInterval: number;   // sessions before long break (default 4)
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  alertSound: 'bell' | 'marimba' | 'singing_bowl' | 'gentle_chime' | 'digital' | 'none';
  alertVolume: number;         // 0 - 1
  keepAwake: boolean;          // screen wake lock
  sendNotifications: boolean;
}

export interface CustomPreset {
  id: string;
  name: string;
  focusMinutes: number;
  breakMinutes: number;
}

export interface ActiveTimerState {
  mode: TimerMode;
  phase: PomodoroPhase;
  isRunning: boolean;
  isPaused: boolean;
  totalDurationSeconds: number;
  remainingSeconds: number;
  startTimestamp: number | null;
  targetEndTimestamp: number | null;
  pausedTimestamp: number | null;
  elapsedInPhase: number;
  currentCycle: number; // 1 to 4
  currentTaskId: string | null;
}
