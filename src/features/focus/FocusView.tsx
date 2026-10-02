import React, { useState } from 'react';
import { useTimerStore } from '../../stores/useTimerStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useAppStore } from '../../stores/useAppStore';
import { PomodoroPhase } from '../../types/timer';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Pipette,
  CheckCircle2,
  Plus,
  Minus,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

export const FocusView: React.FC = () => {
  const phase = useTimerStore((s) => s.phase);
  const mode = useTimerStore((s) => s.mode);
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const isRunning = useTimerStore((s) => s.isRunning);
  const currentCycle = useTimerStore((s) => s.currentCycle);
  const longBreakInterval = useTimerStore((s) => s.settings.longBreakInterval);
  const setPhase = useTimerStore((s) => s.setPhase);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resetTimer = useTimerStore((s) => s.resetTimer);
  const skipPhase = useTimerStore((s) => s.skipPhase);
  const addTime = useTimerStore((s) => s.addTime);

  const clockStyle = useSettingsStore((state) => state.clockStyle);
  const clockSize = useSettingsStore((state) => state.clockSize);
  const tasks = useTaskStore((state) => state.tasks);
  const currentTaskId = useTaskStore((state) => state.currentTaskId);
  const setCurrentTask = useTaskStore((state) => state.setCurrentTask);
  const setTaskDrawerOpen = useAppStore((state) => state.setTaskDrawerOpen);
  const addToast = useAppStore((state) => state.addToast);

  const currentTask = tasks.find((t) => t.id === currentTaskId) || tasks.find((t) => !t.completed);

  // Format seconds to MM:SS
  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Clock style class
  const getTimerStyleClass = () => {
    switch (clockStyle) {
      case 'default_bold':
        return 'font-extrabold tracking-tight font-sans';
      case 'default_light':
        return 'font-light tracking-wide font-sans';
      case 'soft':
        return 'font-medium font-sans';
      case 'bubble':
        return 'font-black italic font-display';
      case 'minimal_light':
        return 'font-thin tracking-widest font-sans';
      case 'minimal':
        return 'font-normal tracking-tight font-sans';
      case 'serif':
        return 'font-normal font-serif italic tracking-wide';
      case 'mono':
        return 'font-mono font-bold tracking-tight';
      case 'italic':
        return 'italic font-bold font-sans tracking-tight';
      default:
        return 'font-bold tracking-tight font-sans';
    }
  };

  const getTimerSizeClass = () => {
    switch (clockSize) {
      case 'small':
        return 'text-6xl md:text-8xl';
      case 'huge':
        return 'text-8xl md:text-9xl lg:text-[12rem]';
      case 'regular':
      default:
        return 'text-7xl md:text-9xl lg:text-[10rem]';
    }
  };

  // Picture-in-Picture implementation
  const handlePiP = async () => {
    try {
      if ('documentPictureInPicture' in window) {
        // Modern Document PiP API
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 320,
          height: 220,
        });

        // Copy styles
        Array.from(document.styleSheets).forEach((sheet) => {
          try {
            const link = pipWindow.document.createElement('link');
            link.rel = 'stylesheet';
            link.href = sheet.href || '';
            pipWindow.document.head.appendChild(link);
          } catch (e) {}
        });

        // Inject PiP DOM
        const container = pipWindow.document.createElement('div');
        container.style.cssText = `
          background: #09090b;
          color: #fafafa;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          user-select: none;
          padding: 16px;
          text-align: center;
        `;

        const renderPiP = () => {
          const state = useTimerStore.getState();
          const task = useTaskStore.getState().tasks.find((t) => t.id === state.currentTaskId);
          container.innerHTML = `
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; margin-bottom: 6px;">
              ${state.phase.replace('_', ' ')}
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #e4e4e7; margin-bottom: 12px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${task ? task.title : 'Deep Focus Session'}
            </div>
            <div style="font-size: 48px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; margin-bottom: 16px;">
              ${Math.floor(state.remainingSeconds / 60).toString().padStart(2, '0')}:${(state.remainingSeconds % 60).toString().padStart(2, '0')}
            </div>
            <button id="pip-toggle" style="background: #7c3aed; color: #fff; border: none; border-radius: 9999px; padding: 8px 24px; font-size: 13px; font-weight: 600; cursor: pointer;">
              ${state.isRunning ? 'Pause' : 'Resume'}
            </button>
          `;

          const btn = container.querySelector('#pip-toggle');
          if (btn) {
            btn.addEventListener('click', () => {
              if (useTimerStore.getState().isRunning) {
                useTimerStore.getState().pauseTimer();
              } else {
                useTimerStore.getState().startTimer();
              }
              renderPiP();
            });
          }
        };

        pipWindow.document.body.appendChild(container);
        renderPiP();

        const pipInterval = setInterval(renderPiP, 1000);
        pipWindow.addEventListener('pagehide', () => clearInterval(pipInterval));
        addToast('Opened Picture-in-Picture window', 'info');
      } else {
        addToast('Document PiP is not supported by your current browser', 'warning');
      }
    } catch (err: any) {
      addToast(err?.message || 'Unable to launch Picture-in-Picture', 'warning');
    }
  };

  // Phase switchers
  const phases: { id: PomodoroPhase; label: string }[] = [
    { id: 'focus', label: 'FOCUS' },
    { id: 'short_break', label: 'SHORT BREAK' },
    { id: 'long_break', label: 'LONG BREAK' },
  ];

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center select-none">
      {/* 1. Current Task Banner */}
      <div className="mb-6 max-w-xl w-full">
        {currentTask ? (
          <button
            onClick={() => setTaskDrawerOpen(true)}
            className="group flex flex-col items-center mx-auto px-5 py-2 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 hover:border-white/25 hover:bg-black/45 transition-all text-center cursor-pointer shadow-lg"
            title="Click to view tasks"
          >
            <span className="text-[11px] uppercase tracking-widest text-white/50 mb-0.5 group-hover:text-white/70 transition-colors">
              Currently Focusing On
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-semibold text-white drop-shadow">
                {currentTask.title}
              </span>
              <span className="text-xs text-white/50">({currentTask.elapsedMinutes}/{currentTask.estimatedMinutes}m)</span>
            </div>

            {/* Task ETA Progress Bar */}
            <div className="w-36 h-1 bg-white/15 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-violet-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((currentTask.elapsedMinutes / Math.max(1, currentTask.estimatedMinutes)) * 100))}%`,
                }}
              />
            </div>
          </button>
        ) : (
          <button
            onClick={() => setTaskDrawerOpen(true)}
            className="flex items-center gap-2 mx-auto px-4 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/10 text-xs text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
            <span>Select or add a focus task</span>
          </button>
        )}
      </div>

      {/* 2. Phase Navigation (FOCUS / SHORT BREAK / LONG BREAK) */}
      <div className="flex items-center gap-4 md:gap-8 mb-4">
        {phases.map((p) => {
          const isActive = phase === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPhase(p.id)}
              className={`text-xs md:text-sm font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-white border-b-2 border-white pb-1 drop-shadow'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* 3. Session Progress Dots (● ● ○ ○) */}
      {mode === 'pomodoro' && (
        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: longBreakInterval || 4 }).map((_, idx) => {
            const isCompleted = idx < currentCycle - 1;
            const isCurrent = idx === currentCycle - 1;
            return (
              <span
                key={idx}
                className={`transition-all duration-300 ${
                  isCompleted
                    ? 'w-2 h-2 rounded-full bg-white shadow-sm'
                    : isCurrent
                    ? 'w-2.5 h-2.5 rounded-full bg-violet-400 ring-2 ring-violet-400/40 animate-pulse'
                    : 'w-2 h-2 rounded-full bg-white/20'
                }`}
                title={`Pomodoro cycle ${idx + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* 4. Large Digital Timer Display */}
      <div
        className={`text-white drop-shadow-2xl tabular-nums select-none my-2 transition-all duration-300 ${getTimerSizeClass()} ${getTimerStyleClass()}`}
        style={{ textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
      >
        {formatTimerTime(remainingSeconds)}
      </div>

      {/* 5. Primary Timer Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Play / Pause Toggle */}
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition-all shadow-xl cursor-pointer"
          title={isRunning ? 'Pause Timer (Space)' : 'Start Timer (Space)'}
        >
          {isRunning ? (
            <Pause className="w-6 h-6 fill-white" />
          ) : (
            <Play className="w-6 h-6 fill-white ml-0.5" />
          )}
        </button>

        {/* Skip Phase */}
        <button
          onClick={skipPhase}
          className="w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 active:scale-95 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Skip to next phase"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        {/* Reset Timer */}
        <button
          onClick={resetTimer}
          className="w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 active:scale-95 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Reset Phase Timer (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Picture-in-Picture */}
        <button
          onClick={handlePiP}
          className="w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 active:scale-95 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Open Picture-in-Picture Floating Window"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <rect x="12" y="10" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" />
          </svg>
        </button>
      </div>

      {/* 6. Quick Nudge Buttons (+5m / -5m) */}
      <div className="flex items-center gap-2 mt-5">
        <button
          onClick={() => addTime(-5 * 60)}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/25 hover:bg-black/40 border border-white/10 text-[11px] font-mono text-white/50 hover:text-white/80 transition-all cursor-pointer"
          title="Subtract 5 minutes"
        >
          <Minus className="w-3 h-3" />
          <span>5m</span>
        </button>
        <button
          onClick={() => addTime(5 * 60)}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/25 hover:bg-black/40 border border-white/10 text-[11px] font-mono text-white/50 hover:text-white/80 transition-all cursor-pointer"
          title="Add 5 minutes"
        >
          <Plus className="w-3 h-3" />
          <span>5m</span>
        </button>
      </div>
    </div>
  );
};
