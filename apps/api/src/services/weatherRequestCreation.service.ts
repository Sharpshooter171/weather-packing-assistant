import type { Prisma } from "@prisma/client";

import { createWeatherRequest } from "../repositories/weatherRequest.repository.js";
import { getWeatherProviderResult } from "./weatherProvider.service.js";

export type WeatherRequestWorkflowInput = {
  location: string;
  latitude?: number;
  longitude?: number;
  startDate: Date;
  endDate: Date;
  useAi: boolean;
};

export async function buildWeatherRequestPersistenceData(input: WeatherRequestWorkflowInput) {
  const providerResult = await getWeatherProviderResult(
    {
      location: input.location,
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {})
    },
    input.startDate,
    input.endDate
  );
  const deterministicRecommendation = providerResult.deterministicRecommendation;
  const aiStatus = input.useAi ? "fallback_used" : "disabled";

  return {
    locationInput: input.location,
    resolvedLocationName: providerResult.location.name,
    country: providerResult.location.country,
    latitude: providerResult.location.latitude,
    longitude: providerResult.location.longitude,
    startDate: input.startDate,
    endDate: input.endDate,
    currentWeatherJson: providerResult.currentWeather as Prisma.InputJsonValue,
    forecastJson: providerResult.forecast as Prisma.InputJsonValue,
    weatherProfileJson: deterministicRecommendation.weatherProfile as Prisma.InputJsonValue,
    travelInsightsJson: deterministicRecommendation.travelInsights as Prisma.InputJsonValue,
    packingChecklistJson: deterministicRecommendation.packingChecklist as Prisma.InputJsonValue,
    aiStatus
  };
}

export async function createWeatherRequestFromProvider(input: WeatherRequestWorkflowInput) {
  const data = await buildWeatherRequestPersistenceData(input);

  return createWeatherRequest(data);
}
