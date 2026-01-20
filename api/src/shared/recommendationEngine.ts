import type { Activity, WeatherData, Recommendation, ClothingItem } from './types';

interface ActivityConfig {
  intensity: 'high' | 'medium' | 'low';
  tempAdjustment: number; // How much warmer you feel due to activity
}

const activityConfigs: Record<Activity, ActivityConfig> = {
  running: { intensity: 'high', tempAdjustment: 10 },
  cycling: { intensity: 'high', tempAdjustment: 5 },
  skiing: { intensity: 'medium', tempAdjustment: 5 },
  hiking: { intensity: 'medium', tempAdjustment: 7 },
  walking: { intensity: 'low', tempAdjustment: 3 },
};

function getEffectiveTemp(weather: WeatherData, activity: Activity): number {
  const config = activityConfigs[activity];
  // Wind chill effect
  const windChill = weather.windSpeed > 10 ? (weather.windSpeed - 10) * 0.3 : 0;
  return weather.feelsLike + config.tempAdjustment - windChill;
}

function getBaseLayer(effectiveTemp: number): ClothingItem | null {
  if (effectiveTemp < 5) {
    return {
      type: 'base',
      item: 'Thermal base layer',
      reason: 'Insulation and moisture management in cold conditions',
    };
  } else if (effectiveTemp < 15) {
    return {
      type: 'base',
      item: 'Long-sleeve moisture-wicking shirt',
      reason: 'Temperature regulation and sweat management',
    };
  } else if (effectiveTemp < 22) {
    return {
      type: 'base',
      item: 'Short-sleeve moisture-wicking shirt',
      reason: 'Keeps you cool and dry',
    };
  } else {
    return {
      type: 'base',
      item: 'Lightweight breathable tank or tee',
      reason: 'Maximum ventilation in warm weather',
    };
  }
}

function getMidLayer(effectiveTemp: number): ClothingItem | null {
  if (effectiveTemp < 0) {
    return {
      type: 'mid',
      item: 'Insulated fleece or down jacket',
      reason: 'Critical warmth in freezing temperatures',
    };
  } else if (effectiveTemp < 10) {
    return {
      type: 'mid',
      item: 'Lightweight fleece or softshell',
      reason: 'Additional warmth without bulk',
    };
  }
  return null;
}

function getOuterLayer(effectiveTemp: number, weather: WeatherData): ClothingItem | null {
  if (weather.precipitation === 'rain') {
    return {
      type: 'outer',
      item: 'Waterproof rain jacket',
      reason: 'Protection from rain',
    };
  } else if (weather.precipitation === 'snow') {
    return {
      type: 'outer',
      item: 'Insulated waterproof jacket',
      reason: 'Warmth and snow protection',
    };
  } else if (weather.windSpeed > 25) {
    return {
      type: 'outer',
      item: 'Windbreaker',
      reason: 'Protection from strong winds',
    };
  } else if (effectiveTemp < 10 && weather.windSpeed > 15) {
    return {
      type: 'outer',
      item: 'Light windbreaker',
      reason: 'Wind protection in cool conditions',
    };
  }
  return null;
}

function getAccessories(effectiveTemp: number, weather: WeatherData, activity: Activity): string[] {
  const accessories: string[] = [];

  // Head
  if (effectiveTemp < 5) {
    accessories.push('Warm beanie or ear warmers');
  } else if (weather.icon.includes('d') && effectiveTemp > 15) {
    accessories.push('Cap or visor for sun protection');
  }

  // Hands
  if (effectiveTemp < 0) {
    accessories.push('Insulated gloves');
  } else if (effectiveTemp < 10) {
    accessories.push(activity === 'cycling' ? 'Cycling gloves' : 'Light gloves');
  }

  // Eyes
  if (activity === 'skiing') {
    accessories.push('Ski goggles');
  } else if (activity === 'cycling' || (weather.icon.includes('d') && effectiveTemp > 10)) {
    accessories.push('Sunglasses');
  }

  // Activity-specific
  if (activity === 'running' && effectiveTemp < 5) {
    accessories.push('Neck gaiter');
  }
  if ((activity === 'running' || activity === 'walking') && weather.icon.includes('d')) {
    accessories.push('Sunscreen');
  }
  if (weather.precipitation !== 'none') {
    accessories.push('Waterproof phone pouch');
  }

  return accessories;
}

function getTips(effectiveTemp: number, weather: WeatherData, activity: Activity): string[] {
  const tips: string[] = [];
  const config = activityConfigs[activity];

  if (config.intensity === 'high' && effectiveTemp < 15) {
    tips.push("Start slightly cold - you'll warm up within 10 minutes");
  }

  if (weather.precipitation === 'rain') {
    tips.push('Consider water-resistant footwear');
  }

  if (effectiveTemp > 25) {
    tips.push('Hydrate frequently and take breaks in shade');
  }

  if (weather.windSpeed > 20) {
    tips.push('Plan your route to have wind at your back on the return');
  }

  if (activity === 'cycling' && effectiveTemp < 10) {
    tips.push('Bring an extra layer for descents when you cool down');
  }

  if (activity === 'skiing') {
    tips.push('Layer to easily adjust as conditions change');
  }

  if (weather.humidity > 80 && effectiveTemp > 20) {
    tips.push('High humidity - pace yourself and stay hydrated');
  }

  return tips;
}

export function getRecommendation(activity: Activity, weather: WeatherData): Recommendation {
  const effectiveTemp = getEffectiveTemp(weather, activity);
  
  const layers: ClothingItem[] = [];
  
  const base = getBaseLayer(effectiveTemp);
  if (base) layers.push(base);
  
  const mid = getMidLayer(effectiveTemp);
  if (mid) layers.push(mid);
  
  const outer = getOuterLayer(effectiveTemp, weather);
  if (outer) layers.push(outer);

  // Bottom layer
  if (effectiveTemp < 5) {
    layers.push({
      type: 'base',
      item: 'Thermal tights or insulated pants',
      reason: 'Leg warmth in cold conditions',
    });
  } else if (effectiveTemp < 15 && activity !== 'cycling') {
    layers.push({
      type: 'base',
      item: 'Running tights or long pants',
      reason: 'Comfortable for cool temperatures',
    });
  } else {
    layers.push({
      type: 'base',
      item: activity === 'cycling' ? 'Cycling shorts or bibs' : 'Athletic shorts',
      reason: 'Freedom of movement and breathability',
    });
  }

  return {
    layers,
    accessories: getAccessories(effectiveTemp, weather, activity),
    tips: getTips(effectiveTemp, weather, activity),
  };
}
