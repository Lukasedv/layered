import { useState, useCallback } from 'react';
import type { Recommendation, Activity, WeatherData } from '../types';
import { fetchRecommendations } from '../services/api';

interface UseRecommendationsResult {
  recommendation: Recommendation | null;
  loading: boolean;
  error: string | null;
  getRecommendation: (activity: Activity, weather: WeatherData) => Promise<void>;
}

export function useRecommendations(): UseRecommendationsResult {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendation = useCallback(async (activity: Activity, weather: WeatherData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchRecommendations(activity, weather);
      setRecommendation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  return { recommendation, loading, error, getRecommendation };
}
