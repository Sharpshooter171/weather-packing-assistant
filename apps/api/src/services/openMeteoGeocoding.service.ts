import { weatherProviderConfig } from "../config/weatherProvider.config.js";
import { AppError } from "../errors/AppError.js";
import type { ResolvedLocation } from "../types/weatherProvider.types.js";
import { fetchJson } from "../utils/fetchJson.js";

type OpenMeteoGeocodingResult = {
  name?: string;
  country?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoGeocodingResult[];
};

export async function resolveLocation(locationInput: string): Promise<ResolvedLocation> {
  const locationQuery = parseLocationQuery(locationInput);
  const url = new URL(`${weatherProviderConfig.geocodingBaseUrl}/search`);
  url.searchParams.set("name", locationQuery.city);
  url.searchParams.set("count", "10");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = (await fetchJson(url, weatherProviderConfig.requestTimeoutMs)) as OpenMeteoGeocodingResponse;
  const selectedResult = selectBestLocationMatch(response.results, locationQuery.countryOrRegion);

  if (!selectedResult || typeof selectedResult.latitude !== "number" || typeof selectedResult.longitude !== "number") {
    throw new AppError("LOCATION_NOT_FOUND", "Location could not be resolved by the weather provider.", 404, {
      location: locationInput
    });
  }

  return {
    locationInput,
    name: selectedResult.name ?? locationQuery.city,
    country: selectedResult.country ?? null,
    admin1: selectedResult.admin1 ?? null,
    latitude: selectedResult.latitude,
    longitude: selectedResult.longitude,
    timezone: selectedResult.timezone ?? null
  };
}

function parseLocationQuery(locationInput: string) {
  const parts = locationInput
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city: parts[0] ?? locationInput.trim(),
    countryOrRegion: parts.length > 1 ? parts.slice(1).join(" ") : null
  };
}

function selectBestLocationMatch(results: OpenMeteoGeocodingResult[] | undefined, countryOrRegion: string | null) {
  if (!results?.length) return null;
  if (!countryOrRegion) return results[0];

  const normalizedHint = normalizeLocationToken(countryOrRegion);

  return (
    results.find((result) => {
      const normalizedCountry = normalizeLocationToken(result.country ?? "");
      const normalizedRegion = normalizeLocationToken(result.admin1 ?? "");

      return normalizedCountry === normalizedHint || normalizedRegion === normalizedHint;
    }) ?? null
  );
}

function normalizeLocationToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
