import type { WeatherRequest } from "@prisma/client";

import type { CurrentWeather, ForecastDay } from "../types/weatherProvider.types.js";
import type { PackingChecklist, WeatherProfile } from "../types/weatherRules.types.js";

export type WeatherRequestApi = {
  id: string;
  locationInput: string;
  resolvedLocationName: string;
  country: string | null;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  currentWeather: CurrentWeather;
  forecast: ForecastDay[];
  weatherProfile: WeatherProfile;
  travelInsights: string[];
  packingChecklist: PackingChecklist;
  aiRecommendation: unknown | null;
  aiStatus: string;
  createdAt: string;
  updatedAt: string;
};

export function mapWeatherRequestToApi(record: WeatherRequest): WeatherRequestApi {
  return {
    id: record.id,
    locationInput: record.locationInput,
    resolvedLocationName: record.resolvedLocationName,
    country: record.country,
    latitude: record.latitude,
    longitude: record.longitude,
    startDate: toDateOnly(record.startDate),
    endDate: toDateOnly(record.endDate),
    currentWeather: record.currentWeatherJson as unknown as CurrentWeather,
    forecast: record.forecastJson as unknown as ForecastDay[],
    weatherProfile: record.weatherProfileJson as unknown as WeatherProfile,
    travelInsights: record.travelInsightsJson as unknown as string[],
    packingChecklist: record.packingChecklistJson as unknown as PackingChecklist,
    aiRecommendation: record.aiRecommendationJson,
    aiStatus: record.aiStatus,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}
