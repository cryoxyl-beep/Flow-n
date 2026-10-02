import { SoundTrack, SoundscapePreset } from '../types/sound';

export const DEFAULT_SOUND_TRACKS: SoundTrack[] = [
  // Nature
  {
    id: 'rain',
    name: 'Gentle Rain',
    category: 'nature',
    volume: 0.5,
    isPlaying: false,
    synthType: 'rain',
  },
  {
    id: 'thunder',
    name: 'Distant Thunder',
    category: 'nature',
    volume: 0.4,
    isPlaying: false,
    synthType: 'thunder',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    category: 'nature',
    volume: 0.5,
    isPlaying: false,
    synthType: 'ocean',
  },
  {
    id: 'wind',
    name: 'Forest Wind',
    category: 'nature',
    volume: 0.4,
    isPlaying: false,
    synthType: 'wind',
  },

  // Environment & Cozy
  {
    id: 'cafe',
    name: 'Cafe Ambience',
    category: 'environment',
    volume: 0.35,
    isPlaying: false,
    synthType: 'cafe',
  },
  {
    id: 'fire',
    name: 'Fireplace Hearth',
    category: 'cozy',
    volume: 0.45,
    isPlaying: false,
    synthType: 'fire',
  },
  {
    id: 'vinyl',
    name: 'Vinyl Needle Static',
    category: 'cozy',
    volume: 0.25,
    isPlaying: false,
    synthType: 'vinyl',
  },

  // Noise & Focus
  {
    id: 'brown_noise',
    name: 'Deep Brown Noise',
    category: 'noise',
    volume: 0.35,
    isPlaying: false,
    synthType: 'brown_noise',
  },
  {
    id: 'pink_noise',
    name: 'Pink Noise',
    category: 'noise',
    volume: 0.3,
    isPlaying: false,
    synthType: 'pink_noise',
  },
  {
    id: 'white_noise',
    name: 'White Noise',
    category: 'noise',
    volume: 0.25,
    isPlaying: false,
    synthType: 'white_noise',
  },
  {
    id: 'binaural_432',
    name: 'Binaural 432Hz Focus',
    category: 'focus',
    volume: 0.4,
    isPlaying: false,
    synthType: 'binaural_432',
  },
  {
    id: 'singing_bowl',
    name: 'Tibetan Singing Bowl',
    category: 'focus',
    volume: 0.35,
    isPlaying: false,
    synthType: 'singing_bowl',
  },
];

export const INITIAL_SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'deep_work',
    name: 'Deep Work Immersion',
    description: 'Rain + Brown Noise for intense focus',
    tracks: [
      { id: 'rain', volume: 0.6 },
      { id: 'brown_noise', volume: 0.35 },
    ],
  },
  {
    id: 'cozy_cafe_study',
    name: 'Cozy Rainy Cafe',
    description: 'Rain + Cafe + Soft Vinyl',
    tracks: [
      { id: 'rain', volume: 0.5 },
      { id: 'cafe', volume: 0.4 },
      { id: 'vinyl', volume: 0.2 },
    ],
  },
  {
    id: 'warm_fireplace',
    name: 'Night Hearth & Wind',
    description: 'Cracking Fire + Forest Wind',
    tracks: [
      { id: 'fire', volume: 0.55 },
      { id: 'wind', volume: 0.3 },
    ],
  },
  {
    id: 'zen_sanctuary',
    name: 'Zen Sanctuary',
    description: 'Ocean Waves + Singing Bowl',
    tracks: [
      { id: 'ocean', volume: 0.5 },
      { id: 'singing_bowl', volume: 0.35 },
    ],
  },
  {
    id: 'theta_state',
    name: '432Hz Cognitive Flow',
    description: 'Binaural beats with subtle rain',
    tracks: [
      { id: 'binaural_432', volume: 0.5 },
      { id: 'rain', volume: 0.3 },
    ],
  },
];
