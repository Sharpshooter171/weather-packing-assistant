const DEFAULT_GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1";
const DEFAULT_FORECAST_BASE_URL = "https://api.open-meteo.com/v1";

export const weatherProviderConfig = {
  geocodingBaseUrl: process.env.OPEN_METEO_GEOCODING_BASE_URL ?? DEFAULT_GEOCODING_BASE_URL,
  forecastBaseUrl: process.env.OPEN_METEO_FORECAST_BASE_URL ?? DEFAULT_FORECAST_BASE_URL,
  requestTimeoutMs: Number(process.env.WEATHER_API_TIMEOUT_MS ?? 8000)
};
