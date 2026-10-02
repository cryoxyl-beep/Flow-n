import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useTimerStore } from '../stores/useTimerStore';
import { useAudioStore } from '../stores/useAudioStore';

export function useKeyboardShortcuts() {
  const {
    settingsOpen,
    setSettingsOpen,
    soundscapeOpen,
    setSoundscapeOpen,
    musicPlayerOpen,
    setMusicPlayerOpen,
    taskDrawerOpen,
    setTaskDrawerOpen,
    commandPaletteOpen,
    setCommandPaletteOpen,
    toggleFullscreen,
    setMode,
    addToast,
  } = useAppStore();

  const { isRunning, startTimer, pauseTimer, resetTimer, skipPhase } = useTimerStore();
  const { toggleMusic } = useAudioStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when user is typing inside an input, textarea, or select
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      // Command Palette (Cmd+K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      // Escape key closes modals
      if (e.key === 'Escape') {
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
        else if (soundscapeOpen) setSoundscapeOpen(false);
        else if (musicPlayerOpen) setMusicPlayerOpen(false);
        else if (taskDrawerOpen) setTaskDrawerOpen(false);
        return;
      }

      // Spacebar: Play/Pause timer
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
          pauseTimer();
          addToast('Timer paused', 'info');
        } else {
          startTimer();
          addToast('Timer started', 'info');
        }
        return;
      }

      // R: Reset timer
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetTimer();
        addToast('Timer reset', 'info');
        return;
      }

      // N: Skip phase
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        skipPhase();
        addToast('Phase skipped', 'info');
        return;
      }

      // F: Fullscreen
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // S: Soundscape
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        setSoundscapeOpen(!soundscapeOpen);
        return;
      }

      // M: Music
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMusic();
        return;
      }

      // T: Tasks
      if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTaskDrawerOpen(!taskDrawerOpen);
        return;
      }

      // 1, 2, 3: Modes
      if (e.key === '1') {
        setMode('home');
      } else if (e.key === '2') {
        setMode('focus');
      } else if (e.key === '3') {
        setMode('ambient');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    commandPaletteOpen,
    settingsOpen,
    soundscapeOpen,
    musicPlayerOpen,
    taskDrawerOpen,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase,
    toggleFullscreen,
    toggleMusic,
    setMode,
    addToast,
    setCommandPaletteOpen,
    setSettingsOpen,
    setSoundscapeOpen,
    setMusicPlayerOpen,
    setTaskDrawerOpen,
  ]);
}
