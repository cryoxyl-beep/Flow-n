export type SoundCategory = 'nature' | 'environment' | 'cozy' | 'noise' | 'focus';

export interface SoundTrack {
  id: string;
  name: string;
  category: SoundCategory;
  volume: number; // 0 to 1
  isPlaying: boolean;
  synthType: 
    | 'rain'
    | 'thunder'
    | 'ocean'
    | 'wind'
    | 'fire'
    | 'cafe'
    | 'vinyl'
    | 'white_noise'
    | 'pink_noise'
    | 'brown_noise'
    | 'binaural_432'
    | 'singing_bowl';
}

export interface SoundscapePreset {
  id: string;
  name: string;
  description?: string;
  tracks: { id: string; volume: number }[];
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  durationSeconds: number;
}
