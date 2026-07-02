import type { ResolvedLocation } from "../types/weatherProvider.types.js";
import { buildDeterministicWeatherRecommendation } from "./deterministicWeatherEngine.js";
import { fetchForecast } from "./openMeteoForecast.service.js";
import { resolveLocation } from "./openMeteoGeocoding.service.js";
import {
  buildCurrentWeather,
  buildForecastDays,
  buildNormalizedWeatherSummary
} from "./weatherNormalizer.service.js";

export type WeatherProviderInput = {
  location: string;
  latitude?: number;
  longitude?: number;
};

export async function getWeatherProviderResult(input: WeatherProviderInput, startDate: Date, endDate: Date) {
  const location = hasCoordinates(input) ? buildCoordinatesLocation(input) : await resolveLocation(input.location);
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

function hasCoordinates(input: WeatherProviderInput): input is WeatherProviderInput & { latitude: number; longitude: number } {
  return typeof input.latitude === "number" && typeof input.longitude === "number";
}

function buildCoordinatesLocation(input: WeatherProviderInput & { latitude: number; longitude: number }): ResolvedLocation {
  return {
    locationInput: input.location,
    name: input.location || "Current location",
    country: null,
    admin1: null,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: "auto"
  };
}
