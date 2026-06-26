# Architecture — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Document status:** Initial architecture contract  
**Version:** 0.1  
**Primary goal:** guide implementation with a clear, simple, and testable full-stack architecture.

---

## 1. Architecture Overview

Weather Packing Assistant is a full-stack web application composed of:

- A **Next.js / React / TypeScript frontend**
- A **Node.js / Express / TypeScript backend API**
- A **SQLite database managed with Prisma**
- A **weather retrieval layer** using an external weather API
- A **weather normalization layer**
- A **deterministic weather classification layer**
- An optional **DeepSeek AI interpretation layer**
- A **checklist validation and fallback layer**
- An **export layer** for CSV and JSON output

The architecture is intentionally modular so each part can be developed and tested independently.

---

## 2. Core Architecture Principle

This project is inspired by a safe AI orchestration pattern:

> External data is the source of truth.  
> Deterministic services normalize and validate.  
> The LLM may interpret and explain.  
> The backend validates the final output.

For this project:

```text
Weather API provides real weather data.
Backend validates and normalizes the data.
Rule-based services classify the weather.
DeepSeek may generate friendly recommendations.
Backend validates the AI output.
Fallback rules keep the app working without AI.
```

The LLM must never be the source of truth for weather facts.

---

## 3. High-Level System Diagram

```text
User Browser
  |
  v
Next.js Frontend
  |
  | HTTP / JSON
  v
Express Backend API
  |
  +--> Request Validation
  |
  +--> Location Resolution Service
  |       |
  |       v
  |   Geocoding API
  |
  +--> Weather Retrieval Service
  |       |
  |       v
  |   Weather Forecast API
  |
  +--> Weather Normalizer
  |
  +--> Weather Classification Engine
  |
  +--> DeepSeek Recommendation Service
  |
  +--> Checklist Validation Service
  |
  +--> Fallback Packing Engine
  |
  +--> Persistence Service
  |       |
  |       v
  |   SQLite / Prisma
  |
  +--> Export Service
  |
  v
Normalized JSON Response
```

---

## 4. Monorepo Structure

Planned project structure:

```text
weather-packing-assistant/
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── prisma/
│   └── schema.prisma
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── server.ts
│       │   ├── app.ts
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── validators/
│       │   ├── repositories/
│       │   ├── middleware/
│       │   ├── config/
│       │   └── types/
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   └── schemas/
│       └── package.json
└── docs/
    ├── product-requirements.md
    ├── architecture.md
    ├── api-contract.md
    ├── ai-weather-interpretation-contract.md
    ├── weather-rules.md
    ├── data-model.md
    ├── devops.md
    ├── testing-plan.md
    ├── ui-reference.md
    └── opencode-implementation-plan.md
```

The initial implementation can be simplified if needed, but API contracts and module boundaries should remain clear.

---

## 5. Frontend Architecture

### Framework

- Next.js
- React
- TypeScript
- Tailwind CSS

### Frontend Responsibilities

The frontend is responsible for:

- Collecting user input
- Supporting manual location search
- Supporting current location through browser geolocation
- Showing loading states
- Showing validation errors from the backend
- Displaying current weather
- Displaying 5-day forecast
- Displaying AI-assisted travel insights
- Displaying packing checklist
- Displaying saved weather requests
- Triggering CRUD operations
- Triggering CSV / JSON exports

The frontend must not:

- Store API secrets
- Call DeepSeek directly
- Treat AI output as trusted without backend validation
- Bypass backend validation
- Hardcode static weather results

### Suggested Main UI Sections

```text
Home Page
  ├── Header / Project Identity
  ├── Search Panel
  ├── Current Weather Card
  ├── 5-Day Forecast Grid
  ├── Weather Interpretation Card
  ├── Packing Checklist Card
  ├── Saved Requests Table
  └── About PM Accelerator Section
```

### Component Ideas

```text
components/
├── LocationSearchForm.tsx
├── CurrentWeatherCard.tsx
├── ForecastGrid.tsx
├── ForecastDayCard.tsx
├── WeatherInsightCard.tsx
├── PackingChecklist.tsx
├── SavedRequestsTable.tsx
├── ExportActions.tsx
├── ErrorMessage.tsx
└── LoadingState.tsx
```

---

## 6. Backend Architecture

### Framework

- Node.js
- Express
- TypeScript

### Backend Responsibilities

The backend is responsible for:

- Validating request payloads
- Resolving locations through geocoding
- Fetching weather data from external APIs
- Normalizing weather API responses
- Classifying weather scenarios
- Calling DeepSeek when enabled
- Validating AI response structure
- Falling back to deterministic packing rules if AI fails
- Persisting records with Prisma
- Providing CRUD endpoints
- Providing export endpoints
- Returning normalized JSON errors

### Backend Must Not

- Expose secrets to the frontend
- Return raw stack traces
- Trust arbitrary AI output
- Store invalid weather requests
- Invent weather data
- Break documented API contracts without updating docs

---

## 7. Backend Module Boundaries

Suggested backend modules:

```text
apps/api/src/
├── server.ts
├── app.ts
├── config/
│   └── env.ts
├── routes/
│   ├── health.routes.ts
│   └── weatherRequests.routes.ts
├── controllers/
│   └── weatherRequests.controller.ts
├── services/
│   ├── geocoding.service.ts
│   ├── weatherApi.service.ts
│   ├── weatherNormalizer.service.ts
│   ├── weatherClassifier.service.ts
│   ├── packingRules.service.ts
│   ├── deepseek.service.ts
│   ├── checklistValidator.service.ts
│   └── export.service.ts
├── repositories/
│   └── weatherRequest.repository.ts
├── validators/
│   └── weatherRequest.validator.ts
├── middleware/
│   └── errorHandler.ts
└── types/
    └── weather.types.ts
```

### Module Ownership

#### `geocoding.service.ts`

- Converts user location input into coordinates.
- Handles city, town, landmark, postal code, and coordinates.
- Does not generate weather recommendations.

#### `weatherApi.service.ts`

- Calls the weather API.
- Fetches current weather and forecast data.
- Does not interpret packing needs.

#### `weatherNormalizer.service.ts`

- Converts external API responses into internal stable types.
- Handles missing optional fields.
- Does not call the LLM.

#### `weatherClassifier.service.ts`

- Detects deterministic weather scenarios.
- Examples: cold, hot, rain, heavy rain, snow, wind, UV, fog, storm.
- Does not generate final user-facing text.

#### `packingRules.service.ts`

- Generates fallback checklist from deterministic weather conditions.
- Must work without DeepSeek.

#### `deepseek.service.ts`

- Receives structured weather summary.
- Requests AI-assisted recommendation.
- Must request structured JSON output.
- Must not receive API secrets from frontend.

#### `checklistValidator.service.ts`

- Validates DeepSeek output.
- Ensures required categories exist.
- Ensures recommendation does not contradict weather data.
- Falls back to deterministic rules when invalid.

#### `export.service.ts`

- Converts stored records into CSV or JSON.
- Does not call weather API or DeepSeek.

---

## 8. Weather Data Pipeline

```text
User input
  |
  v
Request validator
  |
  v
Location resolver
  |
  v
Weather API retrieval
  |
  v
Weather normalization
  |
  v
Weather classification
  |
  v
Packing rules fallback generation
  |
  v
DeepSeek AI interpretation (optional)
  |
  v
Checklist validation
  |
  v
Persistence
  |
  v
API response
```

### Key Rule

The app should generate deterministic recommendations before or alongside the AI call, so the product remains functional if the AI service is disabled, slow, or unavailable.

---

## 9. AI Architecture

### Purpose of DeepSeek

DeepSeek is used to improve the quality and usefulness of weather interpretation and packing recommendations.

It may:

- Explain weather conditions in friendly language
- Organize recommendations into categories
- Generate travel insights
- Suggest essential items from structured weather conditions

It must not:

- Invent forecast values
- Override API weather data
- Produce unrelated suggestions
- Decide whether weather data is true
- Be required for the app to function

### AI Input

DeepSeek should receive a compact JSON summary, not raw API payloads.

Example:

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
    "rainProbabilityMax": 70,
    "snowfallExpected": false,
    "maxWindGustKmh": 42,
    "uvIndexMax": 5,
    "detectedConditions": ["cool", "rain", "wind"]
  },
  "fallbackChecklist": {
    "clothing": ["Light sweater", "Long pants"],
    "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
    "accessories": ["Power bank"]
  }
}
```

### AI Output

DeepSeek should return structured JSON.

Example:

```json
{
  "summary": "Expect cool and rainy weather with some wind. Pack layers and rain protection.",
  "travelInsights": [
    "Rain may affect outdoor plans.",
    "Wind may make the temperature feel colder."
  ],
  "packingChecklist": {
    "clothing": ["Light sweater", "Long pants"],
    "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
    "accessories": ["Power bank", "Reusable water bottle"],
    "healthAndSafety": []
  }
}
```

### AI Fallback

If DeepSeek fails, times out, or returns invalid JSON:

```text
Use fallbackChecklist generated by packingRules.service.ts
Set aiStatus = "fallback_used"
Return a warning field in the response if useful
```

---

## 10. Persistence Architecture

### Database

- SQLite for local development
- Prisma as ORM
- Optional future migration to PostgreSQL

### Main Entity

```text
WeatherRequest
```

Stores:

- Original user location input
- Resolved location
- Coordinates
- Date range
- Current weather JSON
- Forecast JSON
- Weather profile JSON
- Packing checklist JSON
- Optional AI recommendation JSON
- Created timestamp
- Updated timestamp

Persistence should store the result returned to the user so reading saved records does not require calling external APIs again.

---

## 11. API Architecture

Primary routes:

```http
GET    /api/health
POST   /api/weather-requests
GET    /api/weather-requests
GET    /api/weather-requests/:id
PUT    /api/weather-requests/:id
DELETE /api/weather-requests/:id
GET    /api/weather-requests/export.csv
GET    /api/weather-requests/export.json
```

API behavior:

- All successful responses return JSON, except CSV export.
- All errors return normalized JSON.
- Create and update operations trigger weather retrieval and recommendation generation.
- Read operations return persisted data.
- Delete operations remove persisted records.

---

## 12. Error Handling Architecture

Errors should be normalized by middleware.

Examples:

```json
{
  "error": "LOCATION_NOT_FOUND",
  "message": "We could not find this location. Please try another search."
}
```

```json
{
  "error": "INVALID_DATE_RANGE",
  "message": "The end date must be equal to or after the start date."
}
```

```json
{
  "error": "WEATHER_API_ERROR",
  "message": "Weather data is temporarily unavailable. Please try again later."
}
```

AI failures should not break the full request when deterministic fallback is available.

---

## 13. Configuration Architecture

Environment variables:

```env
DATABASE_URL="file:./dev.db"

PORT=4000
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"

WEATHER_API_BASE_URL="https://api.open-meteo.com"
GEOCODING_API_BASE_URL="https://geocoding-api.open-meteo.com"

DEEPSEEK_API_KEY=""
DEEPSEEK_API_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
DEEPSEEK_REASONING_EFFORT="medium"
AI_RECOMMENDATIONS_ENABLED="true"
```

Rules:

- `.env` is local only.
- `.env.example` documents required variables.
- Secrets must not be committed.
- DeepSeek key must only be used by the backend.

---

## 14. Export Architecture

The export service reads from the database and converts stored records.

Initial formats:

- CSV
- JSON

Export should include:

- ID
- Location input
- Resolved location
- Country
- Date range
- Weather summary
- Detected conditions
- Packing checklist
- Created and updated timestamps

Export should not trigger new external API calls.

---

## 15. Frontend / Backend Contract

The frontend communicates only with the backend API.

```text
Frontend
  -> /api/weather-requests
  -> /api/weather-requests/:id
  -> /api/weather-requests/export.csv
  -> /api/weather-requests/export.json
```

The frontend should not call:

- Weather API directly
- DeepSeek API directly
- Database directly

This keeps secrets safe and centralizes validation in the backend.

---

## 16. Implementation Order

Recommended implementation sequence:

1. Root package setup
2. Backend scaffold
3. Health endpoint
4. Prisma schema and SQLite setup
5. WeatherRequest repository
6. Request validation
7. Geocoding service
8. Weather API service
9. Weather normalizer
10. Weather classifier
11. Packing fallback rules
12. DeepSeek service
13. Checklist validator
14. CRUD routes
15. Export routes
16. Frontend scaffold
17. Search form
18. Weather result cards
19. Forecast grid
20. Packing checklist UI
21. Saved requests table
22. Error/loading states
23. README final run instructions
24. Demo polish

---

## 17. Architecture Constraints

- Keep the app simple enough to run locally.
- Do not introduce unnecessary infrastructure.
- Do not require Docker for the first successful local run.
- Do not require DeepSeek to demonstrate core functionality.
- Do not store secrets in source code.
- Do not change documented routes without updating `docs/api-contract.md`.
- Keep modules small and testable.
- Prefer deterministic behavior for validation and fallback.

---

## 18. Future Architecture Extensions

Possible future improvements:

- PostgreSQL database
- Authentication
- User profiles
- Saved packing preferences
- Multiple destinations per trip
- Official severe weather alerts API
- Google Maps integration
- YouTube travel video integration
- PDF or Markdown export
- Deployment to Vercel / Render / Railway

---

## 19. Summary

This architecture is designed to demonstrate:

- Full-stack development
- REST API design
- External API retrieval
- Database persistence
- CRUD operations
- Export functionality
- Responsible LLM usage
- Deterministic fallback behavior
- Product-oriented engineering

The main product differentiator is the weather interpretation pipeline:

```text
raw weather data
  -> normalized forecast
  -> detected weather conditions
  -> AI-assisted interpretation
  -> validated packing checklist
  -> practical travel guidance
```
