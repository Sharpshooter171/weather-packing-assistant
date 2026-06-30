import type { NormalizedWeatherSummary } from "./weatherRules.types.js";

export type ResolvedLocation = {
  locationInput: string;
  name: string;
  country?: string | null;
  admin1?: string | null;
  latitude: number;
  longitude: number;
  timezone?: string | null;
};

export type ForecastDay = {
  date: string;
  minTemperatureC: number;
  maxTemperatureC: number;
  precipitationProbabilityMaxPercent?: number | null;
  rainSumMm?: number | null;
  snowfallSumCm?: number | null;
  windSpeedMaxKmh?: number | null;
  windGustsMaxKmh?: number | null;
  uvIndexMax?: number | null;
  weatherCode?: number | null;
  condition: string;
};

export type CurrentWeather = {
  temperatureC: number;
  feelsLikeC?: number | null;
  condition: string;
  weatherCode?: number | null;
  humidityPercent?: number | null;
  windSpeedKmh?: number | null;
  windGustKmh?: number | null;
  uvIndex?: number | null;
  precipitationProbabilityPercent?: number | null;
  isDay?: boolean | null;
  observedAt?: string | null;
};

export type WeatherProviderResult = {
  location: ResolvedLocation;
  currentWeather: CurrentWeather;
  forecast: ForecastDay[];
  normalizedSummary: NormalizedWeatherSummary;
  rawProviderResponse: unknown;
};
