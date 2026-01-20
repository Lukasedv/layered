export type Activity = 'running' | 'cycling' | 'skiing' | 'hiking' | 'walking';

export interface ActivityInfo {
  id: Activity;
  name: string;
  icon: string;
  intensity: 'high' | 'medium' | 'low';
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: 'none' | 'rain' | 'snow';
  description: string;
  icon: string;
}

export interface ClothingItem {
  type: 'base' | 'mid' | 'outer';
  item: string;
  reason: string;
}

export interface Recommendation {
  layers: ClothingItem[];
  accessories: string[];
  tips: string[];
}

export interface Location {
  lat: number;
  lon: number;
}

export type AppState = 'idle' | 'loading' | 'success' | 'error';
