// Local development server that mimics Azure Functions API
// This allows development without Azure Functions Core Tools

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from api/local.settings.json
import { readFileSync } from 'fs';
const localSettings = JSON.parse(
  readFileSync(join(__dirname, 'api', 'local.settings.json'), 'utf-8')
);
const OPENWEATHERMAP_API_KEY = localSettings.Values.OPENWEATHERMAP_API_KEY;

const app = express();
app.use(cors());
app.use(express.json());

// Weather endpoint
app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat or lon query parameters' });
  }

  if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'your_api_key_here') {
    return res.status(500).json({ error: 'Weather service not configured. Add your API key to api/local.settings.json' });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        console.log('API key not yet active - using mock data');
        // Return mock data while API key activates
        return res.json({
          temperature: 12,
          feelsLike: 9,
          humidity: 65,
          windSpeed: 15,
          precipitation: 'none',
          description: 'partly cloudy (mock data)',
          icon: '02d',
        });
      }
      throw new Error(`Weather API returned ${response.status}: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();

    const getPrecipitation = (weatherMain) => {
      const main = weatherMain.toLowerCase();
      if (main.includes('rain') || main.includes('drizzle') || main.includes('thunderstorm')) {
        return 'rain';
      }
      if (main.includes('snow') || main.includes('sleet')) {
        return 'snow';
      }
      return 'none';
    };

    const weather = {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      precipitation: getPrecipitation(data.weather[0]?.main || ''),
      description: data.weather[0]?.description || 'Unknown',
      icon: data.weather[0]?.icon || '01d',
    };

    res.json(weather);
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Recommendations endpoint
app.post('/api/recommendations', (req, res) => {
  const { activity, weather } = req.body;

  const validActivities = ['running', 'cycling', 'skiing', 'hiking', 'walking'];

  if (!activity || !validActivities.includes(activity)) {
    return res.status(400).json({ error: 'Invalid or missing activity' });
  }

  if (!weather || typeof weather.temperature !== 'number') {
    return res.status(400).json({ error: 'Invalid or missing weather data' });
  }

  const recommendation = getRecommendation(activity, weather);
  res.json(recommendation);
});

// Recommendation engine (copied from api/src/shared/recommendationEngine.ts)
const activityConfigs = {
  running: { intensity: 'high', tempAdjustment: 10 },
  cycling: { intensity: 'high', tempAdjustment: 5 },
  skiing: { intensity: 'medium', tempAdjustment: 5 },
  hiking: { intensity: 'medium', tempAdjustment: 7 },
  walking: { intensity: 'low', tempAdjustment: 3 },
};

function getEffectiveTemp(weather, activity) {
  const config = activityConfigs[activity];
  const windChill = weather.windSpeed > 10 ? (weather.windSpeed - 10) * 0.3 : 0;
  return weather.feelsLike + config.tempAdjustment - windChill;
}

function getBaseLayer(effectiveTemp) {
  if (effectiveTemp < 5) {
    return { type: 'base', item: 'Thermal base layer', reason: 'Insulation and moisture management in cold conditions' };
  } else if (effectiveTemp < 15) {
    return { type: 'base', item: 'Long-sleeve moisture-wicking shirt', reason: 'Temperature regulation and sweat management' };
  } else if (effectiveTemp < 22) {
    return { type: 'base', item: 'Short-sleeve moisture-wicking shirt', reason: 'Keeps you cool and dry' };
  } else {
    return { type: 'base', item: 'Lightweight breathable tank or tee', reason: 'Maximum ventilation in warm weather' };
  }
}

function getMidLayer(effectiveTemp) {
  if (effectiveTemp < 0) {
    return { type: 'mid', item: 'Insulated fleece or down jacket', reason: 'Critical warmth in freezing temperatures' };
  } else if (effectiveTemp < 10) {
    return { type: 'mid', item: 'Lightweight fleece or softshell', reason: 'Additional warmth without bulk' };
  }
  return null;
}

function getOuterLayer(effectiveTemp, weather) {
  if (weather.precipitation === 'rain') {
    return { type: 'outer', item: 'Waterproof rain jacket', reason: 'Protection from rain' };
  } else if (weather.precipitation === 'snow') {
    return { type: 'outer', item: 'Insulated waterproof jacket', reason: 'Warmth and snow protection' };
  } else if (weather.windSpeed > 25) {
    return { type: 'outer', item: 'Windbreaker', reason: 'Protection from strong winds' };
  } else if (effectiveTemp < 10 && weather.windSpeed > 15) {
    return { type: 'outer', item: 'Light windbreaker', reason: 'Wind protection in cool conditions' };
  }
  return null;
}

function getAccessories(effectiveTemp, weather, activity) {
  const accessories = [];
  const icon = weather.icon || '01d';
  if (effectiveTemp < 5) accessories.push('Warm beanie or ear warmers');
  else if (icon.includes('d') && effectiveTemp > 15) accessories.push('Cap or visor for sun protection');
  if (effectiveTemp < 0) accessories.push('Insulated gloves');
  else if (effectiveTemp < 10) accessories.push(activity === 'cycling' ? 'Cycling gloves' : 'Light gloves');
  if (activity === 'skiing') accessories.push('Ski goggles');
  else if (activity === 'cycling' || (icon.includes('d') && effectiveTemp > 10)) accessories.push('Sunglasses');
  if (activity === 'running' && effectiveTemp < 5) accessories.push('Neck gaiter');
  if ((activity === 'running' || activity === 'walking') && icon.includes('d')) accessories.push('Sunscreen');
  if (weather.precipitation !== 'none') accessories.push('Waterproof phone pouch');
  return accessories;
}

function getTips(effectiveTemp, weather, activity) {
  const tips = [];
  const config = activityConfigs[activity];
  if (config.intensity === 'high' && effectiveTemp < 15) tips.push("Start slightly cold - you'll warm up within 10 minutes");
  if (weather.precipitation === 'rain') tips.push('Consider water-resistant footwear');
  if (effectiveTemp > 25) tips.push('Hydrate frequently and take breaks in shade');
  if (weather.windSpeed > 20) tips.push('Plan your route to have wind at your back on the return');
  if (activity === 'cycling' && effectiveTemp < 10) tips.push('Bring an extra layer for descents when you cool down');
  if (activity === 'skiing') tips.push('Layer to easily adjust as conditions change');
  if (weather.humidity > 80 && effectiveTemp > 20) tips.push('High humidity - pace yourself and stay hydrated');
  return tips;
}

function getRecommendation(activity, weather) {
  const effectiveTemp = getEffectiveTemp(weather, activity);
  const layers = [];

  const base = getBaseLayer(effectiveTemp);
  if (base) layers.push(base);

  const mid = getMidLayer(effectiveTemp);
  if (mid) layers.push(mid);

  const outer = getOuterLayer(effectiveTemp, weather);
  if (outer) layers.push(outer);

  // Bottom layer
  if (effectiveTemp < 5) {
    layers.push({ type: 'base', item: 'Thermal tights or insulated pants', reason: 'Leg warmth in cold conditions' });
  } else if (effectiveTemp < 15 && activity !== 'cycling') {
    layers.push({ type: 'base', item: 'Running tights or long pants', reason: 'Comfortable for cool temperatures' });
  } else {
    layers.push({ type: 'base', item: activity === 'cycling' ? 'Cycling shorts or bibs' : 'Athletic shorts', reason: 'Freedom of movement and breathability' });
  }

  return {
    layers,
    accessories: getAccessories(effectiveTemp, weather, activity),
    tips: getTips(effectiveTemp, weather, activity),
  };
}

const PORT = 7071;
app.listen(PORT, () => {
  console.log(`✓ Local API server running at http://localhost:${PORT}`);
  console.log(`  - GET  /api/weather?lat=...&lon=...`);
  console.log(`  - POST /api/recommendations`);
});
