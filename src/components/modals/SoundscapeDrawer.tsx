import React, { useState } from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import { useAppStore } from '../../stores/useAppStore';
import {
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Bookmark,
  Plus,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';

export const SoundscapeDrawer: React.FC = () => {
  const { soundscapeOpen, setSoundscapeOpen, addToast } = useAppStore();
  const {
    tracks,
    presets,
    masterVolume,
    isMuted,
    toggleTrack,
    setTrackVolume,
    setMasterVolume,
    toggleMasterMute,
    stopAllSounds,
    activatePreset,
    saveCurrentAsPreset,
    deletePreset,
  } = useAudioStore();

  const [newPresetName, setNewPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  if (!soundscapeOpen) return null;

  const activeCount = tracks.filter((t) => t.isPlaying).length;

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    saveCurrentAsPreset(newPresetName.trim());
    setNewPresetName('');
    setIsSavingPreset(false);
    addToast('Soundscape preset saved', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none">
      <div className="flex-1" onClick={() => setSoundscapeOpen(false)} />

      <div className="w-full max-w-md h-full bg-neutral-950/95 border-l border-white/10 p-6 flex flex-col shadow-2xl backdrop-blur-2xl overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Soundscape Mixer</h2>
          </div>
          <button
            onClick={() => setSoundscapeOpen(false)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Controls */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 my-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Master Volume
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMasterMute}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              {activeCount > 0 && (
                <button
                  onClick={stopAllSounds}
                  className="px-2 py-1 rounded-md text-[11px] font-medium text-white/60 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  Stop All
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-mono text-white/50 w-8 text-right">
              {Math.round((isMuted ? 0 : masterVolume) * 100)}%
            </span>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Sound Presets
            </span>
            {activeCount > 0 && (
              <button
                onClick={() => setIsSavingPreset(!isSavingPreset)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Save Mix</span>
              </button>
            )}
          </div>

          {isSavingPreset && (
            <form onSubmit={handleSavePreset} className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Preset name (e.g. Late Night Code)"
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white whitespace-nowrap"
              >
                Save
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="group flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-all"
              >
                <button
                  onClick={() => activatePreset(preset.id)}
                  className="hover:text-white"
                  title={preset.description || preset.name}
                >
                  {preset.name}
                </button>
                {preset.id.startsWith('preset-') && (
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Audio Tracks List */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1">
            Sound Library
          </span>

          {tracks.map((track) => (
            <div
              key={track.id}
              className={`p-3 rounded-2xl border transition-all ${
                track.isPlaying
                  ? 'bg-indigo-950/40 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                  : 'bg-neutral-900/40 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/90">{track.name}</span>
                <button
                  onClick={() => toggleTrack(track.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    track.isPlaying
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                  }`}
                  title={track.isPlaying ? 'Pause' : 'Play'}
                >
                  {track.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) => setTrackVolume(track.id, parseFloat(e.target.value))}
                  disabled={!track.isPlaying}
                  className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-opacity ${
                    track.isPlaying ? 'bg-white/20' : 'bg-white/5 opacity-40'
                  }`}
                />
                <span className="text-[11px] font-mono text-white/40 w-8 text-right">
                  {Math.round(track.volume * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
