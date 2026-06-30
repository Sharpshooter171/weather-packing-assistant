import { Prisma } from "@prisma/client";

import { createWeatherRequest } from "../repositories/weatherRequest.repository.js";
import { getWeatherProviderResult } from "./weatherProvider.service.js";

export async function createWeatherRequestFromProvider(input: {
  location: string;
  startDate: Date;
  endDate: Date;
  useAi: boolean;
}) {
  const providerResult = await getWeatherProviderResult(input.location, input.startDate, input.endDate);
  const deterministicRecommendation = providerResult.deterministicRecommendation;
  const aiStatus = input.useAi ? "fallback_used" : "disabled";

  return createWeatherRequest({
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
    aiRecommendationJson: Prisma.JsonNull,
    aiStatus
  });
}
