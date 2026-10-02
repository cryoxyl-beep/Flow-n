import { PomodoroPhase, TimerMode } from './timer';

export interface FocusSessionRecord {
  id: string;
  startedAt: string;     // ISO timestamp
  endedAt: string;       // ISO timestamp
  durationSeconds: number;
  completed: boolean;
  mode: TimerMode;
  phase: PomodoroPhase;
  taskId?: string | null;
  taskTitle?: string | null;
  dateKey: string;       // YYYY-MM-DD in local time
}

export interface DayFocusSummary {
  dateKey: string;
  totalFocusSeconds: number;
  totalBreakSeconds: number;
  sessionsCount: number;
  tasksCompletedCount: number;
}

export interface FocusStatsMetrics {
  currentStreak: number;
  bestStreak: number;
  todayFocusSeconds: number;
  todayBreakSeconds: number;
  todaySessionsCount: number;
  todayTasksCompletedCount: number;
  focusScore: number;     // 0 to 100
  focusScoreInsight: string;
}
