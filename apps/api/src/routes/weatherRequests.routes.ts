import { Router } from "express";

import { AppError } from "../errors/AppError.js";
import { mapWeatherRequestToApi } from "../mappers/weatherRequest.mapper.js";
import { getWeatherRequestById, listWeatherRequests } from "../repositories/weatherRequest.repository.js";
import { createWeatherRequestFromProvider } from "../services/weatherRequestCreation.service.js";
import { validateWeatherRequestInput } from "../validators/weatherRequest.validator.js";

export const weatherRequestsRouter = Router();

weatherRequestsRouter.get("/", async (request, response, next) => {
  try {
    const limit = parsePositiveInteger(request.query.limit, 20, 100);
    const offset = parseNonNegativeInteger(request.query.offset, 0);
    const location = parseOptionalString(request.query.location);
    const country = parseOptionalString(request.query.country);

    const records = await listWeatherRequests({
      limit,
      offset,
      location,
      country
    });

    response.status(200).json({
      data: records.map(mapWeatherRequestToApi),
      meta: {
        limit,
        offset,
        count: records.length
      }
    });
  } catch (error) {
    next(error);
  }
});

weatherRequestsRouter.get("/:id", async (request, response, next) => {
  try {
    const record = await getWeatherRequestById(request.params.id);

    if (!record) {
      throw new AppError("WEATHER_REQUEST_NOT_FOUND", "Weather request was not found.", 404, {
        id: request.params.id
      });
    }

    response.status(200).json({
      data: mapWeatherRequestToApi(record)
    });
  } catch (error) {
    next(error);
  }
});

weatherRequestsRouter.post("/", async (request, response, next) => {
  try {
    const validated = validateWeatherRequestInput(request.body);
    const created = await createWeatherRequestFromProvider(validated);

    response.status(201).json({
      data: mapWeatherRequestToApi(created),
      ...(validated.useAi
        ? {
            warning: {
              code: "AI_RECOMMENDATION_UNAVAILABLE",
              message: "The packing checklist was generated using deterministic fallback rules."
            }
          }
        : {})
    });
  } catch (error) {
    next(error);
  }
});

function parsePositiveInteger(value: unknown, defaultValue: number, maxValue: number) {
  if (value === undefined) return defaultValue;
  if (Array.isArray(value)) {
    throw new AppError("INVALID_REQUEST_BODY", "limit must be a single positive integer.", 400, {
      field: "limit"
    });
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError("INVALID_REQUEST_BODY", "limit must be a positive integer.", 400, {
      field: "limit"
    });
  }

  return Math.min(parsed, maxValue);
}

function parseNonNegativeInteger(value: unknown, defaultValue: number) {
  if (value === undefined) return defaultValue;
  if (Array.isArray(value)) {
    throw new AppError("INVALID_REQUEST_BODY", "offset must be a single non-negative integer.", 400, {
      field: "offset"
    });
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new AppError("INVALID_REQUEST_BODY", "offset must be a non-negative integer.", 400, {
      field: "offset"
    });
  }

  return parsed;
}

function parseOptionalString(value: unknown) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  if (typeof value !== "string") return undefined;

  return value.trim() || undefined;
}
