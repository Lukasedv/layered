import type { WeatherData } from '../types';

interface WeatherDisplayProps {
  weather: WeatherData;
}

function getWeatherEmoji(icon: string): string {
  const iconMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '🌨️', '13n': '🌨️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return iconMap[icon] || '🌡️';
}

export function WeatherDisplay({ weather }: WeatherDisplayProps) {
  return (
    <div className="w-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">Current Weather</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{Math.round(weather.temperature)}°</span>
            <span className="text-lg opacity-80">C</span>
          </div>
          <p className="text-sm opacity-90 mt-1">Feels like {Math.round(weather.feelsLike)}°</p>
        </div>
        <div className="text-center">
          <span className="text-5xl">{getWeatherEmoji(weather.icon)}</span>
          <p className="text-sm mt-1 capitalize">{weather.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20">
        <div className="text-center">
          <p className="text-xs opacity-75">Wind</p>
          <p className="font-semibold">{Math.round(weather.windSpeed)} km/h</p>
        </div>
        <div className="text-center">
          <p className="text-xs opacity-75">Humidity</p>
          <p className="font-semibold">{weather.humidity}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs opacity-75">Precipitation</p>
          <p className="font-semibold capitalize">{weather.precipitation}</p>
        </div>
      </div>
    </div>
  );
}
