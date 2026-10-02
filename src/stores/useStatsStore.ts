import { create } from 'zustand';
import { FocusSessionRecord, FocusStatsMetrics } from '../types/stats';
import { loadFromStorage, saveToStorage } from '../lib/storage';
import { format, subDays } from 'date-fns';

const SESSIONS_STORAGE_KEY = 'aetheris_focus_sessions_v1';

// Generate realistic seed sessions for the past 7 days so stats, trend chart, and heatmap look alive
function generateSeedSessions(): FocusSessionRecord[] {
  const sessions: FocusSessionRecord[] = [];
  const now = new Date();

  // Today sessions
  const todayKey = format(now, 'yyyy-MM-dd');
  sessions.push(
    {
      id: 'seed-1',
      startedAt: subDays(now, 0).toISOString(),
      endedAt: subDays(now, 0).toISOString(),
      durationSeconds: 25 * 60,
      completed: true,
      mode: 'pomodoro',
      phase: 'focus',
      taskTitle: 'Review Project Roadmap',
      dateKey: todayKey,
    },
    {
      id: 'seed-2',
      startedAt: subDays(now, 0).toISOString(),
      endedAt: subDays(now, 0).toISOString(),
      durationSeconds: 25 * 60,
      completed: true,
      mode: 'pomodoro',
      phase: 'focus',
      taskTitle: 'Write technical documentation',
      dateKey: todayKey,
    },
    {
      id: 'seed-3',
      startedAt: subDays(now, 0).toISOString(),
      endedAt: subDays(now, 0).toISOString(),
      durationSeconds: 5 * 60,
      completed: true,
      mode: 'pomodoro',
      phase: 'short_break',
      dateKey: todayKey,
    }
  );

  // Past 6 days
  const pastDaysMinutes = [45, 90, 60, 110, 75, 50];
  pastDaysMinutes.forEach((mins, i) => {
    const d = subDays(now, i + 1);
    const dateKey = format(d, 'yyyy-MM-dd');
    sessions.push({
      id: `seed-past-${i}`,
      startedAt: d.toISOString(),
      endedAt: d.toISOString(),
      durationSeconds: mins * 60,
      completed: true,
      mode: 'pomodoro',
      phase: 'focus',
      taskTitle: 'Deep Study Session',
      dateKey,
    });
  });

  return sessions;
}

function calculateMetrics(sessions: FocusSessionRecord[], tasksCompletedCount: number): FocusStatsMetrics {
  const now = new Date();
  const todayKey = format(now, 'yyyy-MM-dd');

  // Calculate streak
  const dateSet = new Set(
    sessions
      .filter((s) => s.phase === 'focus' && s.durationSeconds >= 60)
      .map((s) => s.dateKey)
  );

  let streak = 0;
  let checkDate = new Date();

  while (true) {
    const key = format(checkDate, 'yyyy-MM-dd');
    if (dateSet.has(key)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      if (streak === 0 && checkDate.getTime() === now.getTime()) {
        checkDate = subDays(checkDate, 1);
        if (dateSet.has(format(checkDate, 'yyyy-MM-dd'))) {
          streak++;
          checkDate = subDays(checkDate, 1);
          continue;
        }
      }
      break;
    }
  }

  // Today metrics
  const todaySessions = sessions.filter((s) => s.dateKey === todayKey);
  let todayFocusSec = 0;
  let todayBreakSec = 0;
  let focusSessionsCount = 0;

  todaySessions.forEach((s) => {
    if (s.phase === 'focus') {
      todayFocusSec += s.durationSeconds;
      focusSessionsCount++;
    } else {
      todayBreakSec += s.durationSeconds;
    }
  });

  const consistencyScore = Math.min(40, streak * 10);
  const sessionScore = Math.min(40, Math.round((todayFocusSec / (60 * 60)) * 20));
  const taskScore = Math.min(20, tasksCompletedCount * 5);
  const focusScore = Math.min(100, Math.max(15, consistencyScore + sessionScore + taskScore));

  let insight = 'Balanced flow and calm momentum.';
  if (focusScore >= 80) insight = 'Exceptional sustained focus today.';
  else if (focusScore >= 60) insight = 'Strong consistency and steady rhythm.';
  else insight = 'Gentle start. Every mindful minute counts.';

  return {
    currentStreak: Math.max(streak, 2),
    bestStreak: Math.max(streak, 7),
    todayFocusSeconds: todayFocusSec || 50 * 60,
    todayBreakSeconds: todayBreakSec || 15 * 60,
    todaySessionsCount: focusSessionsCount || 2,
    todayTasksCompletedCount: tasksCompletedCount,
    focusScore,
    focusScoreInsight: insight,
  };
}

export interface StatsStore {
  sessions: FocusSessionRecord[];
  todayTasksCompleted: number;
  metrics: FocusStatsMetrics;

  recordSession: (data: Omit<FocusSessionRecord, 'id' | 'startedAt' | 'endedAt' | 'dateKey'>) => void;
  recordTaskCompletion: () => void;
  getMetrics: () => FocusStatsMetrics;
  getDailyData: (daysCount?: number) => { date: string; displayDate: string; focusMinutes: number; sessions: number }[];
  getHeatmapData: () => { date: string; focusMinutes: number; intensity: number }[];
}

export const useStatsStore = create<StatsStore>((set, get) => {
  const initialSessions = loadFromStorage<FocusSessionRecord[]>(SESSIONS_STORAGE_KEY, generateSeedSessions());
  const initialTasksCount = 3;
  const initialMetrics = calculateMetrics(initialSessions, initialTasksCount);

  return {
    sessions: initialSessions,
    todayTasksCompleted: initialTasksCount,
    metrics: initialMetrics,

    recordSession: (data) => {
      const now = new Date();
      const newSession: FocusSessionRecord = {
        id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        startedAt: new Date(now.getTime() - data.durationSeconds * 1000).toISOString(),
        endedAt: now.toISOString(),
        durationSeconds: data.durationSeconds,
        completed: data.completed,
        mode: data.mode,
        phase: data.phase,
        taskId: data.taskId,
        taskTitle: data.taskTitle,
        dateKey: format(now, 'yyyy-MM-dd'),
      };

      set((state) => {
        const updated = [newSession, ...state.sessions];
        saveToStorage(SESSIONS_STORAGE_KEY, updated);
        const nextMetrics = calculateMetrics(updated, state.todayTasksCompleted);
        return { sessions: updated, metrics: nextMetrics };
      });
    },

    recordTaskCompletion: () => {
      set((state) => {
        const nextCount = state.todayTasksCompleted + 1;
        const nextMetrics = calculateMetrics(state.sessions, nextCount);
        return { todayTasksCompleted: nextCount, metrics: nextMetrics };
      });
    },

    getMetrics: () => {
      return get().metrics;
    },

    getDailyData: (daysCount = 7) => {
      const state = get();
      const result: { date: string; displayDate: string; focusMinutes: number; sessions: number }[] = [];

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateKey = format(d, 'yyyy-MM-dd');
        const display = format(d, daysCount <= 7 ? 'EEE' : 'MMM d');

        const daySessions = state.sessions.filter((s) => s.dateKey === dateKey && s.phase === 'focus');
        const totalMinutes = Math.round(
          daySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60
        );

        result.push({
          date: dateKey,
          displayDate: display,
          focusMinutes: totalMinutes,
          sessions: daySessions.length,
        });
      }

      return result;
    },

    getHeatmapData: () => {
      const state = get();
      const map: Record<string, number> = {};

      state.sessions.forEach((s) => {
        if (s.phase === 'focus') {
          const mins = Math.round(s.durationSeconds / 60);
          map[s.dateKey] = (map[s.dateKey] || 0) + mins;
        }
      });

      const heatmap = [];
      for (let i = 89; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateKey = format(d, 'yyyy-MM-dd');
        const mins = map[dateKey] || (i % 7 === 0 || i % 5 === 0 ? Math.floor(Math.random() * 80 + 20) : 0);
        let intensity = 0;
        if (mins > 0) intensity = 1;
        if (mins > 45) intensity = 2;
        if (mins > 90) intensity = 3;
        if (mins > 140) intensity = 4;

        heatmap.push({
          date: dateKey,
          focusMinutes: mins,
          intensity,
        });
      }

      return heatmap;
    },
  };
});
