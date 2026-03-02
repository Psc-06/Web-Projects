export interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

export interface SpotifyRecentTrack {
  name: string;
  artist: string;
  playedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  energyLevel: 'Low' | 'Medium' | 'High';
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FitnessData {
  steps: number;
  goal: number;
  distance: number;
  calories: number;
}

export interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

export type EnergyLevel = 'Low' | 'Medium' | 'High';
