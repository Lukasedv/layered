import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ActivitySelector } from './components/ActivitySelector';
import { WeatherDisplay } from './components/WeatherDisplay';
import { ClothingRecommendation } from './components/ClothingRecommendation';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather } from './hooks/useWeather';
import { useRecommendations } from './hooks/useRecommendations';
import type { Activity } from './types';

function App() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const { location, loading: locationLoading, error: locationError, getLocation } = useGeolocation();
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(location);
  const { recommendation, loading: recLoading, error: recError, getRecommendation } = useRecommendations();

  // Auto-fetch location on mount
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Auto-fetch recommendations when activity and weather are available
  useEffect(() => {
    if (selectedActivity && weather) {
      getRecommendation(selectedActivity, weather);
    }
  }, [selectedActivity, weather, getRecommendation]);

  const isLoading = locationLoading || weatherLoading;
  const error = locationError || weatherError || recError;

  return (
    <Layout>
      <div className="space-y-4">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
            {locationError && (
              <button
                onClick={getLocation}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <LoadingSpinner 
            message={locationLoading ? 'Getting your location...' : 'Fetching weather data...'} 
          />
        )}

        {/* Weather Display */}
        {weather && !weatherLoading && (
          <WeatherDisplay weather={weather} />
        )}

        {/* Activity Selector */}
        <ActivitySelector
          selectedActivity={selectedActivity}
          onSelect={setSelectedActivity}
          disabled={!weather}
        />

        {/* Recommendations Loading */}
        {recLoading && (
          <LoadingSpinner message="Getting clothing recommendations..." />
        )}

        {/* Recommendations */}
        {recommendation && !recLoading && selectedActivity && (
          <ClothingRecommendation recommendation={recommendation} />
        )}

        {/* Empty State */}
        {!selectedActivity && weather && !isLoading && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-4xl mb-2">👆</p>
            <p>Select an activity to get clothing recommendations</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
