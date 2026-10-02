import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { useAudioStore } from '../../stores/useAudioStore';
import {
  Command,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Home,
  Lightbulb,
  Cloud,
  CheckSquare,
  SlidersHorizontal,
  Music,
  Palette,
  BarChart3,
  Maximize2,
  Settings,
  Search,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setMode,
    setTaskDrawerOpen,
    setSoundscapeOpen,
    setMusicPlayerOpen,
    setSettingsOpen,
    setStatsOpen,
    toggleFullscreen,
    addToast,
  } = useAppStore();

  const { isRunning, startTimer, pauseTimer, resetTimer, skipPhase } = useTimerStore();
  const { toggleMusic } = useAudioStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const actions = [
    {
      id: 'timer-toggle',
      title: isRunning ? 'Pause Focus Timer' : 'Start Focus Timer',
      category: 'Timer',
      icon: isRunning ? Pause : Play,
      run: () => {
        if (isRunning) pauseTimer();
        else startTimer();
        addToast(isRunning ? 'Timer paused' : 'Timer started', 'info');
      },
    },
    {
      id: 'timer-reset',
      title: 'Reset Timer Phase',
      category: 'Timer',
      icon: RotateCcw,
      run: () => {
        resetTimer();
        addToast('Timer reset', 'info');
      },
    },
    {
      id: 'timer-skip',
      title: 'Skip to Next Phase',
      category: 'Timer',
      icon: SkipForward,
      run: () => {
        skipPhase();
        addToast('Phase skipped', 'info');
      },
    },
    {
      id: 'mode-home',
      title: 'Switch to Home Mode',
      category: 'Workspace',
      icon: Home,
      run: () => setMode('home'),
    },
    {
      id: 'mode-focus',
      title: 'Switch to Focus Mode',
      category: 'Workspace',
      icon: Lightbulb,
      run: () => setMode('focus'),
    },
    {
      id: 'mode-ambient',
      title: 'Switch to Ambient Zen Mode',
      category: 'Workspace',
      icon: Cloud,
      run: () => setMode('ambient'),
    },
    {
      id: 'open-tasks',
      title: 'Open Focus Tasks',
      category: 'Productivity',
      icon: CheckSquare,
      run: () => setTaskDrawerOpen(true),
    },
    {
      id: 'open-sounds',
      title: 'Open Soundscape Mixer',
      category: 'Atmosphere',
      icon: SlidersHorizontal,
      run: () => setSoundscapeOpen(true),
    },
    {
      id: 'toggle-music',
      title: 'Toggle Lo-Fi Ambient Music',
      category: 'Audio',
      icon: Music,
      run: () => toggleMusic(),
    },
    {
      id: 'open-themes',
      title: 'Change Theme & Background',
      category: 'Appearance',
      icon: Palette,
      run: () => setSettingsOpen(true, 'themes'),
    },
    {
      id: 'open-stats',
      title: 'View Productivity Stats & Streaks',
      category: 'Stats',
      icon: BarChart3,
      run: () => setSettingsOpen(true, 'stats'),
    },
    {
      id: 'toggle-fullscreen',
      title: 'Toggle Fullscreen Mode',
      category: 'View',
      icon: Maximize2,
      run: () => toggleFullscreen(),
    },
    {
      id: 'open-settings',
      title: 'Open Settings & Clock Options',
      category: 'Settings',
      icon: Settings,
      run: () => setSettingsOpen(true, 'clock'),
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filtered[selectedIndex];
      if (selected) {
        selected.run();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-md p-4 select-none">
      <div className="flex-1 absolute inset-0" onClick={() => setCommandPaletteOpen(false)} />

      <div className="relative w-full max-w-xl bg-neutral-900/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl animate-fade-in">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search actions..."
            className="w-full bg-transparent text-sm md:text-base text-white placeholder-white/40 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/60">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40">
              No matching actions found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.run();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-colors text-left ${
                    isSelected
                      ? 'bg-violet-600 text-white'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-75" />
                    <span>{item.title}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-semibold tracking-wider ${
                      isSelected ? 'text-white/80' : 'text-white/40'
                    }`}
                  >
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
