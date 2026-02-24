import { BusinessSettings } from '../types';

export interface WeatherData {
  date: string;
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Storm';
  rainChance: number;
  windSpeed: number;
  humidity: number;
  mowabilityScore: number;
}

export const getLocalWeather = async (settings: BusinessSettings): Promise<WeatherData[] | null> => {
  const apiKey = settings.weatherApiKey;
  const city = settings.weatherCity;

  // Default thresholds if not set
  const maxRainChance = settings.mowabilityRainThreshold ?? 70;
  const maxWindSpeed = settings.mowabilityWindThreshold ?? 30;
  const minTemp = settings.mowabilityTempMin ?? 5;
  const maxTemp = settings.mowabilityTempMax ?? 30;

  // Fallback to null if no API key or city
  if (!apiKey || !city) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Weather API Error:', response.status, errorData.message || response.statusText);
      throw new Error(`Weather API request failed: ${response.status} ${errorData.message || ''}`);
    }

    const data = await response.json();

    // Group 3-hour forecasts by day
    const normalizedData: Record<string, {
      temps: number[];
      rainChances: number[];
      windSpeeds: number[];
      humidities: number[];
      conditions: string[];
      dt_txt: string;
    }> = {};

    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD

      if (!normalizedData[date]) {
        normalizedData[date] = {
          temps: [],
          rainChances: [],
          windSpeeds: [],
          humidities: [],
          conditions: [],
          dt_txt: item.dt_txt
        };
      }

      // Collect data for the day
      normalizedData[date].temps.push(item.main.temp);
      normalizedData[date].windSpeeds.push(item.wind.speed * 3.6); // Convert m/s to km/h
      normalizedData[date].humidities.push(item.main.humidity);

      // Rain chance (pop is 0-1)
      if (item.pop !== undefined) {
        normalizedData[date].rainChances.push(Math.round(item.pop * 100));
      } else {
        normalizedData[date].rainChances.push(0);
      }

      // Condition mapping
      const weatherId = item.weather[0].id;
      let condition = 'Sunny';
      if (weatherId >= 200 && weatherId < 300) condition = 'Storm';
      else if (weatherId >= 300 && weatherId < 600) condition = 'Rain';
      else if (weatherId >= 801) condition = 'Cloudy';

      normalizedData[date].conditions.push(condition);
    }

    // Convert grouped data to array of 5 daily forecasts
    const processedData: WeatherData[] = Object.keys(normalizedData).slice(0, 5).map(date => {
      const dayData = normalizedData[date];

      // Daily Aggregates
      const dayMaxTemp = Math.round(Math.max(...dayData.temps));
      const dayMaxRainChance = Math.max(...dayData.rainChances);
      const dayMaxWind = Math.round(Math.max(...dayData.windSpeeds));
      const dayAvgHumidity = Math.round(dayData.humidities.reduce((a, b) => a + b, 0) / dayData.humidities.length);

      // Determine dominant condition
      const conditionCounts: Record<string, number> = {};
      dayData.conditions.forEach(c => conditionCounts[c] = (conditionCounts[c] || 0) + 1);

      let dominantCondition: any = 'Sunny';
      let maxCount = 0;

      if (dayData.conditions.includes('Storm')) dominantCondition = 'Storm';
      else if (dayData.conditions.includes('Rain') && dayMaxRainChance > 40) dominantCondition = 'Rain';
      else {
        for (const c in conditionCounts) {
          if (conditionCounts[c] > maxCount) {
            maxCount = conditionCounts[c];
            dominantCondition = c;
          }
        }
      }

      // --- CALCULATE MOWABILITY SCORE ---
      let score = 100;

      // 1. Rain Penalty (Exponential decay)
      // If rain chance > threshold, massive penalty
      if (dayMaxRainChance > maxRainChance) {
        score -= 80; // Almost impossible
      } else {
        score -= dayMaxRainChance * 0.8;
      }

      // 2. Wind Penalty
      if (dayMaxWind > maxWindSpeed) {
        score -= (dayMaxWind - maxWindSpeed) * 2;
      }

      // 3. Temp Penalty (Too hot or too cold)
      if (dayMaxTemp < minTemp) {
        score -= (minTemp - dayMaxTemp) * 5;
      } else if (dayMaxTemp > maxTemp) {
        score -= (dayMaxTemp - maxTemp) * 3;
      }

      // 4. Ground saturation proxy (Previous rain + humidity)
      if (dayAvgHumidity > 90) score -= 10;

      // Clamp Score
      score = Math.max(0, Math.min(100, Math.round(score)));

      return {
        date,
        temp: dayMaxTemp,
        condition: dominantCondition,
        rainChance: dayMaxRainChance,
        windSpeed: dayMaxWind,
        humidity: dayAvgHumidity,
        mowabilityScore: score
      };
    });

    // Convert units if needed
    if (settings.temperatureUnit === 'F') {
      return processedData.map(day => ({
        ...day,
        temp: Math.round((day.temp * 9 / 5) + 32)
      }));
    }

    return processedData;

  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

const getMockWeather = (settings?: BusinessSettings): WeatherData[] => {
  const conditions: ('Sunny' | 'Cloudy' | 'Rain' | 'Storm')[] = ['Sunny', 'Cloudy', 'Sunny', 'Rain', 'Sunny'];
  const today = new Date();

  return Array.from({ length: 5 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Simple deterministic mock based on index
    const condition = conditions[i % conditions.length];
    let rainChance = 0;
    if (condition === 'Rain') rainChance = 80;
    if (condition === 'Storm') rainChance = 95;
    if (condition === 'Cloudy') rainChance = 20;

    const windSpeed = 10 + Math.floor(Math.random() * 20);
    const humidity = 60 + Math.floor(Math.random() * 30);
    const mowabilityScore = Math.max(0, 100 - rainChance - (windSpeed > 20 ? windSpeed - 20 : 0));

    let temp = 18 + Math.floor(Math.random() * 5); // Default Celsius
    if (settings?.temperatureUnit === 'F') {
      temp = Math.round((temp * 9 / 5) + 32);
    }

    return {
      date: date.toISOString().split('T')[0],
      temp,
      condition,
      rainChance,
      windSpeed,
      humidity,
      mowabilityScore
    };
  });
};