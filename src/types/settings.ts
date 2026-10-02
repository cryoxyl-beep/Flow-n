export type ClockFormat = '12h' | '24h';
export type ClockSize = 'small' | 'regular' | 'huge';
export type ClockStyle = 
  | 'default_bold' 
  | 'default_light' 
  | 'soft' 
  | 'bubble' 
  | 'minimal_light' 
  | 'minimal' 
  | 'serif' 
  | 'mono' 
  | 'italic';

export interface AppSettings {
  userName: string;
  showGreeting: boolean;
  showDynamicGreetings: boolean;
  clockFormat: ClockFormat;
  clockSize: ClockSize;
  clockStyle: ClockStyle;
  showClockSeconds: boolean;
  showDate: boolean;
  
  // Quotes
  showQuotes: boolean;
  quoteCategory: 'all' | 'focus' | 'stoicism' | 'creativity' | 'calm' | 'motivation';
  
  // Daily Intention
  dailyIntention: string;
  dailyIntentionDate: string; // YYYY-MM-DD
  showDailyIntention: boolean;

  // Visuals & Motion
  reducedMotion: boolean;
  highContrast: boolean;
  animationIntensity: 'subtle' | 'normal' | 'rich';

  // Audio
  masterVolume: number; // 0 to 1
  soundscapeVolume: number;
  musicVolume: number;

  // Notification & Alerts
  notificationsEnabled: boolean;
  timerCompletionAlert: boolean;

  // Plan entitlement simulation
  isPlusMember: boolean;
}
