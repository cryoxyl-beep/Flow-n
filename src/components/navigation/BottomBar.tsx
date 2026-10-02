import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useAudioStore } from '../../stores/useAudioStore';
import { useStatsStore } from '../../stores/useStatsStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { ModeSwitcher } from './ModeSwitcher';
import {
  SlidersHorizontal,
  Music,
  CheckSquare,
  Flame,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const {
    soundscapeOpen,
    setSoundscapeOpen,
    musicPlayerOpen,
    setMusicPlayerOpen,
    taskDrawerOpen,
    setTaskDrawerOpen,
    setSettingsOpen,
    setStatsOpen,
    isFullscreen,
    toggleFullscreen,
    mode,
  } = useAppStore();

  const tracks = useAudioStore((state) => state.tracks);
  const isMusicPlaying = useAudioStore((state) => state.isMusicPlaying);
  const activeSoundsCount = tracks.filter((t) => t.isPlaying).length;

  const currentStreak = useStatsStore((state) => state.metrics.currentStreak);
  const tasks = useTaskStore((state) => state.tasks);
  const uncompletedTasksCount = tasks.filter((t) => !t.completed).length;

  // In ambient mode, if idle, fade out bottom bar (handled by parent or opacity)
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 select-none pointer-events-auto">
      {/* Left Action Cluster: Sounds, Music, Tasks */}
      <div className="flex items-center gap-2">
        {/* Soundscape Mixer Toggle */}
        <button
          onClick={() => setSoundscapeOpen(!soundscapeOpen)}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all text-xs font-medium ${
            soundscapeOpen || activeSoundsCount > 0
              ? 'bg-violet-600/30 border-violet-500/50 text-white shadow-lg shadow-violet-500/10'
              : 'bg-black/35 border-white/10 text-white/70 hover:text-white hover:bg-black/50'
          }`}
          title="Ambient Soundscape Mixer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Sounds</span>
          {activeSoundsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        {/* Music Player Toggle */}
        <button
          onClick={() => setMusicPlayerOpen(!musicPlayerOpen)}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all text-xs font-medium ${
            musicPlayerOpen || isMusicPlaying
              ? 'bg-indigo-600/30 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
              : 'bg-black/35 border-white/10 text-white/70 hover:text-white hover:bg-black/50'
          }`}
          title="Lo-Fi Music Player"
        >
          <Music className="w-4 h-4" />
          <span className="hidden sm:inline">Music</span>
          {isMusicPlaying && (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 h-3 bg-indigo-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-1.5 bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </button>

        {/* Tasks Drawer Toggle */}
        <button
          onClick={() => setTaskDrawerOpen(!taskDrawerOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all text-xs font-medium ${
            taskDrawerOpen
              ? 'bg-white/20 border-white/30 text-white'
              : 'bg-black/35 border-white/10 text-white/70 hover:text-white hover:bg-black/50'
          }`}
          title="Task List & Daily Focus"
        >
          <CheckSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Tasks</span>
          {uncompletedTasksCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-white/15 text-[11px] font-mono">
              {uncompletedTasksCount}
            </span>
          )}
        </button>
      </div>

      {/* Center: Mode Switcher */}
      <div className="flex items-center">
        <ModeSwitcher />
      </div>

      {/* Right Action Cluster: Streak, Stats, Settings, Fullscreen */}
      <div className="flex items-center gap-2">
        {/* Streak Button (opens Stats) */}
        <button
          onClick={() => setStatsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/35 backdrop-blur-xl border border-white/10 text-xs font-medium text-amber-300 hover:bg-black/50 hover:border-amber-500/30 transition-all shadow-sm"
          title="View Productivity Streaks & Stats"
        >
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-mono font-semibold">{currentStreak}</span>
        </button>

        {/* Settings Drawer */}
        <button
          onClick={() => setSettingsOpen(true, 'themes')}
          className="p-2 rounded-xl bg-black/35 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-black/50 transition-all"
          title="Customize Themes, Clock & Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-black/35 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-black/50 transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (F)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </footer>
  );
};
