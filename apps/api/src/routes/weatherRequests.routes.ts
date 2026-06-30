import { Router } from "express";

import { mapWeatherRequestToApi } from "../mappers/weatherRequest.mapper.js";
import { createWeatherRequestFromProvider } from "../services/weatherRequestCreation.service.js";
import { validateWeatherRequestInput } from "../validators/weatherRequest.validator.js";

export const weatherRequestsRouter = Router();

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
