import { useState, useEffect, useCallback } from 'react';
import type { WeatherData, Location } from '../types';
import { fetchWeather } from '../services/api';

interface UseWeatherResult {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeather(location: Location | null): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWeather(location);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { weather, loading, error, refetch: fetchData };
}
