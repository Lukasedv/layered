import type { Activity, WeatherData, Recommendation, ClothingItem } from './types';

// Temperature and weather calculation constants
const WIND_CHILL_THRESHOLD_KMH = 10;
const WIND_CHILL_FACTOR = 0.4;
const HIGH_HUMIDITY_THRESHOLD = 70;
const WARM_TEMP_THRESHOLD = 20;
const HUMIDITY_HEAT_ADJUSTMENT = -2;
const HUMIDITY_COLD_ADJUSTMENT = 1;
const HIGH_INTENSITY_TEMP_ADJUSTMENT = -3;

interface ActivityConfig {
  intensity: 'high' | 'medium' | 'low';
  tempAdjustment: number; // How much warmer you feel due to activity
  sweatFactor: number; // How much you sweat (affects moisture-wicking needs)
  exposureLevel: 'high' | 'medium' | 'low'; // Sun/weather exposure level
}

const activityConfigs: Record<Activity, ActivityConfig> = {
  running: { intensity: 'high', tempAdjustment: 10, sweatFactor: 1.5, exposureLevel: 'high' },
  cycling: { intensity: 'high', tempAdjustment: 5, sweatFactor: 1.3, exposureLevel: 'high' },
  skiing: { intensity: 'medium', tempAdjustment: 5, sweatFactor: 1.0, exposureLevel: 'high' },
  hiking: { intensity: 'medium', tempAdjustment: 7, sweatFactor: 1.2, exposureLevel: 'medium' },
  walking: { intensity: 'low', tempAdjustment: 3, sweatFactor: 0.8, exposureLevel: 'low' },
};

function getEffectiveTemp(weather: WeatherData, activity: Activity): number {
  const config = activityConfigs[activity];
  // Wind chill effect - more pronounced at higher wind speeds
  const windChill = weather.windSpeed > WIND_CHILL_THRESHOLD_KMH 
    ? (weather.windSpeed - WIND_CHILL_THRESHOLD_KMH) * WIND_CHILL_FACTOR 
    : 0;
  // Humidity makes heat feel worse and cold feel colder
  const humidityEffect = weather.humidity > HIGH_HUMIDITY_THRESHOLD 
    ? (weather.temperature > WARM_TEMP_THRESHOLD ? HUMIDITY_HEAT_ADJUSTMENT : HUMIDITY_COLD_ADJUSTMENT)
    : 0;
  return weather.feelsLike + config.tempAdjustment - windChill - humidityEffect;
}

function getBaseLayer(effectiveTemp: number, activity: Activity, weather: WeatherData): ClothingItem | null {
  const config = activityConfigs[activity];
  const needsHighMoistureWicking = config.sweatFactor > 1.0 || weather.humidity > 60;
  
  if (effectiveTemp < -5) {
    return {
      type: 'base',
      item: 'Heavy-weight merino wool base layer',
      reason: 'Maximum insulation and moisture management in extreme cold',
    };
  } else if (effectiveTemp < 5) {
    return {
      type: 'base',
      item: activity === 'skiing' ? 'Ski-specific thermal base layer' : 'Thermal base layer',
      reason: 'Insulation and moisture management in cold conditions',
    };
  } else if (effectiveTemp < 12) {
    return {
      type: 'base',
      item: needsHighMoistureWicking 
        ? 'Long-sleeve technical moisture-wicking shirt'
        : 'Long-sleeve athletic shirt',
      reason: 'Temperature regulation and sweat management',
    };
  } else if (effectiveTemp < 18) {
    return {
      type: 'base',
      item: needsHighMoistureWicking
        ? 'Short-sleeve moisture-wicking technical shirt'
        : 'Short-sleeve athletic shirt',
      reason: 'Keeps you cool and dry',
    };
  } else if (effectiveTemp < 25) {
    return {
      type: 'base',
      item: activity === 'cycling' 
        ? 'Lightweight cycling jersey'
        : 'Lightweight breathable tank or tee',
      reason: 'Maximum ventilation in warm weather',
    };
  } else {
    return {
      type: 'base',
      item: activity === 'cycling'
        ? 'Mesh-panel cycling jersey'
        : 'Ultra-light mesh tank top',
      reason: 'Maximum airflow for hot conditions',
    };
  }
}

function getMidLayer(effectiveTemp: number, activity: Activity, weather: WeatherData): ClothingItem | null {
  // High-intensity activities need fewer mid layers
  const isHighIntensity = activityConfigs[activity].intensity === 'high';
  const tempThresholdAdjust = isHighIntensity ? HIGH_INTENSITY_TEMP_ADJUSTMENT : 0;
  
  if (effectiveTemp < -10 + tempThresholdAdjust) {
    return {
      type: 'mid',
      item: activity === 'skiing' 
        ? 'Insulated ski mid-layer or puffy jacket'
        : 'Heavy insulated fleece or down jacket',
      reason: 'Critical warmth in extreme cold',
    };
  } else if (effectiveTemp < 0 + tempThresholdAdjust) {
    return {
      type: 'mid',
      item: 'Insulated fleece or lightweight down jacket',
      reason: 'Critical warmth in freezing temperatures',
    };
  } else if (effectiveTemp < 8 + tempThresholdAdjust) {
    return {
      type: 'mid',
      item: activity === 'running' 
        ? 'Running-specific lightweight fleece vest'
        : 'Lightweight fleece or softshell',
      reason: 'Additional warmth without bulk',
    };
  } else if (effectiveTemp < 14 + tempThresholdAdjust && weather.windSpeed > 15) {
    return {
      type: 'mid',
      item: 'Thin fleece or quarter-zip pullover',
      reason: 'Light insulation layer for windy conditions',
    };
  }
  return null;
}

function getOuterLayer(effectiveTemp: number, weather: WeatherData, activity: Activity): ClothingItem | null {
  const isHighIntensity = activityConfigs[activity].intensity === 'high';
  
  if (weather.precipitation === 'rain') {
    if (isHighIntensity) {
      return {
        type: 'outer',
        item: activity === 'cycling' 
          ? 'Lightweight packable cycling rain jacket'
          : 'Breathable waterproof running jacket',
        reason: 'Rain protection with ventilation for high-intensity activity',
      };
    }
    return {
      type: 'outer',
      item: effectiveTemp < 10 
        ? 'Insulated waterproof jacket'
        : 'Waterproof rain jacket',
      reason: 'Protection from rain',
    };
  } else if (weather.precipitation === 'snow') {
    return {
      type: 'outer',
      item: activity === 'skiing'
        ? 'Ski shell jacket with powder skirt'
        : 'Insulated waterproof jacket',
      reason: 'Warmth and snow protection',
    };
  } else if (weather.windSpeed > 30) {
    return {
      type: 'outer',
      item: 'Heavy-duty windproof jacket',
      reason: 'Protection from strong winds',
    };
  } else if (weather.windSpeed > 20) {
    return {
      type: 'outer',
      item: activity === 'cycling'
        ? 'Cycling-specific windbreaker'
        : 'Windbreaker jacket',
      reason: 'Protection from moderate winds',
    };
  } else if (effectiveTemp < 8 && weather.windSpeed > 12) {
    return {
      type: 'outer',
      item: 'Light windbreaker or wind vest',
      reason: 'Wind protection in cool conditions',
    };
  } else if (effectiveTemp < 5 && activity !== 'running') {
    // Non-runners might want an outer layer even without wind
    return {
      type: 'outer',
      item: 'Light shell jacket',
      reason: 'Extra protection in cold temperatures',
    };
  }
  return null;
}

function getAccessories(effectiveTemp: number, weather: WeatherData, activity: Activity): string[] {
  const accessories: string[] = [];
  const isDaytime = weather.icon?.includes('d') ?? true;
  const config = activityConfigs[activity];

  // Head protection
  if (effectiveTemp < -5) {
    accessories.push('Balaclava or thermal face mask');
  } else if (effectiveTemp < 5) {
    accessories.push('Warm beanie or ear warmers');
  } else if (effectiveTemp < 12 && weather.windSpeed > 15) {
    accessories.push('Lightweight beanie or headband');
  } else if (isDaytime && effectiveTemp > 18 && config.exposureLevel !== 'low') {
    accessories.push('Breathable cap or visor for sun protection');
  }

  // Hands
  if (effectiveTemp < -10) {
    accessories.push('Insulated mittens or heavy gloves');
  } else if (effectiveTemp < 0) {
    accessories.push(activity === 'cycling' ? 'Thermal cycling gloves' : 'Insulated gloves');
  } else if (effectiveTemp < 8) {
    accessories.push(activity === 'cycling' ? 'Windproof cycling gloves' : 'Light gloves');
  } else if (activity === 'cycling' && effectiveTemp < 15) {
    accessories.push('Light cycling gloves');
  }

  // Eyes
  if (activity === 'skiing') {
    accessories.push('Ski goggles');
  } else if (activity === 'cycling') {
    accessories.push('Cycling glasses or sunglasses');
  } else if (isDaytime && config.exposureLevel === 'high' && weather.precipitation === 'none') {
    accessories.push('Sunglasses');
  }

  // Neck protection
  if (effectiveTemp < 0) {
    accessories.push('Neck gaiter or buff');
  } else if (effectiveTemp < 8 && (activity === 'running' || activity === 'cycling')) {
    accessories.push('Lightweight neck buff');
  }

  // Activity-specific gear
  if (activity === 'cycling') {
    if (effectiveTemp < 10) {
      accessories.push('Toe covers or overshoes');
    }
    if (weather.precipitation !== 'none') {
      accessories.push('Clear lens glasses for visibility');
    }
  }

  if (activity === 'skiing') {
    accessories.push('Helmet');
    if (effectiveTemp < 0) {
      accessories.push('Hand warmers');
    }
  }

  // Sun protection for exposed activities
  if (isDaytime && config.exposureLevel !== 'low' && weather.precipitation === 'none') {
    accessories.push('Sunscreen SPF 30+');
  }
  
  // Precipitation gear
  if (weather.precipitation !== 'none') {
    accessories.push('Waterproof phone pouch');
    if (activity === 'running' || activity === 'hiking') {
      accessories.push('Waterproof waist pack');
    }
  }

  // Visibility for low light
  if (!isDaytime && (activity === 'running' || activity === 'cycling')) {
    accessories.push('Reflective gear or vest');
    if (activity === 'running') {
      accessories.push('Headlamp or clip light');
    }
    if (activity === 'cycling') {
      accessories.push('Front and rear bike lights');
    }
  }

  return accessories;
}

function getTips(effectiveTemp: number, weather: WeatherData, activity: Activity): string[] {
  const tips: string[] = [];
  const config = activityConfigs[activity];
  const isDaytime = weather.icon?.includes('d') ?? true;

  // Temperature-related tips
  if (config.intensity === 'high' && effectiveTemp < 15) {
    tips.push("Start slightly cold - you'll warm up within 10 minutes of activity");
  }
  
  if (effectiveTemp < 0) {
    tips.push('Warm up indoors before heading out to prevent cold muscles');
  }

  if (effectiveTemp > 28) {
    tips.push('Hydrate before, during, and after - aim for 500ml per 30 minutes');
    tips.push('Consider early morning or evening to avoid peak heat');
  } else if (effectiveTemp > 22) {
    tips.push('Hydrate frequently and take breaks in shade');
  }

  // Precipitation tips
  if (weather.precipitation === 'rain') {
    tips.push('Consider water-resistant footwear');
    tips.push('Bring a small towel or extra socks');
    if (activity === 'cycling') {
      tips.push('Reduce speed on corners - wet surfaces are slippery');
    }
  }

  if (weather.precipitation === 'snow') {
    tips.push('Allow extra time - surfaces may be slippery');
    if (activity !== 'skiing') {
      tips.push('Consider trail shoes with good grip');
    }
  }

  // Wind tips
  if (weather.windSpeed > 25) {
    tips.push('Plan your route to have wind at your back on the return');
    if (activity === 'cycling') {
      tips.push('Be cautious of crosswinds, especially near open areas');
    }
  } else if (weather.windSpeed > 15) {
    tips.push('Start into the wind so you have it at your back when tired');
  }

  // Activity-specific tips
  if (activity === 'cycling') {
    if (effectiveTemp < 10) {
      tips.push('Bring an extra layer for descents when you cool down quickly');
    }
    if (effectiveTemp > 25) {
      tips.push('Freeze your water bottles for longer-lasting cold hydration');
    }
  }

  if (activity === 'skiing') {
    tips.push('Layer to easily adjust as conditions change throughout the day');
    if (effectiveTemp < -10) {
      tips.push('Take regular breaks in the lodge to warm up');
    }
  }

  if (activity === 'hiking') {
    tips.push('Pack an extra layer - mountain weather can change quickly');
    if (weather.precipitation !== 'none' || weather.windSpeed > 20) {
      tips.push('Check trail conditions before heading out');
    }
  }

  if (activity === 'running') {
    if (weather.humidity > 70 && effectiveTemp > 18) {
      tips.push('High humidity - reduce pace by 10-15% and listen to your body');
    }
    if (effectiveTemp < 5) {
      tips.push('Extend your warm-up routine in cold weather');
    }
  }

  // Humidity tips
  if (weather.humidity > 80 && effectiveTemp > 20) {
    tips.push('High humidity reduces sweat evaporation - pace yourself carefully');
  }

  // Time of day tips
  if (!isDaytime && (activity === 'running' || activity === 'cycling' || activity === 'walking')) {
    tips.push('Be visible - wear bright colors and reflective gear');
  }

  // Limit to most relevant tips (max 4)
  return tips.slice(0, 4);
}

export function getRecommendation(activity: Activity, weather: WeatherData): Recommendation {
  const effectiveTemp = getEffectiveTemp(weather, activity);
  
  const layers: ClothingItem[] = [];
  
  const base = getBaseLayer(effectiveTemp, activity, weather);
  if (base) layers.push(base);
  
  const mid = getMidLayer(effectiveTemp, activity, weather);
  if (mid) layers.push(mid);
  
  const outer = getOuterLayer(effectiveTemp, weather, activity);
  if (outer) layers.push(outer);

  // Bottom layer - activity-specific with better temperature ranges
  if (effectiveTemp < -5) {
    layers.push({
      type: 'base',
      item: activity === 'skiing' 
        ? 'Insulated ski pants'
        : 'Heavy thermal tights with wind-blocking front',
      reason: 'Maximum leg warmth in extreme cold',
    });
  } else if (effectiveTemp < 5) {
    layers.push({
      type: 'base',
      item: activity === 'skiing'
        ? 'Ski pants or insulated softshell pants'
        : activity === 'cycling'
          ? 'Thermal cycling tights'
          : 'Thermal tights or insulated pants',
      reason: 'Leg warmth in cold conditions',
    });
  } else if (effectiveTemp < 12) {
    layers.push({
      type: 'base',
      item: activity === 'cycling'
        ? 'Cycling tights or knee warmers with shorts'
        : activity === 'hiking'
          ? 'Hiking pants or convertible pants'
          : 'Running tights or long pants',
      reason: 'Comfortable for cool temperatures',
    });
  } else if (effectiveTemp < 18) {
    layers.push({
      type: 'base',
      item: activity === 'cycling'
        ? 'Cycling shorts or 3/4 length bibs'
        : activity === 'hiking'
          ? 'Light hiking pants or shorts'
          : 'Capri tights or light athletic pants',
      reason: 'Versatile for mild temperatures',
    });
  } else {
    layers.push({
      type: 'base',
      item: activity === 'cycling' 
        ? 'Cycling shorts or bibs' 
        : activity === 'hiking'
          ? 'Quick-dry hiking shorts'
          : 'Athletic shorts',
      reason: 'Freedom of movement and breathability',
    });
  }

  return {
    layers,
    accessories: getAccessories(effectiveTemp, weather, activity),
    tips: getTips(effectiveTemp, weather, activity),
  };
}
