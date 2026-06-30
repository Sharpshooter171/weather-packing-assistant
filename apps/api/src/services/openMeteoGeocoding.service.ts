import { weatherProviderConfig } from "../config/weatherProvider.config.js";
import { AppError } from "../errors/AppError.js";
import type { ResolvedLocation } from "../types/weatherProvider.types.js";
import { fetchJson } from "../utils/fetchJson.js";

type OpenMeteoGeocodingResponse = {
  results?: Array<{
    name?: string;
    country?: string;
    admin1?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }>;
};

export async function resolveLocation(locationInput: string): Promise<ResolvedLocation> {
  const url = new URL(`${weatherProviderConfig.geocodingBaseUrl}/search`);
  url.searchParams.set("name", locationInput);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = (await fetchJson(url, weatherProviderConfig.requestTimeoutMs)) as OpenMeteoGeocodingResponse;
  const firstResult = response.results?.[0];

  if (!firstResult || typeof firstResult.latitude !== "number" || typeof firstResult.longitude !== "number") {
    throw new AppError("LOCATION_NOT_FOUND", "Location could not be resolved by the weather provider.", 404, {
      location: locationInput
    });
  }

  return {
    locationInput,
    name: firstResult.name ?? locationInput,
    country: firstResult.country ?? null,
    admin1: firstResult.admin1 ?? null,
    latitude: firstResult.latitude,
    longitude: firstResult.longitude,
    timezone: firstResult.timezone ?? null
  };
}
