import { Router } from "express";

import { buildDeterministicWeatherRecommendation } from "../services/deterministicWeatherEngine.js";
import { getWeatherProviderResult } from "../services/weatherProvider.service.js";
import { validateNormalizedWeatherSummary } from "../validators/normalizedWeatherSummary.validator.js";
import { validateWeatherRequestInput } from "../validators/weatherRequest.validator.js";

export const devRouter = Router();

devRouter.post("/validate-weather-request", (request, response) => {
  const validated = validateWeatherRequestInput(request.body);

  response.status(200).json({
    data: {
      valid: true,
      input: {
        location: validated.location,
        startDate: validated.startDate.toISOString().slice(0, 10),
        endDate: validated.endDate.toISOString().slice(0, 10),
        useAi: validated.useAi
      }
    }
  });
});

devRouter.post("/interpret-weather-summary", (request, response) => {
  const summary = validateNormalizedWeatherSummary(request.body);
  const recommendation = buildDeterministicWeatherRecommendation(summary);

  response.status(200).json({
    data: recommendation
  });
});

devRouter.post("/weather-provider", async (request, response, next) => {
  try {
    const validated = validateWeatherRequestInput(request.body);
    const result = await getWeatherProviderResult(validated.location, validated.startDate, validated.endDate);

    response.status(200).json({
      data: {
        location: result.location,
        currentWeather: result.currentWeather,
        forecast: result.forecast,
        normalizedSummary: result.normalizedSummary,
        deterministicRecommendation: result.deterministicRecommendation
      }
    });
  } catch (error) {
    next(error);
  }
});
