import { weatherProviderConfig } from "../config/weatherProvider.config.js";
import type { ResolvedLocation } from "../types/weatherProvider.types.js";
import { fetchJson } from "../utils/fetchJson.js";

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "rain_sum",
  "snowfall_sum",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "uv_index_max"
];

const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "is_day",
  "precipitation",
  "weather_code",
  "wind_speed_10m",
  "wind_gusts_10m"
];

export type OpenMeteoForecastResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    is_day?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    wind_gusts_10m?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    rain_sum?: number[];
    snowfall_sum?: number[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
    uv_index_max?: number[];
  };
};

export async function fetchForecast(
  location: ResolvedLocation,
  startDate: Date,
  endDate: Date
): Promise<OpenMeteoForecastResponse> {
  const url = new URL(`${weatherProviderConfig.forecastBaseUrl}/forecast`);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("current", CURRENT_FIELDS.join(","));
  url.searchParams.set("daily", DAILY_FIELDS.join(","));
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("precipitation_unit", "mm");
  url.searchParams.set("timezone", location.timezone ?? "auto");
  url.searchParams.set("start_date", toDateOnly(startDate));
  url.searchParams.set("end_date", toDateOnly(endDate));

  return (await fetchJson(url, weatherProviderConfig.requestTimeoutMs)) as OpenMeteoForecastResponse;
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}
