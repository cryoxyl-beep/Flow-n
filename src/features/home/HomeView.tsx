import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useAppStore } from '../../stores/useAppStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { format } from 'date-fns';
import { Play, Sparkles, CheckSquare, SlidersHorizontal, Edit3, Check } from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    userName,
    showGreeting,
    showDynamicGreetings,
    clockFormat,
    clockSize,
    clockStyle,
    showClockSeconds,
    showDate,
    dailyIntention,
    showDailyIntention,
    updateSettings,
  } = useSettingsStore();

  const setMode = useAppStore((state) => state.setMode);
  const setTaskDrawerOpen = useAppStore((state) => state.setTaskDrawerOpen);
  const setSoundscapeOpen = useAppStore((state) => state.setSoundscapeOpen);
  const setSettingsOpen = useAppStore((state) => state.setSettingsOpen);
  const startTimer = useTimerStore((state) => state.startTimer);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditingIntention, setIsEditingIntention] = useState(false);
  const [intentionInput, setIntentionInput] = useState(dailyIntention);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute greeting
  const getGreeting = () => {
    if (!showDynamicGreetings) return `Welcome, ${userName}`;
    const hours = currentTime.getHours();
    if (hours < 12) return `Good morning, ${userName}`;
    if (hours < 18) return `Good afternoon, ${userName}`;
    return `Good evening, ${userName}`;
  };

  // Clock format string
  const timeFormat = clockFormat === '12h'
    ? (showClockSeconds ? 'h:mm:ss' : 'h:mm')
    : (showClockSeconds ? 'HH:mm:ss' : 'HH:mm');

  const formattedTime = format(currentTime, timeFormat);
  const formattedDate = format(currentTime, 'EEEE, MMMM d');

  // Font style classes for clock
  const getClockStyleClass = () => {
    switch (clockStyle) {
      case 'default_bold':
        return 'font-extrabold tracking-tight font-sans';
      case 'default_light':
        return 'font-light tracking-wide font-sans';
      case 'soft':
        return 'font-medium rounded-full font-sans tracking-normal';
      case 'bubble':
        return 'font-black tracking-wider italic font-display';
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

  const getClockSizeClass = () => {
    switch (clockSize) {
      case 'small':
        return 'text-5xl md:text-7xl';
      case 'huge':
        return 'text-8xl md:text-9xl lg:text-[11rem]';
      case 'regular':
      default:
        return 'text-7xl md:text-8xl lg:text-9xl';
    }
  };

  const handleStartFocus = () => {
    setMode('focus');
    startTimer();
  };

  const handleSaveIntention = () => {
    updateSettings({ dailyIntention: intentionInput.trim() });
    setIsEditingIntention(false);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center select-none">
      {/* Greeting */}
      {showGreeting && (
        <h2 className="text-sm md:text-base font-medium text-white/70 tracking-wide uppercase mb-3 animate-fade-in">
          {getGreeting()}
        </h2>
      )}

      {/* Main Clock */}
      <div
        className={`text-white drop-shadow-2xl tabular-nums select-none transition-all duration-300 ${getClockSizeClass()} ${getClockStyleClass()}`}
        style={{ textShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      >
        {formattedTime}
      </div>

      {/* Date */}
      {showDate && (
        <div className="text-sm md:text-base text-white/60 font-medium tracking-wide mt-2">
          {formattedDate}
        </div>
      )}

      {/* Daily Intention */}
      {showDailyIntention && (
        <div className="mt-8 max-w-lg w-full">
          {isEditingIntention ? (
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl">
              <input
                type="text"
                value={intentionInput}
                onChange={(e) => setIntentionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveIntention()}
                placeholder="What is your main intention today?"
                className="w-full px-4 py-2 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveIntention}
                className="p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                title="Save Intention"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIntentionInput(dailyIntention);
                setIsEditingIntention(true);
              }}
              className="group flex items-center justify-center gap-2 mx-auto px-5 py-2.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 hover:border-white/25 hover:bg-black/45 transition-all text-xs md:text-sm text-white/80 shadow-lg"
              title="Click to edit daily intention"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
              <span>{dailyIntention || 'Set your intention for today'}</span>
              <Edit3 className="w-3 h-3 text-white/40 group-hover:text-white/70 ml-1 transition-colors" />
            </button>
          )}
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
        <button
          onClick={handleStartFocus}
          className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-neutral-950 font-semibold text-sm hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/10 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-neutral-950" />
          <span>Start Focus</span>
        </button>

        <button
          onClick={() => setTaskDrawerOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 text-white/90 text-sm font-medium hover:bg-black/60 hover:border-white/30 transition-all cursor-pointer"
        >
          <CheckSquare className="w-4 h-4 text-violet-400" />
          <span>Open Tasks</span>
        </button>

        <button
          onClick={() => setSoundscapeOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 text-white/90 text-sm font-medium hover:bg-black/60 hover:border-white/30 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>Atmosphere</span>
        </button>
      </div>
    </div>
  );
};
