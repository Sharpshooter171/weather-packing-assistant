import { AppError } from "../errors/AppError.js";
import type { NormalizedWeatherSummary } from "../types/weatherRules.types.js";

type NormalizedWeatherSummaryInput = Record<string, unknown>;

const REQUIRED_NUMBER_FIELDS: Array<keyof NormalizedWeatherSummary> = [
  "minTemperatureC",
  "maxTemperatureC",
  "temperatureVariationC"
];

const OPTIONAL_NUMBER_FIELDS: Array<keyof NormalizedWeatherSummary> = [
  "apparentTemperatureMinC",
  "apparentTemperatureMaxC",
  "rainProbabilityMaxPercent",
  "rainSumMaxMm",
  "precipitationProbabilityMaxPercent",
  "snowfallMaxCm",
  "windSpeedMaxKmh",
  "windGustMaxKmh",
  "uvIndexMax",
  "visibilityMinMeters"
];

export function validateNormalizedWeatherSummary(input: unknown): NormalizedWeatherSummary {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AppError("INVALID_REQUEST_BODY", "Weather summary must be a JSON object.");
  }

  const data = input as NormalizedWeatherSummaryInput;

  for (const field of REQUIRED_NUMBER_FIELDS) {
    requireFiniteNumber(data, field);
  }

  for (const field of OPTIONAL_NUMBER_FIELDS) {
    validateOptionalFiniteNumber(data, field);
  }

  requireBoolean(data, "snowfallExpected");
  requireWeatherCodes(data.weatherCodes);

  const minTemperatureC = data.minTemperatureC as number;
  const maxTemperatureC = data.maxTemperatureC as number;

  if (maxTemperatureC < minTemperatureC) {
    throw new AppError("INVALID_REQUEST_BODY", "maxTemperatureC must be greater than or equal to minTemperatureC.", 400, {
      fields: ["minTemperatureC", "maxTemperatureC"],
      minTemperatureC,
      maxTemperatureC
    });
  }

  return {
    minTemperatureC,
    maxTemperatureC,
    apparentTemperatureMinC: normalizeOptionalNumber(data.apparentTemperatureMinC),
    apparentTemperatureMaxC: normalizeOptionalNumber(data.apparentTemperatureMaxC),
    rainProbabilityMaxPercent: normalizeOptionalNumber(data.rainProbabilityMaxPercent),
    rainSumMaxMm: normalizeOptionalNumber(data.rainSumMaxMm),
    precipitationProbabilityMaxPercent: normalizeOptionalNumber(data.precipitationProbabilityMaxPercent),
    snowfallExpected: data.snowfallExpected as boolean,
    snowfallMaxCm: normalizeOptionalNumber(data.snowfallMaxCm),
    windSpeedMaxKmh: normalizeOptionalNumber(data.windSpeedMaxKmh),
    windGustMaxKmh: normalizeOptionalNumber(data.windGustMaxKmh),
    uvIndexMax: normalizeOptionalNumber(data.uvIndexMax),
    visibilityMinMeters: normalizeOptionalNumber(data.visibilityMinMeters),
    weatherCodes: data.weatherCodes as number[],
    temperatureVariationC: data.temperatureVariationC as number
  };
}

function requireFiniteNumber(data: NormalizedWeatherSummaryInput, field: keyof NormalizedWeatherSummary) {
  const value = data[field];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AppError("INVALID_REQUEST_BODY", `${String(field)} must be a finite number.`, 400, {
      field
    });
  }
}

function validateOptionalFiniteNumber(data: NormalizedWeatherSummaryInput, field: keyof NormalizedWeatherSummary) {
  const value = data[field];

  if (value === undefined || value === null) {
    return;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AppError("INVALID_REQUEST_BODY", `${String(field)} must be a finite number when provided.`, 400, {
      field
    });
  }
}

function requireBoolean(data: NormalizedWeatherSummaryInput, field: keyof NormalizedWeatherSummary) {
  const value = data[field];

  if (typeof value !== "boolean") {
    throw new AppError("INVALID_REQUEST_BODY", `${String(field)} must be a boolean.`, 400, {
      field
    });
  }
}

function requireWeatherCodes(value: unknown) {
  if (!Array.isArray(value)) {
    throw new AppError("INVALID_REQUEST_BODY", "weatherCodes must be an array of numbers.", 400, {
      field: "weatherCodes"
    });
  }

  const invalidIndex = value.findIndex((item) => typeof item !== "number" || !Number.isFinite(item));

  if (invalidIndex !== -1) {
    throw new AppError("INVALID_REQUEST_BODY", "weatherCodes must contain only finite numbers.", 400, {
      field: "weatherCodes",
      invalidIndex
    });
  }
}

function normalizeOptionalNumber(value: unknown): number | null {
  return value === undefined ? null : (value as number | null);
}
