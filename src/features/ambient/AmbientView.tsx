import React, { useState, useEffect } from 'react';
import { useTimerStore } from '../../stores/useTimerStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useAppStore } from '../../stores/useAppStore';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const AmbientView: React.FC = () => {
  const { remainingSeconds, isRunning, startTimer, pauseTimer, resetTimer, phase } = useTimerStore();
  const clockStyle = useSettingsStore((state) => state.clockStyle);

  const [isVisible, setIsVisible] = useState(true);

  // Inactivity auto-fade
  useEffect(() => {
    let timeout: any;

    const handleActivity = () => {
      setIsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    // Initial countdown
    timeout = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center select-none cursor-default">
      {/* Zen Ambient Timer */}
      <div className="flex flex-col items-center">
        <div
          className={`text-6xl md:text-8xl lg:text-9xl text-white/90 drop-shadow-2xl font-light tracking-widest tabular-nums transition-opacity duration-1000 ${
            isVisible ? 'opacity-90 scale-100' : 'opacity-40 scale-[0.98]'
          }`}
          style={{ textShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
        >
          {formatTimer(remainingSeconds)}
        </div>

        {/* Phase Indicator */}
        <div
          className={`mt-3 text-xs uppercase tracking-[0.25em] text-white/50 transition-opacity duration-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {phase.replace('_', ' ')}
        </div>

        {/* Minimal Controls (revealed on mouse movement) */}
        <div
          className={`flex items-center gap-3 mt-6 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
