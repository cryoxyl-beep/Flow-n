import React, { useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { INITIAL_QUOTES } from '../../data/quotes';
import { Command, Sparkles } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const TopBar: React.FC = () => {
  const showQuotes = useSettingsStore((state) => state.showQuotes);
  const quoteCategory = useSettingsStore((state) => state.quoteCategory);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const mode = useAppStore((state) => state.mode);

  const [quoteIndex, setQuoteIndex] = useState(0);

  const filteredQuotes = INITIAL_QUOTES.filter(
    (q) => quoteCategory === 'all' || q.category === quoteCategory
  );
  const currentQuote = filteredQuotes[quoteIndex % filteredQuotes.length] || INITIAL_QUOTES[0];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % filteredQuotes.length);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 select-none pointer-events-auto">
      {/* Zone 1: Clean Brand Wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-white/90 hover:text-white transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight font-sans">
            Aetheris
          </span>
        </div>
      </div>

      {/* Zone 2: Command Palette Trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/10 text-xs text-white/60 hover:text-white hover:bg-black/40 transition-all shadow-sm"
        title="Open Command Palette (Ctrl+K or Cmd+K)"
      >
        <Command className="w-3.5 h-3.5 text-white/50" />
        <span>Search actions & modes</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-white/80">
          ⌘K
        </kbd>
      </button>

      {/* Zone 3: Rotating Quote (clickable to cycle) */}
      <div className="flex items-center">
        {showQuotes && mode !== 'ambient' ? (
          <button
            onClick={handleNextQuote}
            className="group max-w-xs md:max-w-md text-right text-xs md:text-sm font-light text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Click to see next quote"
          >
            <span className="italic block truncate">
              "{currentQuote.text}"
            </span>
            <span className="text-[11px] text-white/40 block mt-0.5 group-hover:text-white/60 transition-colors">
              — {currentQuote.author}
            </span>
          </button>
        ) : (
          <div />
        )}
      </div>
    </header>
  );
};
