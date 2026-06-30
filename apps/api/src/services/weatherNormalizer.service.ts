import type { NormalizedWeatherSummary } from "../types/weatherRules.types.js";
import type { CurrentWeather, ForecastDay } from "../types/weatherProvider.types.js";
import type { OpenMeteoForecastResponse } from "./openMeteoForecast.service.js";

export function buildCurrentWeather(forecast: OpenMeteoForecastResponse): CurrentWeather {
  const current = forecast.current;
  const weatherCode = current?.weather_code ?? null;

  return {
    temperatureC: current?.temperature_2m ?? 0,
    feelsLikeC: current?.apparent_temperature ?? null,
    condition: describeWeatherCode(weatherCode),
    weatherCode,
    windSpeedKmh: current?.wind_speed_10m ?? null,
    windGustKmh: current?.wind_gusts_10m ?? null,
    precipitationProbabilityPercent: null,
    isDay: typeof current?.is_day === "number" ? current.is_day === 1 : null,
    observedAt: current?.time ?? null
  };
}

export function buildForecastDays(forecast: OpenMeteoForecastResponse): ForecastDay[] {
  const daily = forecast.daily;
  const dates = daily?.time ?? [];

  return dates.map((date, index) => {
    const weatherCode = daily?.weather_code?.[index] ?? null;

    return {
      date,
      minTemperatureC: daily?.temperature_2m_min?.[index] ?? 0,
      maxTemperatureC: daily?.temperature_2m_max?.[index] ?? 0,
      precipitationProbabilityMaxPercent: daily?.precipitation_probability_max?.[index] ?? null,
      rainSumMm: daily?.rain_sum?.[index] ?? null,
      snowfallSumCm: daily?.snowfall_sum?.[index] ?? null,
      windSpeedMaxKmh: daily?.wind_speed_10m_max?.[index] ?? null,
      windGustsMaxKmh: daily?.wind_gusts_10m_max?.[index] ?? null,
      uvIndexMax: daily?.uv_index_max?.[index] ?? null,
      weatherCode,
      condition: describeWeatherCode(weatherCode)
    };
  });
}

export function buildNormalizedWeatherSummary(forecastDays: ForecastDay[]): NormalizedWeatherSummary {
  const minTemperatureC = min(forecastDays.map((day) => day.minTemperatureC));
  const maxTemperatureC = max(forecastDays.map((day) => day.maxTemperatureC));
  const rainProbabilityMaxPercent = maxOptional(
    forecastDays.map((day) => day.precipitationProbabilityMaxPercent ?? null)
  );
  const rainSumMaxMm = maxOptional(forecastDays.map((day) => day.rainSumMm ?? null));
  const snowfallMaxCm = maxOptional(forecastDays.map((day) => day.snowfallSumCm ?? null));
  const windSpeedMaxKmh = maxOptional(forecastDays.map((day) => day.windSpeedMaxKmh ?? null));
  const windGustMaxKmh = maxOptional(forecastDays.map((day) => day.windGustsMaxKmh ?? null));
  const uvIndexMax = maxOptional(forecastDays.map((day) => day.uvIndexMax ?? null));
  const weatherCodes = forecastDays
    .map((day) => day.weatherCode)
    .filter((code): code is number => typeof code === "number");

  return {
    minTemperatureC,
    maxTemperatureC,
    apparentTemperatureMinC: null,
    apparentTemperatureMaxC: null,
    rainProbabilityMaxPercent,
    rainSumMaxMm,
    precipitationProbabilityMaxPercent: rainProbabilityMaxPercent,
    snowfallExpected: (snowfallMaxCm ?? 0) > 0,
    snowfallMaxCm,
    windSpeedMaxKmh,
    windGustMaxKmh,
    uvIndexMax,
    visibilityMinMeters: null,
    weatherCodes,
    temperatureVariationC: maxTemperatureC - minTemperatureC
  };
}

function describeWeatherCode(code: number | null) {
  if (code === null) return "Unknown";
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";

  return "Weather code " + code;
}

function min(values: number[]) {
  return values.length > 0 ? Math.min(...values) : 0;
}

function max(values: number[]) {
  return values.length > 0 ? Math.max(...values) : 0;
}

function maxOptional(values: Array<number | null>) {
  const finiteValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  return finiteValues.length > 0 ? Math.max(...finiteValues) : null;
}
