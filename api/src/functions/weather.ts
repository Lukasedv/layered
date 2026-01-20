import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import type { WeatherData } from "../shared/types";

interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    description: string;
    icon: string;
    main: string;
  }>;
}

function getPrecipitation(weatherMain: string): 'none' | 'rain' | 'snow' {
  const main = weatherMain.toLowerCase();
  if (main.includes('rain') || main.includes('drizzle') || main.includes('thunderstorm')) {
    return 'rain';
  }
  if (main.includes('snow') || main.includes('sleet')) {
    return 'snow';
  }
  return 'none';
}

async function weatherHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const lat = request.query.get('lat');
  const lon = request.query.get('lon');

  if (!lat || !lon) {
    return {
      status: 400,
      jsonBody: { error: 'Missing lat or lon query parameters' },
    };
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    context.log('OpenWeatherMap API key not configured');
    return {
      status: 500,
      jsonBody: { error: 'Weather service not configured' },
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

    const data: OpenWeatherResponse = await response.json();

    const weather: WeatherData = {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      precipitation: getPrecipitation(data.weather[0]?.main || ''),
      description: data.weather[0]?.description || 'Unknown',
      icon: data.weather[0]?.icon || '01d',
    };

    return {
      jsonBody: weather,
      headers: {
        'Cache-Control': 'public, max-age=900', // 15 minutes
      },
    };
  } catch (error) {
    context.error('Failed to fetch weather:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to fetch weather data' },
    };
  }
}

app.http('weather', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'weather',
  handler: weatherHandler,
});
