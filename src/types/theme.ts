export type ThemeCategory = 
  | 'all'
  | 'gradients'
  | 'animated'
  | 'scenic'
  | 'nature'
  | 'urban'
  | 'interior'
  | 'abstract';

export type BackgroundType = 'gradient' | 'canvas' | 'image' | 'video';

export interface ThemeItem {
  id: string;
  name: string;
  category: ThemeCategory;
  type: BackgroundType;
  gradient?: string;
  canvasType?: 'rain' | 'aurora' | 'starfield' | 'ripples' | 'particles';
  imageUrl?: string;
  videoUrl?: string;
  overlayOpacity?: number; // 0 to 1
  accentColor: string;
  isPlus?: boolean;
}

export type WorkspaceMode = 'home' | 'focus' | 'ambient';

export interface ModeThemes {
  home: string;     // theme id
  focus: string;    // theme id
  ambient: string;  // theme id
}

export interface CustomBackgroundConfig {
  url: string;
  type: 'image' | 'video';
  brightness: number; // 0.2 to 1.5
  contrast: number;   // 0.5 to 1.5
  blur: number;       // 0 to 20px
  overlayOpacity: number; // 0 to 0.9
}
