import React from 'react';
import { useAppStore } from './stores/useAppStore';
import { BackgroundLayer } from './components/background/BackgroundLayer';
import { TopBar } from './components/navigation/TopBar';
import { BottomBar } from './components/navigation/BottomBar';
import { HomeView } from './features/home/HomeView';
import { FocusView } from './features/focus/FocusView';
import { AmbientView } from './features/ambient/AmbientView';
import { TaskDrawer } from './components/modals/TaskDrawer';
import { SoundscapeDrawer } from './components/modals/SoundscapeDrawer';
import { MusicDrawer } from './components/modals/MusicDrawer';
import { SettingsModal } from './components/modals/SettingsModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const mode = useAppStore((state) => state.mode);

  // Initialize global shortcuts (Space, R, F, S, M, T, 1/2/3, ⌘K)
  useKeyboardShortcuts();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100 select-none">
      {/* 1. Atmospheric Theme & Canvas Background */}
      <BackgroundLayer />

      {/* 2. Top Navigation Bar (Brand, Command trigger, Quote) */}
      <TopBar />

      {/* 3. Primary Workspace Views */}
      <main className="relative z-10 w-full h-full flex flex-col justify-center">
        {mode === 'home' && <HomeView />}
        {mode === 'focus' && <FocusView />}
        {mode === 'ambient' && <AmbientView />}
      </main>

      {/* 4. Bottom Controls Bar */}
      <BottomBar />

      {/* 5. Drawers and Modals */}
      <TaskDrawer />
      <SoundscapeDrawer />
      <MusicDrawer />
      <SettingsModal />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
