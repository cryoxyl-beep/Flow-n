import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { useStatsStore } from '../../stores/useStatsStore';
import { THEME_LIBRARY } from '../../data/themes';
import { ThemeCategory, WorkspaceMode } from '../../types/theme';
import { ClockFormat, ClockSize, ClockStyle } from '../../types/settings';
import { playAlertSound } from '../../lib/alertSounds';
import {
  Palette,
  Clock,
  Timer,
  BarChart3,
  Quote,
  Sparkles,
  User,
  HelpCircle,
  X,
  Upload,
  Check,
  Flame,
  Volume2,
  Bell,
  Eye,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const SettingsModal: React.FC = () => {
  const { settingsOpen, setSettingsOpen, settingsTab, setSettingsOpen: openTab, addToast } = useAppStore();
  const settings = useSettingsStore();
  const {
    modeThemes,
    customBackground,
    selectedCategory,
    setThemeForMode,
    setSelectedCategory,
    setCustomBackground,
  } = useThemeStore();

  const timerSettings = useTimerStore((s) => s.settings);
  const updateTimerSettings = useTimerStore((s) => s.updateSettings);

  const metrics = useStatsStore((s) => s.metrics);
  const getDailyData = useStatsStore((s) => s.getDailyData);
  const getHeatmapData = useStatsStore((s) => s.getHeatmapData);

  const [activeModeTab, setActiveModeTab] = useState<WorkspaceMode>('focus');
  const [statsPeriod, setStatsPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const filteredThemes = useMemo(
    () => THEME_LIBRARY.filter((t) => selectedCategory === 'all' || t.category === selectedCategory),
    [selectedCategory]
  );

  const dailyChartData = useMemo(() => {
    if (settingsTab !== 'stats') return [];
    return getDailyData(statsPeriod === 'today' ? 1 : statsPeriod === 'week' ? 7 : 30);
  }, [getDailyData, statsPeriod, settingsTab]);

  const heatmapData = useMemo(() => {
    if (settingsTab !== 'stats') return [];
    return getHeatmapData();
  }, [getHeatmapData, settingsTab]);

  if (!settingsOpen) return null;

  // Handle custom image/video file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      addToast('File too large (max 25MB)', 'warning');
      return;
    }

    const isVideo = file.type.startsWith('video');
    const objectUrl = URL.createObjectURL(file);

    setCustomBackground({
      url: objectUrl,
      type: isVideo ? 'video' : 'image',
      brightness: 1,
      contrast: 1,
      blur: 0,
      overlayOpacity: 0.35,
    });

    addToast('Custom background applied', 'success');
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        settings.updateSettings({ notificationsEnabled: true });
        addToast('Notifications enabled', 'success');
      } else {
        addToast('Notifications blocked in browser settings', 'warning');
      }
    } else {
      addToast('Browser does not support notifications', 'warning');
    }
  };

  const navItems = [
    { id: 'themes', label: 'Themes', icon: Palette, badge: 'NEW' },
    { id: 'clock', label: 'Clock', icon: Clock, badge: 'NEW' },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'quotes', label: 'Quotes', icon: Quote },
    { id: 'account', label: 'Account', icon: User },
    { id: 'shortcuts', label: 'Shortcuts', icon: Zap },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 md:p-8 select-none">
      {/* Modal Dialog Shell */}
      <div className="relative w-full max-w-5xl h-[88vh] bg-neutral-950/95 border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden animate-fade-in">
        {/* Left Navigation Sidebar */}
        <div className="w-56 md:w-64 border-r border-white/10 bg-neutral-900/40 p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/10">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Preferences</span>
              </span>
              <button
                onClick={() => setSettingsOpen(false)}
                className="md:hidden text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = settingsTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => openTab(true, item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Plus Member Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-violet-900/40 to-indigo-900/40 border border-violet-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Aetheris Plus</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed mb-2.5">
              Unlock custom backgrounds, exclusive themes, and full trends.
            </p>
            <button
              onClick={() => {
                settings.updateSettings({ isPlusMember: !settings.isPlusMember });
                addToast(
                  settings.isPlusMember ? 'Switched to Free tier' : 'Plus unlocked for preview!',
                  'success'
                );
              }}
              className="w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
            >
              {settings.isPlusMember ? 'Active (Plus Member)' : 'Upgrade to Plus'}
            </button>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-neutral-950/70">
          {/* Close button on desktop */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. THEMES TAB */}
          {settingsTab === 'themes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Themes</h2>
                <p className="text-xs md:text-sm text-white/50 mt-1">
                  Pick your theme for each workspace mode.
                </p>
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex items-center gap-2">
                {(['home', 'focus', 'ambient'] as WorkspaceMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveModeTab(m)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                      activeModeTab === m
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {m} Mode
                  </button>
                ))}
              </div>

              {/* Custom Background Upload Section */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-semibold text-white">Custom Background</span>
                  </div>
                  {customBackground && (
                    <button
                      onClick={() => setCustomBackground(null)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Reset to Theme
                    </button>
                  )}
                </div>

                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/20 hover:border-violet-500/50 rounded-xl cursor-pointer bg-black/20 hover:bg-black/40 transition-colors">
                  <span className="text-xs text-white/70">Click to upload JPG, PNG, WEBP, or MP4</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {customBackground && (
                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Overlay Dimming</span>
                      <input
                        type="range"
                        min="0"
                        max="0.8"
                        step="0.05"
                        value={customBackground.overlayOpacity}
                        onChange={(e) =>
                          setCustomBackground({
                            ...customBackground,
                            overlayOpacity: parseFloat(e.target.value),
                          })
                        }
                        className="w-36 accent-violet-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Category Filter Pills */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Theme Library
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(
                    [
                      'all',
                      'animated',
                      'gradients',
                      'scenic',
                      'urban',
                      'interior',
                    ] as ThemeCategory[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                        selectedCategory === cat
                          ? 'bg-white text-neutral-950 font-semibold shadow'
                          : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Theme Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredThemes.map((theme) => {
                    const isSelected = modeThemes[activeModeTab] === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setThemeForMode(activeModeTab, theme.id);
                          setCustomBackground(null);
                        }}
                        className={`group relative h-28 rounded-2xl overflow-hidden border text-left p-3 flex flex-col justify-end transition-all cursor-pointer ${
                          isSelected
                            ? 'border-violet-500 ring-2 ring-violet-500/40 shadow-xl'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        {/* Background Thumbnail */}
                        <div
                          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                          style={{
                            background: theme.gradient || 'linear-gradient(135deg, #09090b, #18181b)',
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                        {/* Title & Plus badge */}
                        <div className="relative z-10">
                          {theme.isPlus && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-600 text-white uppercase mb-1">
                              PLUS
                            </span>
                          )}
                          <span className="block text-xs font-semibold text-white drop-shadow">
                            {theme.name}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. CLOCK TAB */}
          {settingsTab === 'clock' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Clock & Greetings</h2>
                <p className="text-xs md:text-sm text-white/50 mt-1">
                  Customize the appearance of your clock, timer, and greetings.
                </p>
              </div>

              {/* User Name Customization */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider block">
                  Your Display Name
                </span>
                <input
                  type="text"
                  value={settings.userName}
                  onChange={(e) => settings.updateSettings({ userName: e.target.value })}
                  placeholder="Enter name"
                  className="w-full md:w-64 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Clock Format Previews */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider block">
                  Clock Format
                </span>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {(['12h', '24h'] as ClockFormat[]).map((fmt) => {
                    const isSel = settings.clockFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        onClick={() => settings.updateSettings({ clockFormat: fmt })}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSel
                            ? 'bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/30'
                            : 'bg-neutral-900/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl font-bold font-mono text-white block mb-1">
                          {fmt === '12h' ? '2:24' : '14:24'}
                        </span>
                        <span className="text-xs text-white/60">
                          {fmt === '12h' ? '12-hour Clock' : '24-hour Clock'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clock & Timer Size */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider block">
                  Clock & Timer Size
                </span>
                <div className="grid grid-cols-3 gap-3 max-w-lg">
                  {(['small', 'regular', 'huge'] as ClockSize[]).map((size) => {
                    const isSel = settings.clockSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => settings.updateSettings({ clockSize: size })}
                        className={`p-3 rounded-2xl border text-center transition-all capitalize cursor-pointer ${
                          isSel
                            ? 'bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/30'
                            : 'bg-neutral-900/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span
                          className={`font-bold font-mono text-white block mb-1 ${
                            size === 'small' ? 'text-lg' : size === 'regular' ? 'text-xl' : 'text-2xl'
                          }`}
                        >
                          2:24
                        </span>
                        <span className="text-xs text-white/60">{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles: Seconds, Dynamic Greetings, Greetings */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4 max-w-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Show clock seconds</span>
                    <span className="text-xs text-white/50">Detailed timestamp with seconds</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showClockSeconds}
                    onChange={(e) => settings.updateSettings({ showClockSeconds: e.target.checked })}
                    className="w-5 h-5 rounded accent-violet-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Dynamic greetings</span>
                    <span className="text-xs text-white/50">Good morning, afternoon, evening</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showDynamicGreetings}
                    onChange={(e) => settings.updateSettings({ showDynamicGreetings: e.target.checked })}
                    className="w-5 h-5 rounded accent-violet-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Show greetings</span>
                    <span className="text-xs text-white/50">Show dashboard greeting text</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showGreeting}
                    onChange={(e) => settings.updateSettings({ showGreeting: e.target.checked })}
                    className="w-5 h-5 rounded accent-violet-600"
                  />
                </div>
              </div>

              {/* Clock & Timer Font Styles (as seen in screenshot 7) */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider block">
                  Clock & Timer Font Style
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'default_bold', label: 'Default Bold', font: 'font-extrabold font-sans' },
                    { id: 'default_light', label: 'Default Light', font: 'font-light font-sans' },
                    { id: 'soft', label: 'Soft', font: 'font-medium font-sans' },
                    { id: 'bubble', label: 'Bubble', font: 'font-black italic font-display' },
                    { id: 'minimal_light', label: 'Minimal Light', font: 'font-thin font-sans tracking-widest' },
                    { id: 'minimal', label: 'Minimal', font: 'font-normal font-sans' },
                    { id: 'serif', label: 'Serif', font: 'font-serif italic' },
                    { id: 'mono', label: 'Mono', font: 'font-mono font-bold' },
                    { id: 'italic', label: 'Italic', font: 'italic font-bold font-sans' },
                  ].map((styleItem) => {
                    const isSel = settings.clockStyle === styleItem.id;
                    return (
                      <button
                        key={styleItem.id}
                        onClick={() => settings.updateSettings({ clockStyle: styleItem.id as ClockStyle })}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSel
                            ? 'bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/30'
                            : 'bg-neutral-900/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className={`text-2xl text-white block mb-1 ${styleItem.font}`}>
                          12:24
                        </span>
                        <span className="text-xs text-white/60">{styleItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. FOCUS TIMER TAB */}
          {settingsTab === 'timer' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Focus Timer</h2>
                <p className="text-xs md:text-sm text-white/50 mt-1">
                  Adjust timer durations, auto-start behavior, and alerts.
                </p>
              </div>

              {/* Durations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-1">
                  <span className="text-xs text-white/60 font-medium">Focus Duration</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={timerSettings.focusDuration}
                      onChange={(e) =>
                        updateTimerSettings({ focusDuration: Number(e.target.value) || 25 })
                      }
                      className="w-20 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-base focus:outline-none"
                    />
                    <span className="text-sm text-white/50">minutes</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-1">
                  <span className="text-xs text-white/60 font-medium">Short Break</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={timerSettings.shortBreakDuration}
                      onChange={(e) =>
                        updateTimerSettings({ shortBreakDuration: Number(e.target.value) || 5 })
                      }
                      className="w-20 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-base focus:outline-none"
                    />
                    <span className="text-sm text-white/50">minutes</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-1">
                  <span className="text-xs text-white/60 font-medium">Long Break</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={timerSettings.longBreakDuration}
                      onChange={(e) =>
                        updateTimerSettings({ longBreakDuration: Number(e.target.value) || 15 })
                      }
                      className="w-20 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-base focus:outline-none"
                    />
                    <span className="text-sm text-white/50">minutes</span>
                  </div>
                </div>
              </div>

              {/* Alert Sound Selection */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Completion Alert Sound
                  </span>
                  <button
                    onClick={() => playAlertSound(timerSettings.alertSound, timerSettings.alertVolume)}
                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Sound</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: 'bell', label: 'Zen Meditation Bell' },
                    { id: 'singing_bowl', label: 'Singing Bowl' },
                    { id: 'marimba', label: 'Wooden Marimba' },
                    { id: 'gentle_chime', label: 'Wind Chime' },
                    { id: 'digital', label: 'Digital Beep' },
                    { id: 'none', label: 'Mute (Silent)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        updateTimerSettings({ alertSound: s.id as any });
                        playAlertSound(s.id as any, timerSettings.alertVolume);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs text-left border transition-all ${
                        timerSettings.alertSound === s.id
                          ? 'bg-violet-950/40 border-violet-500 text-white font-semibold'
                          : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-start & Wake lock */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Auto-start Breaks</span>
                    <span className="text-xs text-white/50">Immediately begin break when focus session ends</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={timerSettings.autoStartBreaks}
                    onChange={(e) => updateTimerSettings({ autoStartBreaks: e.target.checked })}
                    className="w-5 h-5 rounded accent-violet-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Auto-start Focus</span>
                    <span className="text-xs text-white/50">Immediately begin next focus session when break ends</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={timerSettings.autoStartFocus}
                    onChange={(e) => updateTimerSettings({ autoStartFocus: e.target.checked })}
                    className="w-5 h-5 rounded accent-violet-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Screen Wake Lock</span>
                    <span className="text-xs text-white/50">Keep your display awake while timer is running</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={timerSettings.keepAwake}
                    onChange={(e) => updateTimerSettings({ keepAwake: e.target.checked })}
                    className="w-5 h-5 rounded accent-violet-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Browser Notifications</span>
                    <span className="text-xs text-white/50">Show native alert when sessions finish</span>
                  </div>
                  <button
                    onClick={handleRequestNotification}
                    className="px-3 py-1 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-colors"
                  >
                    {settings.notificationsEnabled ? 'Enabled' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. STATS TAB (as shown in screenshots 8 & 9) */}
          {settingsTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Focus Stats</h2>
                  <p className="text-xs md:text-sm text-white/50 mt-1">
                    Refine your workflow with insights into your productivity patterns.
                  </p>
                </div>
                {/* Period Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
                  {(['today', 'week', 'month', 'all'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setStatsPeriod(p)}
                      className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                        statsPeriod === p ? 'bg-violet-600 text-white font-medium' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colorful Stat Cards Grid (just like in screenshot 8) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Current Streak */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                    <span className="font-semibold">Current Streak</span>
                    <Flame className="w-4 h-4 fill-white text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {metrics.currentStreak} days
                  </div>
                </div>

                {/* Focus Time */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                    <span className="font-semibold">Focus Time</span>
                    <Zap className="w-4 h-4 fill-white text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {Math.round(metrics.todayFocusSeconds / 60)}m
                  </div>
                  <span className="text-[11px] text-white/70 block mt-1">↑ Steady Flow</span>
                </div>

                {/* Focus Score */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                    <span className="font-semibold">Focus Score</span>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {metrics.focusScore}
                  </div>
                  <span className="text-[10px] text-white/70 block mt-1 truncate">
                    {metrics.focusScoreInsight}
                  </span>
                </div>

                {/* Tasks Completed */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                    <span className="font-semibold">Tasks Completed</span>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {metrics.todayTasksCompletedCount}
                  </div>
                </div>

                {/* Sessions */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                    <span className="font-semibold">Sessions</span>
                    <Timer className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {metrics.todaySessionsCount}
                  </div>
                </div>

                {/* Break Time */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                    <span className="font-semibold">Break Time</span>
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {Math.round(metrics.todayBreakSeconds / 60)}m
                  </div>
                </div>
              </div>

              {/* Focus Trend Chart (screenshot 9) */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider block">
                  Focus Trend (Minutes / Day)
                </span>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyChartData}>
                      <defs>
                        <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="displayDate"
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="focusMinutes"
                        stroke="#a855f7"
                        strokeWidth={2.5}
                        fill="url(#focusGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Focus Calendar Heatmap (screenshot 8) */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Focus Calendar Heatmap (Last 90 Days)
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-white/50">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded bg-white/5" />
                    <span className="w-2.5 h-2.5 rounded bg-violet-900/40" />
                    <span className="w-2.5 h-2.5 rounded bg-violet-600/70" />
                    <span className="w-2.5 h-2.5 rounded bg-violet-400" />
                    <span>More</span>
                  </div>
                </div>

                <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
                  {heatmapData.map((cell, idx) => {
                    const intensityColors = [
                      'bg-white/5',
                      'bg-violet-950/60 border border-violet-800/30',
                      'bg-violet-700/60',
                      'bg-violet-500',
                      'bg-violet-400 shadow-sm shadow-violet-400/50',
                    ];
                    return (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-sm ${intensityColors[cell.intensity]}`}
                        title={`${cell.date}: ${cell.focusMinutes} minutes`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. QUOTES TAB */}
          {settingsTab === 'quotes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Quotes</h2>
                <p className="text-xs md:text-sm text-white/50 mt-1">
                  Choose inspirational quote categories for your top bar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4 max-w-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Show Quotes on Dashboard</span>
                  <input
                    type="checkbox"
                    checked={settings.showQuotes}
                    onChange={(e) => settings.updateSettings({ showQuotes: e.target.checked })}
                    className="w-5 h-5 rounded accent-violet-600"
                  />
                </div>

                <div>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-2">
                    Quote Category
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'all', label: 'All Categories' },
                      { id: 'focus', label: 'Focus & Deep Work' },
                      { id: 'stoicism', label: 'Stoicism & Discipline' },
                      { id: 'calm', label: 'Calm & Stillness' },
                      { id: 'creativity', label: 'Creativity & Flow' },
                      { id: 'motivation', label: 'Motivation' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => settings.updateSettings({ quoteCategory: cat.id as any })}
                        className={`p-2.5 rounded-xl text-xs text-left border transition-all ${
                          settings.quoteCategory === cat.id
                            ? 'bg-violet-950/40 border-violet-500 text-white font-medium'
                            : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. SHORTCUTS TAB */}
          {settingsTab === 'shortcuts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Keyboard Shortcuts</h2>
                <p className="text-xs md:text-sm text-white/50 mt-1">
                  Navigate and control Aetheris with minimal friction.
                </p>
              </div>

              <div className="max-w-lg space-y-2">
                {[
                  { key: 'Space', desc: 'Start or Pause Focus Timer' },
                  { key: 'R', desc: 'Reset current timer phase' },
                  { key: 'N', desc: 'Skip to next timer phase' },
                  { key: 'F', desc: 'Toggle Fullscreen Mode' },
                  { key: 'S', desc: 'Toggle Soundscape Mixer' },
                  { key: 'M', desc: 'Toggle Lo-Fi Ambient Music' },
                  { key: 'T', desc: 'Open Focus Task Drawer' },
                  { key: '1 / 2 / 3', desc: 'Switch Workspace (Home / Focus / Ambient)' },
                  { key: '⌘K / Ctrl+K', desc: 'Open Global Command Palette' },
                  { key: 'Esc', desc: 'Close any open drawer or modal' },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-white/10"
                  >
                    <span className="text-xs text-white/80">{s.desc}</span>
                    <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20 text-xs font-mono text-white">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. ACCOUNT TAB */}
          {settingsTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Account & Sync</h2>
                <p className="text-xs md:text-sm text-white/50 mt-1">
                  Aetheris is local-first by default. Your data never leaves your browser.
                </p>
              </div>

              <div className="max-w-lg p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white block">Membership Status</span>
                    <span className="text-xs text-violet-400">
                      {settings.isPlusMember ? 'Aetheris Plus Active' : 'Free Standard Member'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      settings.updateSettings({ isPlusMember: !settings.isPlusMember });
                      addToast(
                        settings.isPlusMember ? 'Switched to Free tier' : 'Plus unlocked for preview!',
                        'success'
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-md cursor-pointer"
                  >
                    {settings.isPlusMember ? 'Switch to Free' : 'Upgrade to Plus'}
                  </button>
                </div>

                <div className="text-xs text-white/60 leading-relaxed border-t border-white/10 pt-4 space-y-2">
                  <p>✓ All timers, soundscapes, and tasks work 100% offline.</p>
                  <p>✓ No tracking or intrusive telemetry.</p>
                  <p>✓ Prepared for future cloud synchronization & cross-device backup.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
