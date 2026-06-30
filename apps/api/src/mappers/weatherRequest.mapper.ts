import type { WeatherRequest } from "@prisma/client";

export function mapWeatherRequestToApi(record: WeatherRequest) {
  return {
    id: record.id,
    locationInput: record.locationInput,
    resolvedLocationName: record.resolvedLocationName,
    country: record.country,
    latitude: record.latitude,
    longitude: record.longitude,
    startDate: toDateOnly(record.startDate),
    endDate: toDateOnly(record.endDate),
    currentWeather: record.currentWeatherJson,
    forecast: record.forecastJson,
    weatherProfile: record.weatherProfileJson,
    travelInsights: record.travelInsightsJson,
    packingChecklist: record.packingChecklistJson,
    aiRecommendation: record.aiRecommendationJson,
    aiStatus: record.aiStatus,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}
