import { AppError } from "../errors/AppError.js";

export type WeatherRequestInput = {
  location?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  useAi?: unknown;
};

export type ValidatedWeatherRequestInput = {
  location: string;
  latitude?: number;
  longitude?: number;
  startDate: Date;
  endDate: Date;
  useAi: boolean;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_LOCATION_LENGTH = 2;
const MAX_LOCATION_LENGTH = 120;
const MAX_FORECAST_RANGE_DAYS = 16;

export function validateWeatherRequestInput(input: WeatherRequestInput): ValidatedWeatherRequestInput {
  if (!input || typeof input !== "object") {
    throw new AppError("INVALID_REQUEST_BODY", "Request body must be a JSON object.");
  }

  const latitude = validateOptionalCoordinate("latitude", input.latitude, -90, 90);
  const longitude = validateOptionalCoordinate("longitude", input.longitude, -180, 180);
  const hasCoordinates = latitude !== undefined || longitude !== undefined;
  const location = hasCoordinates ? validateCoordinateLocation(input.location) : validateLocation(input.location);
  const startDate = validateDateField("startDate", input.startDate);
  const endDate = validateDateField("endDate", input.endDate);
  const useAi = validateUseAi(input.useAi);

  if (hasCoordinates && (latitude === undefined || longitude === undefined)) {
    throw new AppError("INVALID_COORDINATES", "latitude and longitude must be provided together.", 400, {
      latitudeProvided: latitude !== undefined,
      longitudeProvided: longitude !== undefined
    });
  }

  validateDateRange(startDate, endDate);

  return {
    location,
    ...(latitude !== undefined ? { latitude } : {}),
    ...(longitude !== undefined ? { longitude } : {}),
    startDate,
    endDate,
    useAi
  };
}

function validateLocation(value: unknown): string {
  if (value === undefined || value === null) {
    throw new AppError("MISSING_REQUIRED_FIELD", "location is required.", 400, {
      field: "location"
    });
  }

  if (typeof value !== "string") {
    throw new AppError("INVALID_LOCATION_INPUT", "location must be a string.", 400, {
      field: "location"
    });
  }

  const location = value.trim();

  if (location.length < MIN_LOCATION_LENGTH) {
    throw new AppError("INVALID_LOCATION_INPUT", "location must contain at least 2 characters.", 400, {
      field: "location"
    });
  }

  if (location.length > MAX_LOCATION_LENGTH) {
    throw new AppError("INVALID_LOCATION_INPUT", "location is too long.", 400, {
      field: "location",
      maxLength: MAX_LOCATION_LENGTH
    });
  }

  return location;
}

function validateCoordinateLocation(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "Current location";
  }

  return validateLocation(value);
}

function validateOptionalCoordinate(field: "latitude" | "longitude", value: unknown, min: number, max: number) {
  if (value === undefined || value === null || value === "") return undefined;

  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new AppError("INVALID_COORDINATES", `${field} must be a number between ${min} and ${max}.`, 400, {
      field,
      min,
      max
    });
  }

  return parsed;
}

function validateDateField(field: "startDate" | "endDate", value: unknown): Date {
  if (value === undefined || value === null) {
    throw new AppError("MISSING_REQUIRED_FIELD", `${field} is required.`, 400, {
      field
    });
  }

  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) {
    throw new AppError("INVALID_DATE_RANGE", `${field} must use YYYY-MM-DD format.`, 400, {
      field
    });
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("INVALID_DATE_RANGE", `${field} must be a valid date.`, 400, {
      field
    });
  }

  const normalized = date.toISOString().slice(0, 10);

  if (normalized !== value) {
    throw new AppError("INVALID_DATE_RANGE", `${field} must be a valid calendar date.`, 400, {
      field
    });
  }

  return date;
}

function validateDateRange(startDate: Date, endDate: Date) {
  if (endDate < startDate) {
    throw new AppError("INVALID_DATE_RANGE", "endDate must be the same as or after startDate.", 400, {
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10)
    });
  }

  const rangeInDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;

  if (rangeInDays > MAX_FORECAST_RANGE_DAYS) {
    throw new AppError("UNSUPPORTED_DATE_RANGE", "Date range is too long for the MVP forecast provider.", 400, {
      maxDays: MAX_FORECAST_RANGE_DAYS,
      requestedDays: rangeInDays
    });
  }
}

function validateUseAi(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value !== "boolean") {
    throw new AppError("INVALID_REQUEST_BODY", "useAi must be a boolean when provided.", 400, {
      field: "useAi"
    });
  }

  return value;
}
