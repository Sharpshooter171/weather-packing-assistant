import { Router } from "express";

import { buildDeterministicWeatherRecommendation } from "../services/deterministicWeatherEngine.js";
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
