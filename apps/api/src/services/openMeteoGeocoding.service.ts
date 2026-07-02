import { weatherProviderConfig } from "../config/weatherProvider.config.js";
import { AppError } from "../errors/AppError.js";
import type { ResolvedLocation } from "../types/weatherProvider.types.js";
import { fetchJson } from "../utils/fetchJson.js";

type OpenMeteoGeocodingResult = {
  name?: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoGeocodingResult[];
};

const GEOCODING_RESULT_COUNT = "50";

const COUNTRY_HINT_ALIASES: Record<string, string[]> = {
  bolivia: ["bolivia", "bolivia plurinational state of", "bo"],
  brasil: ["brazil", "brasil", "br"],
  brazil: ["brazil", "brasil", "br"],
  peru: ["peru", "pe"],
  uk: ["united kingdom", "uk", "gb", "great britain"],
  "united kingdom": ["united kingdom", "uk", "gb", "great britain"],
  usa: ["united states", "usa", "us", "united states of america"],
  "united states": ["united states", "usa", "us", "united states of america"]
};

export async function resolveLocation(locationInput: string): Promise<ResolvedLocation> {
  const locationQuery = parseLocationQuery(locationInput);
  const response = await fetchGeocodingResults(locationQuery.city);
  const selectedResult = selectBestLocationMatch(response.results, locationQuery.countryOrRegion);

  if (!selectedResult || typeof selectedResult.latitude !== "number" || typeof selectedResult.longitude !== "number") {
    throw new AppError("LOCATION_NOT_FOUND", "Location could not be resolved by the weather provider.", 404, {
      location: locationInput,
      expectedCountryOrRegion: locationQuery.countryOrRegion,
      candidateCount: response.results?.length ?? 0,
      candidates: buildCandidateDebugList(response.results)
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

async function fetchGeocodingResults(city: string) {
  const url = new URL(`${weatherProviderConfig.geocodingBaseUrl}/search`);
  url.searchParams.set("name", city);
  url.searchParams.set("count", GEOCODING_RESULT_COUNT);
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  return (await fetchJson(url, weatherProviderConfig.requestTimeoutMs)) as OpenMeteoGeocodingResponse;
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

  const acceptableHints = getAcceptableLocationHints(countryOrRegion);

  return (
    results.find((result) => {
      const candidateTokens = [result.country, result.country_code, result.admin1]
        .filter((value): value is string => Boolean(value))
        .map(normalizeLocationToken);

      return candidateTokens.some((candidateToken) =>
        acceptableHints.some(
          (hint) => candidateToken === hint || candidateToken.includes(hint) || hint.includes(candidateToken)
        )
      );
    }) ?? null
  );
}

function getAcceptableLocationHints(countryOrRegion: string) {
  const normalizedHint = normalizeLocationToken(countryOrRegion);
  const aliases = COUNTRY_HINT_ALIASES[normalizedHint] ?? [];

  return [normalizedHint, ...aliases.map(normalizeLocationToken)];
}

function buildCandidateDebugList(results: OpenMeteoGeocodingResult[] | undefined) {
  return (results ?? []).slice(0, 10).map((result) => ({
    name: result.name ?? null,
    country: result.country ?? null,
    countryCode: result.country_code ?? null,
    admin1: result.admin1 ?? null
  }));
}

function normalizeLocationToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
