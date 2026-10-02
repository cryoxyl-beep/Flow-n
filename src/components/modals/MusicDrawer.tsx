import React from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import { useAppStore } from '../../stores/useAppStore';
import { Music, Play, Pause, SkipForward, Volume2, X, Radio, Disc } from 'lucide-react';

export const MusicDrawer: React.FC = () => {
  const { musicPlayerOpen, setMusicPlayerOpen } = useAppStore();
  const {
    isMusicPlaying,
    musicVolume,
    currentSongTitle,
    currentSongArtist,
    toggleMusic,
    setMusicVolume,
    nextMusicTrack,
  } = useAudioStore();

  if (!musicPlayerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none">
      <div className="flex-1" onClick={() => setMusicPlayerOpen(false)} />

      <div className="w-full max-w-md h-full bg-neutral-950/95 border-l border-white/10 p-6 flex flex-col shadow-2xl backdrop-blur-2xl overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Lo-Fi Ambient Music</h2>
          </div>
          <button
            onClick={() => setMusicPlayerOpen(false)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vinyl / Record Artwork Simulation */}
        <div className="my-8 flex flex-col items-center text-center">
          <div className="relative w-44 h-44 rounded-full bg-neutral-900 border-4 border-neutral-800 shadow-2xl flex items-center justify-center mb-5 overflow-hidden">
            {/* Spinning groove effect */}
            <div
              className={`absolute inset-0 rounded-full border-8 border-neutral-800/80 ${
                isMusicPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '6s' }}
            />
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg">
              <Disc className="w-8 h-8 text-white/90" />
            </div>
          </div>

          <h3 className="text-base font-semibold text-white drop-shadow truncate max-w-xs">
            {currentSongTitle}
          </h3>
          <p className="text-xs text-white/50 mt-1">{currentSongArtist}</p>
        </div>

        {/* Player Controls */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={toggleMusic}
              className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
            >
              {isMusicPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={nextMusicTrack}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Music Volume */}
          <div className="flex items-center gap-3 pt-2">
            <Volume2 className="w-4 h-4 text-white/50" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-mono text-white/50 w-8 text-right">
              {Math.round(musicVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Embed External Stream Note */}
        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 space-y-2">
          <div className="flex items-center gap-2 text-white/80 font-medium">
            <Music className="w-3.5 h-3.5 text-indigo-400" />
            <span>Harmonic Procedural Synthesis</span>
          </div>
          <p className="leading-relaxed">
            Our music player synthesizes warm Lo-Fi jazz/rhodes chords directly via the browser Web Audio API, ensuring zero network buffering and complete offline relaxation.
          </p>
        </div>
      </div>
    </div>
  );
};
