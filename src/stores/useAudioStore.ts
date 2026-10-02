import { create } from 'zustand';
import { SoundscapePreset, SoundTrack } from '../types/sound';
import { DEFAULT_SOUND_TRACKS, INITIAL_SOUNDSCAPE_PRESETS } from '../data/sounds';
import { loadFromStorage, saveToStorage } from '../lib/storage';
import { soundEngine } from '../lib/soundEngine';

const PRESETS_STORAGE_KEY = 'aetheris_sound_presets_v1';
const AUDIO_TRACKS_KEY = 'aetheris_audio_tracks_v1';

interface AudioStore {
  tracks: SoundTrack[];
  presets: SoundscapePreset[];
  masterVolume: number;
  isMuted: boolean;

  // Music Player
  isMusicPlaying: boolean;
  musicVolume: number;
  currentSongTitle: string;
  currentSongArtist: string;

  toggleTrack: (id: string) => void;
  setTrackVolume: (id: string, vol: number) => void;
  setMasterVolume: (vol: number) => void;
  toggleMasterMute: () => void;
  stopAllSounds: () => void;

  // Presets
  activatePreset: (presetId: string) => void;
  saveCurrentAsPreset: (name: string, description?: string) => void;
  deletePreset: (presetId: string) => void;

  // Music
  toggleMusic: () => void;
  setMusicVolume: (vol: number) => void;
  nextMusicTrack: () => void;
}

const LOFI_TRACKS = [
  { title: 'Rainy Twilight in Shinjuku', artist: 'Komorebi Sound Lab' },
  { title: 'Midnight Tea & Warm Vinyl', artist: 'Aetheris Lounge' },
  { title: 'Velvet Clouds Over Kyoto', artist: 'Sora Lofi' },
  { title: 'Autumn Leaves & Still Waters', artist: 'Zenith Ensemble' },
];

export const useAudioStore = create<AudioStore>((set, get) => {
  const initialPresets = loadFromStorage<SoundscapePreset[]>(PRESETS_STORAGE_KEY, INITIAL_SOUNDSCAPE_PRESETS);
  const savedTracks = loadFromStorage<SoundTrack[]>(AUDIO_TRACKS_KEY, DEFAULT_SOUND_TRACKS);

  // Ensure all tracks start paused on page load
  const cleanTracks = savedTracks.map((t) => ({ ...t, isPlaying: false }));

  let lofiIdx = 0;

  return {
    tracks: cleanTracks,
    presets: initialPresets,
    masterVolume: 0.8,
    isMuted: false,

    isMusicPlaying: false,
    musicVolume: 0.6,
    currentSongTitle: LOFI_TRACKS[0].title,
    currentSongArtist: LOFI_TRACKS[0].artist,

    toggleTrack: (id) => {
      const state = get();
      const target = state.tracks.find((t) => t.id === id);
      if (!target) return;

      const nextPlaying = !target.isPlaying;

      if (nextPlaying) {
        soundEngine.startTrack(target.id, target.synthType, target.volume);
      } else {
        soundEngine.stopTrack(target.id);
      }

      const updated = state.tracks.map((t) => (t.id === id ? { ...t, isPlaying: nextPlaying } : t));
      set({ tracks: updated });
      saveToStorage(AUDIO_TRACKS_KEY, updated);
    },

    setTrackVolume: (id, vol) => {
      soundEngine.setTrackVolume(id, vol);
      set((state) => {
        const updated = state.tracks.map((t) => (t.id === id ? { ...t, volume: vol } : t));
        saveToStorage(AUDIO_TRACKS_KEY, updated);
        return { tracks: updated };
      });
    },

    setMasterVolume: (vol) => {
      soundEngine.setMasterVolume(vol);
      set({ masterVolume: vol });
    },

    toggleMasterMute: () => {
      const nextMuted = !get().isMuted;
      soundEngine.setMute(nextMuted);
      set({ isMuted: nextMuted });
    },

    stopAllSounds: () => {
      soundEngine.stopAll();
      set((state) => ({
        tracks: state.tracks.map((t) => ({ ...t, isPlaying: false })),
        isMusicPlaying: false,
      }));
    },

    activatePreset: (presetId) => {
      const state = get();
      const preset = state.presets.find((p) => p.id === presetId);
      if (!preset) return;

      // Stop current sounds
      soundEngine.stopAll();

      const activeIds = new Map(preset.tracks.map((t) => [t.id, t.volume]));

      const updatedTracks = state.tracks.map((track) => {
        if (activeIds.has(track.id)) {
          const vol = activeIds.get(track.id)!;
          soundEngine.startTrack(track.id, track.synthType, vol);
          return { ...track, isPlaying: true, volume: vol };
        } else {
          return { ...track, isPlaying: false };
        }
      });

      set({ tracks: updatedTracks });
      saveToStorage(AUDIO_TRACKS_KEY, updatedTracks);
    },

    saveCurrentAsPreset: (name, description) => {
      const state = get();
      const activeTracks = state.tracks.filter((t) => t.isPlaying).map((t) => ({ id: t.id, volume: t.volume }));

      if (activeTracks.length === 0) return;

      const newPreset: SoundscapePreset = {
        id: `preset-${Date.now()}`,
        name: name.trim() || 'My Atmosphere',
        description: description || 'Custom ambient blend',
        tracks: activeTracks,
      };

      const updated = [newPreset, ...state.presets];
      set({ presets: updated });
      saveToStorage(PRESETS_STORAGE_KEY, updated);
    },

    deletePreset: (presetId) => {
      set((state) => {
        const updated = state.presets.filter((p) => p.id !== presetId);
        saveToStorage(PRESETS_STORAGE_KEY, updated);
        return { presets: updated };
      });
    },

    toggleMusic: () => {
      const state = get();
      const nextPlaying = !state.isMusicPlaying;

      if (nextPlaying) {
        soundEngine.startMusic(state.musicVolume);
      } else {
        soundEngine.stopMusic();
      }

      set({ isMusicPlaying: nextPlaying });
    },

    setMusicVolume: (vol) => {
      soundEngine.setMusicVolume(vol);
      set({ musicVolume: vol });
    },

    nextMusicTrack: () => {
      lofiIdx = (lofiIdx + 1) % LOFI_TRACKS.length;
      const next = LOFI_TRACKS[lofiIdx];
      set({ currentSongTitle: next.title, currentSongArtist: next.artist });
    },
  };
});
