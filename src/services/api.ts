import type { WeatherData, Recommendation, Activity, Location } from '../types';

const API_BASE = '/api';

export async function fetchWeather(location: Location): Promise<WeatherData> {
  const response = await fetch(
    `${API_BASE}/weather?lat=${location.lat}&lon=${location.lon}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  return response.json();
}

export async function fetchRecommendations(
  activity: Activity,
  weather: WeatherData
): Promise<Recommendation> {
  const response = await fetch(`${API_BASE}/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ activity, weather }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  return response.json();
}
