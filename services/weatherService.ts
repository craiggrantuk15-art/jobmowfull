export interface WeatherData {
  date: string;
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Storm';
  rainChance: number;
}

export const getLocalWeather = (): WeatherData[] => {
  // Mock forecast starting from today
  // In a real app, this would fetch from OpenWeatherMap or similar
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

    return {
      date: date.toISOString().split('T')[0],
      temp: 18 + Math.floor(Math.random() * 5), // Random temp between 18-22
      condition,
      rainChance
    };
  });
};