import { GeoLocation, WeatherData, AirQualityData } from '../types/weather';

export const POPULAR_CITIES: GeoLocation[] = [
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', country_code: 'JP', admin1: 'Tokyo' },
  { name: 'Miami', latitude: 25.7617, longitude: -80.1918, country: 'United States', country_code: 'US', admin1: 'Florida' },
  { name: 'Mumbai', latitude: 19.076, longitude: 72.8777, country: 'India', country_code: 'IN', admin1: 'Maharashtra' },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', country_code: 'GB', admin1: 'England' },
  { name: 'New York', latitude: 40.7128, longitude: -74.006, country: 'United States', country_code: 'US', admin1: 'New York' },
  { name: 'Manila', latitude: 14.5995, longitude: 120.9842, country: 'Philippines', country_code: 'PH', admin1: 'Metro Manila' },
  { name: 'Dhaka', latitude: 23.8103, longitude: 90.4125, country: 'Bangladesh', country_code: 'BD', admin1: 'Dhaka Division' },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia', country_code: 'AU', admin1: 'New South Wales' },
  { name: 'Dubai', latitude: 25.2048, longitude: 55.2708, country: 'United Arab Emirates', country_code: 'AE', admin1: 'Dubai' },
  { name: 'Houston', latitude: 29.7604, longitude: -95.3698, country: 'United States', country_code: 'US', admin1: 'Texas' }
];

export async function searchCities(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=10&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      country_code: item.country_code || '',
      admin1: item.admin1 || '',
      timezone: item.timezone || 'auto',
    }));
  } catch (error) {
    console.warn('Geocoding search failed:', error);
    // Filter local popular cities as fallback
    const q = query.toLowerCase();
    return POPULAR_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }
}

export async function fetchWeatherData(location: GeoLocation): Promise<WeatherData> {
  const { latitude, longitude } = location;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto`;

  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&timezone=auto`;

  const [weatherRes, airRes] = await Promise.allSettled([
    fetch(weatherUrl),
    fetch(airQualityUrl)
  ]);

  if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
    throw new Error('Failed to retrieve meteorological data for this location');
  }

  const weatherJson = await weatherRes.value.json();

  let airQuality: AirQualityData | undefined;
  if (airRes.status === 'fulfilled' && airRes.value.ok) {
    try {
      const airJson = await airRes.value.json();
      if (airJson.current) {
        airQuality = {
          us_aqi: airJson.current.us_aqi,
          european_aqi: airJson.current.european_aqi,
          pm2_5: airJson.current.pm2_5,
          pm10: airJson.current.pm10,
          ozone: airJson.current.ozone,
          nitrogen_dioxide: airJson.current.nitrogen_dioxide,
          sulphur_dioxide: airJson.current.sulphur_dioxide,
        };
      }
    } catch {
      // Non-blocking
    }
  }

  return {
    location,
    current: {
      time: weatherJson.current.time,
      temperature: weatherJson.current.temperature_2m,
      apparent_temperature: weatherJson.current.apparent_temperature,
      relative_humidity: weatherJson.current.relative_humidity_2m,
      is_day: weatherJson.current.is_day,
      precipitation: weatherJson.current.precipitation,
      rain: weatherJson.current.rain,
      showers: weatherJson.current.showers,
      snowfall: weatherJson.current.snowfall,
      weather_code: weatherJson.current.weather_code,
      cloud_cover: weatherJson.current.cloud_cover,
      pressure_msl: weatherJson.current.pressure_msl,
      surface_pressure: weatherJson.current.surface_pressure,
      wind_speed_10m: weatherJson.current.wind_speed_10m,
      wind_direction_10m: weatherJson.current.wind_direction_10m,
      wind_gusts_10m: weatherJson.current.wind_gusts_10m,
    },
    hourly: {
      time: weatherJson.hourly.time.slice(0, 24),
      temperature_2m: weatherJson.hourly.temperature_2m.slice(0, 24),
      precipitation_probability: weatherJson.hourly.precipitation_probability.slice(0, 24),
      precipitation: weatherJson.hourly.precipitation.slice(0, 24),
      weather_code: weatherJson.hourly.weather_code.slice(0, 24),
      wind_speed_10m: weatherJson.hourly.wind_speed_10m.slice(0, 24),
      wind_gusts_10m: weatherJson.hourly.wind_gusts_10m.slice(0, 24),
    },
    daily: {
      time: weatherJson.daily.time,
      weather_code: weatherJson.daily.weather_code,
      temperature_2m_max: weatherJson.daily.temperature_2m_max,
      temperature_2m_min: weatherJson.daily.temperature_2m_min,
      apparent_temperature_max: weatherJson.daily.apparent_temperature_max,
      apparent_temperature_min: weatherJson.daily.apparent_temperature_min,
      sunrise: weatherJson.daily.sunrise,
      sunset: weatherJson.daily.sunset,
      uv_index_max: weatherJson.daily.uv_index_max,
      precipitation_sum: weatherJson.daily.precipitation_sum,
      rain_sum: weatherJson.daily.rain_sum,
      precipitation_probability_max: weatherJson.daily.precipitation_probability_max,
      wind_speed_10m_max: weatherJson.daily.wind_speed_10m_max,
      wind_gusts_10m_max: weatherJson.daily.wind_gusts_10m_max,
    },
    airQuality,
  };
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<GeoLocation> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Detected Location';
      const country = addr.country || '';
      const country_code = (addr.country_code || 'US').toUpperCase();
      const admin1 = addr.state || addr.region || '';
      return {
        name: cityName,
        latitude,
        longitude,
        country,
        country_code,
        admin1,
      };
    }
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
  }

  return {
    name: 'Current Location',
    latitude,
    longitude,
    country: '',
    country_code: '',
  };
}

export function getWeatherConditionInfo(code: number, isDay: number = 1): {
  label: string;
  category: 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';
  severity: 'low' | 'moderate' | 'high' | 'severe';
} {
  switch (code) {
    case 0:
      return { label: isDay ? 'Clear Sky' : 'Clear Night', category: 'clear', severity: 'low' };
    case 1:
      return { label: 'Mainly Clear', category: 'clear', severity: 'low' };
    case 2:
      return { label: 'Partly Cloudy', category: 'cloudy', severity: 'low' };
    case 3:
      return { label: 'Overcast', category: 'cloudy', severity: 'low' };
    case 45:
      return { label: 'Foggy', category: 'fog', severity: 'moderate' };
    case 48:
      return { label: 'Depositing Rime Fog', category: 'fog', severity: 'moderate' };
    case 51:
      return { label: 'Light Drizzle', category: 'drizzle', severity: 'low' };
    case 53:
      return { label: 'Moderate Drizzle', category: 'drizzle', severity: 'moderate' };
    case 55:
      return { label: 'Dense Drizzle', category: 'drizzle', severity: 'moderate' };
    case 56:
    case 57:
      return { label: 'Freezing Drizzle', category: 'drizzle', severity: 'high' };
    case 61:
      return { label: 'Slight Rain', category: 'rain', severity: 'low' };
    case 63:
      return { label: 'Moderate Rain', category: 'rain', severity: 'moderate' };
    case 65:
      return { label: 'Heavy Torrential Rain', category: 'rain', severity: 'high' };
    case 66:
    case 67:
      return { label: 'Freezing Rain', category: 'rain', severity: 'high' };
    case 71:
      return { label: 'Slight Snowfall', category: 'snow', severity: 'moderate' };
    case 73:
      return { label: 'Moderate Snowfall', category: 'snow', severity: 'high' };
    case 75:
      return { label: 'Heavy Snow Blizzard', category: 'snow', severity: 'severe' };
    case 77:
      return { label: 'Snow Grains', category: 'snow', severity: 'moderate' };
    case 80:
      return { label: 'Slight Rain Showers', category: 'rain', severity: 'low' };
    case 81:
      return { label: 'Moderate Showers', category: 'rain', severity: 'moderate' };
    case 82:
      return { label: 'Violent Cloudburst Showers', category: 'rain', severity: 'severe' };
    case 85:
      return { label: 'Slight Snow Showers', category: 'snow', severity: 'moderate' };
    case 86:
      return { label: 'Heavy Snow Showers', category: 'snow', severity: 'severe' };
    case 95:
      return { label: 'Severe Thunderstorm', category: 'storm', severity: 'severe' };
    case 96:
      return { label: 'Thunderstorm with Slight Hail', category: 'storm', severity: 'severe' };
    case 99:
      return { label: 'Violent Thunderstorm & Severe Hail', category: 'storm', severity: 'severe' };
    default:
      return { label: 'Variable Conditions', category: 'cloudy', severity: 'low' };
  }
}
