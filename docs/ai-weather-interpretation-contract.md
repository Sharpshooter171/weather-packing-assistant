# AI Weather Interpretation Contract — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Document status:** Initial AI contract  
**Version:** 0.1  
**Primary provider:** DeepSeek API

---

## 1. Purpose

This document defines how the application uses an LLM to interpret weather data and generate user-friendly packing recommendations.

The AI layer exists to improve usefulness and communication, not to replace deterministic validation or real weather data.

Core principle:

> Weather API data is the source of truth.  
> The backend normalizes and classifies weather data.  
> DeepSeek may interpret and explain.  
> The backend validates the final AI output.  
> Fallback rules keep the app working without AI.

---

## 2. Scope

The AI layer may be used for:

- Weather interpretation in natural language
- Travel insights based on structured weather conditions
- Packing checklist organization
- Friendly explanation of why items are recommended
- Condensing multiple weather signals into a short summary

The AI layer must not be used for:

- Fetching weather data
- Inventing weather facts
- Replacing weather API values
- Storing records directly
- Updating the database directly
- Making unvalidated backend decisions
- Returning the final API response without backend validation

---

## 3. Provider

The MVP uses the DeepSeek API from the backend.

Environment variables:

```env
DEEPSEEK_API_KEY=""
DEEPSEEK_API_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
DEEPSEEK_REASONING_EFFORT="medium"
AI_RECOMMENDATIONS_ENABLED="true"
```

Rules:

- The DeepSeek API key must never be exposed to the frontend.
- The frontend must never call DeepSeek directly.
- The backend must be able to disable AI recommendations through configuration.
- If the API key is missing, the app must use deterministic fallback rules.

---

## 4. AI Invocation Point

The AI call occurs after deterministic weather processing.

Pipeline:

```text
Weather API response
  -> Weather Normalizer
  -> Weather Classifier
  -> Fallback Packing Rule Engine
  -> DeepSeek Recommendation Service
  -> Checklist Validation Service
  -> API Response
```

The backend should always produce a deterministic fallback checklist before or alongside the AI call.

---

## 5. AI Input Contract

DeepSeek must receive compact structured JSON, not raw weather API payloads.

The input should include:

- Location
- Date range
- Weather summary
- Detected weather conditions
- Deterministic fallback checklist
- Explicit output schema instructions

Example input:

```json
{
  "location": "London",
  "dateRange": {
    "startDate": "2026-07-10",
    "endDate": "2026-07-15"
  },
  "weatherSummary": {
    "minTemperatureC": 8,
    "maxTemperatureC": 18,
    "rainProbabilityMaxPercent": 70,
    "rainSumMaxMm": 4.2,
    "snowfallExpected": false,
    "snowfallMaxCm": 0,
    "maxWindGustKmh": 42,
    "uvIndexMax": 5,
    "fogOrLowVisibilityExpected": false,
    "stormRiskExpected": false,
    "temperatureVariationC": 10,
    "detectedConditions": ["cool", "rain", "wind"]
  },
  "fallbackChecklist": {
    "clothing": ["Light sweater", "Long pants"],
    "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
    "accessories": ["Power bank"],
    "healthAndSafety": [],
    "optional": ["Extra socks"]
  }
}
```

---

## 6. AI System Prompt Contract

The system prompt should be strict and short.

Suggested system prompt:

```text
You are a weather-based travel packing assistant.
Use only the structured weather data provided by the backend.
Do not invent weather facts, temperatures, dates, alerts, or locations.
Do not override the forecast.
Generate practical packing recommendations based on the detected weather conditions.
Return only valid JSON that matches the requested schema.
If the available data is limited, stay conservative and explain that recommendations are based on available forecast signals.
```

---

## 7. AI User Prompt Contract

The user prompt sent to DeepSeek should include:

- Structured weather summary
- Deterministic fallback checklist
- Required output schema
- Prohibition against invented facts

Suggested user prompt template:

```text
Given the following structured weather summary, generate a concise travel weather interpretation and packing recommendation.

Rules:
- Use only the provided weather data.
- Do not invent weather values.
- Do not invent official alerts.
- Keep recommendations practical and weather-related.
- Preserve the checklist categories.
- Return valid JSON only.

Input:
{{structured_weather_json}}

Required JSON schema:
{
  "summary": "string",
  "travelInsights": ["string"],
  "packingChecklist": {
    "clothing": ["string"],
    "weatherProtection": ["string"],
    "accessories": ["string"],
    "healthAndSafety": ["string"],
    "optional": ["string"]
  }
}
```

---

## 8. AI Output Contract

DeepSeek must return valid JSON.

Expected output:

```json
{
  "summary": "Expect cool and rainy weather with some wind. Pack light layers and rain protection.",
  "travelInsights": [
    "Rain may affect outdoor plans.",
    "Wind may make the temperature feel colder.",
    "A light layer should be useful during cooler parts of the day."
  ],
  "packingChecklist": {
    "clothing": ["Light sweater", "Long pants"],
    "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
    "accessories": ["Power bank", "Reusable water bottle"],
    "healthAndSafety": [],
    "optional": ["Extra socks"]
  }
}
```

The backend may attach metadata after validation:

```json
{
  "aiStatus": "generated",
  "aiRecommendation": {
    "summary": "...",
    "travelInsights": [],
    "packingChecklist": {},
    "model": "deepseek-chat"
  }
}
```

---

## 9. Checklist Categories

The AI must preserve these categories:

```ts
type PackingChecklist = {
  clothing: string[];
  weatherProtection: string[];
  accessories: string[];
  healthAndSafety: string[];
  optional: string[];
};
```

Category meanings:

- `clothing`: wearable items such as jacket, sweater, pants, thermal layers
- `weatherProtection`: items for rain, snow, wind, sun, or cold exposure
- `accessories`: general travel accessories related to weather usefulness
- `healthAndSafety`: sunscreen, hydration, medication reminders, visibility items
- `optional`: useful but non-essential items

---

## 10. Validation Rules

The backend must validate the AI output before using it.

Required validations:

1. Output is valid JSON.
2. Output has `summary` as string.
3. Output has `travelInsights` as string array.
4. Output has `packingChecklist` object.
5. Checklist contains all required categories.
6. Checklist values are arrays of strings.
7. Items are related to weather or travel practicality.
8. Output does not contradict weather data.
9. Output does not include unsupported official alerts.
10. Output does not include unsafe recommendations.

If validation fails, discard AI output and use deterministic fallback.

---

## 11. Contradiction Rules

AI output must be rejected if it contradicts the normalized weather summary.

Examples:

### Reject

Weather summary:

```json
{
  "snowfallExpected": false,
  "minTemperatureC": 24
}
```

AI output:

```json
{
  "packingChecklist": {
    "clothing": ["Heavy snow boots", "Thermal gloves"]
  }
}
```

Reason: recommends snow-specific items without snow or cold conditions.

### Reject

Weather summary:

```json
{
  "uvIndexMax": 2,
  "maxTemperatureC": 12
}
```

AI output:

```json
{
  "summary": "Extreme sun exposure is expected."
}
```

Reason: invents high UV risk.

### Accept

Weather summary:

```json
{
  "rainProbabilityMaxPercent": 70
}
```

AI output:

```json
{
  "packingChecklist": {
    "weatherProtection": ["Waterproof jacket", "Compact umbrella"]
  }
}
```

Reason: recommendation is supported by rain probability.

---

## 12. Fallback Behavior

Fallback is mandatory.

Use fallback when:

- `AI_RECOMMENDATIONS_ENABLED=false`
- `DEEPSEEK_API_KEY` is missing
- DeepSeek request times out
- DeepSeek returns invalid JSON
- DeepSeek output fails validation
- DeepSeek service returns an error

Fallback response behavior:

```json
{
  "aiRecommendation": null,
  "aiStatus": "fallback_used",
  "weatherProfile": {
    "mainScenario": "Cool and rainy",
    "riskLevel": "moderate",
    "detectedConditions": ["cool", "rain"],
    "summary": "Generated from deterministic weather rules."
  },
  "travelInsights": ["Rain is likely during this trip."],
  "packingChecklist": {
    "clothing": ["Light sweater"],
    "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
    "accessories": [],
    "healthAndSafety": [],
    "optional": ["Extra socks"]
  }
}
```

Fallback should be treated as successful product behavior, not a broken app state.

---

## 13. Timeout and Cost Controls

The DeepSeek call should be cost-aware and latency-aware.

Recommended controls:

- Short prompt with compact JSON
- Small output schema
- Request timeout
- No repeated AI calls when reading saved records
- AI call only on create/update operations
- Persist AI output once generated
- Config flag to disable AI recommendations

Suggested timeout:

```text
AI request timeout: 10-15 seconds
```

If timeout occurs, use deterministic fallback.

---

## 14. Persistence Rules

Persist:

- Normalized weather data
- Weather profile
- Fallback checklist
- AI recommendation when valid
- AI status

Do not persist:

- DeepSeek API key
- Full raw prompt if it contains unnecessary user data
- Internal error stack traces

Reading a saved request should return persisted data and should not call DeepSeek again.

---

## 15. Observability Rules

The backend should log safe AI events for debugging.

Recommended internal events:

- `ai_recommendation_started`
- `ai_recommendation_completed`
- `ai_recommendation_failed`
- `ai_recommendation_invalid_json`
- `ai_recommendation_validation_failed`
- `ai_recommendation_fallback_used`

Logs must not include:

- API keys
- Secrets
- Authorization headers
- Full raw user-sensitive payloads

---

## 16. Error / Warning Contract

AI failure should usually return a successful weather response with warning, because fallback is available.

Example:

```json
{
  "data": {
    "id": "req_001",
    "aiStatus": "fallback_used",
    "aiRecommendation": null,
    "packingChecklist": {}
  },
  "warning": {
    "code": "AI_RECOMMENDATION_UNAVAILABLE",
    "message": "The packing checklist was generated using deterministic fallback rules."
  }
}
```

Only return a hard error if both weather retrieval and fallback generation fail.

---

## 17. Safety and Product Boundaries

The AI output should remain practical and limited to travel/weather preparation.

Allowed examples:

- Bring a light jacket.
- Pack sunscreen because UV is high.
- Bring waterproof shoes if rain or snow is expected.
- Consider a power bank during storm risk.
- Plan extra time if fog or low visibility is expected.

Disallowed examples:

- Inventing official hurricane warnings.
- Claiming government alerts that were not provided.
- Giving medical advice beyond basic hydration or sun protection.
- Recommending dangerous behavior during severe weather.
- Making airline baggage claims or luggage-size rules.

---

## 18. Implementation Notes

The DeepSeek integration should live in:

```text
apps/api/src/services/deepseek.service.ts
```

The checklist validation should live in:

```text
apps/api/src/services/checklistValidator.service.ts
```

The deterministic fallback should live in:

```text
apps/api/src/services/packingRules.service.ts
```

No DeepSeek logic should be placed directly inside route handlers.

---

## 19. Acceptance Criteria

This contract is satisfied when:

- DeepSeek is called only from the backend.
- DeepSeek receives structured weather summaries.
- DeepSeek returns structured JSON.
- Backend validates AI output.
- Deterministic fallback works without DeepSeek.
- Saved records can be read without another AI call.
- AI failure does not break basic weather and checklist functionality.
- No secrets are exposed to the frontend or committed to Git.

---

## 20. Final Rule

The AI layer should make the product more useful, not less reliable.

```text
Weather API = facts
Rules = safety and fallback
DeepSeek = interpretation and clarity
Backend validation = final gate
```
