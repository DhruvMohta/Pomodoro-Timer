export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface TimerConfig {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  setsUntilLongBreak: number;
}

export interface Track {
  id: string;
  title: string;
  artist?: string;
  file?: File; // Optional because default tracks won't have a File object
  url: string;
  duration?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  isDefault?: boolean;
}