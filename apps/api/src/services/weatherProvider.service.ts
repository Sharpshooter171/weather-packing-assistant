import { buildDeterministicWeatherRecommendation } from "./deterministicWeatherEngine.js";
import { fetchForecast } from "./openMeteoForecast.service.js";
import { resolveLocation } from "./openMeteoGeocoding.service.js";
import {
  buildCurrentWeather,
  buildForecastDays,
  buildNormalizedWeatherSummary
} from "./weatherNormalizer.service.js";

export async function getWeatherProviderResult(locationInput: string, startDate: Date, endDate: Date) {
  const location = await resolveLocation(locationInput);
  const rawProviderResponse = await fetchForecast(location, startDate, endDate);
  const currentWeather = buildCurrentWeather(rawProviderResponse);
  const forecast = buildForecastDays(rawProviderResponse);
  const normalizedSummary = buildNormalizedWeatherSummary(forecast);
  const deterministicRecommendation = buildDeterministicWeatherRecommendation(normalizedSummary);

  return {
    location,
    currentWeather,
    forecast,
    normalizedSummary,
    deterministicRecommendation,
    rawProviderResponse
  };
}
