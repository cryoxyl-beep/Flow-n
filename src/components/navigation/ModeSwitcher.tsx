import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { WorkspaceMode } from '../../types/theme';
import { Home, Lightbulb, Cloud } from 'lucide-react';

export const ModeSwitcher: React.FC = () => {
  const mode = useAppStore((state) => state.mode);
  const setMode = useAppStore((state) => state.setMode);

  const modes: { id: WorkspaceMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'focus', label: 'Focus', icon: Lightbulb },
    { id: 'ambient', label: 'Ambient', icon: Cloud },
  ];

  return (
    <nav className="flex items-center gap-1.5 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
      {modes.map((item) => {
        const Icon = item.icon;
        const isActive = mode === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none ${
              isActive
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title={`Switch to ${item.label} Mode`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
