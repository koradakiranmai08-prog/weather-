/**
 * Weather & Hazard Alert Types
 */

export type AlertLevel = 'safe' | 'caution' | 'warning' | 'red_zone';

export type HazardType = 
  | 'none'
  | 'cyclone'
  | 'flood'
  | 'severe_storm'
  | 'extreme_heat'
  | 'extreme_cold'
  | 'high_wind'
  | 'hazardous_aqi';

export interface GeoLocation {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  apparent_temperature: number;
  relative_humidity: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface HourlyForecastData {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
}

export interface DailyForecastData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  rain_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
}

export interface AirQualityData {
  us_aqi?: number;
  european_aqi?: number;
  pm2_5?: number;
  pm10?: number;
  ozone?: number;
  nitrogen_dioxide?: number;
  sulphur_dioxide?: number;
}

export interface WeatherData {
  location: GeoLocation;
  current: CurrentWeatherData;
  hourly: HourlyForecastData;
  daily: DailyForecastData;
  airQuality?: AirQualityData;
}

export interface PrecautionItem {
  id: string;
  urgency: 'critical' | 'high' | 'medium' | 'general';
  category: 'Immediate Safety' | 'Home & Property' | 'Travel & Transit' | 'Health & Water' | 'Disaster Kit';
  title: string;
  description: string;
  actionRequired: boolean;
}

export interface HazardEvaluation {
  alertLevel: AlertLevel;
  isRedZone: boolean;
  hazardTypes: HazardType[];
  primaryHazard: HazardType;
  hazardTitle: string;
  hazardSummary: string;
  floodRiskScore: number; // 0 - 100
  cycloneRiskScore: number; // 0 - 100
  evacuationAdvisory: 'none' | 'monitor' | 'prepare_evacuation' | 'mandatory_evacuation';
  precautions: PrecautionItem[];
  emergencyContacts: {
    title: string;
    number: string;
    description: string;
  }[];
}
