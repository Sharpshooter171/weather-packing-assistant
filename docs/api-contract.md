# API Contract — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Document status:** Initial REST API contract  
**Version:** 0.1  
**Base path:** `/api`

---

## 1. Purpose

This document defines the backend REST API contract for Weather Packing Assistant.

The API must support:

- Health check
- Weather request creation
- Weather request listing
- Weather request detail retrieval
- Weather request update
- Weather request deletion
- CSV export
- JSON export

The API should remain stable during implementation. Any breaking change must update this document before code changes are considered complete.

---

## 2. Global API Rules

### Response Format

All JSON endpoints must return JSON.

Successful responses should use either:

```json
{
  "data": {}
}
```

or, for list endpoints:

```json
{
  "data": [],
  "meta": {}
}
```

Error responses must use:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message"
}
```

Optional diagnostic fields may be included only when safe:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "details": {}
}
```

### Content Type

For request bodies:

```http
Content-Type: application/json
```

For JSON responses:

```http
Content-Type: application/json
```

For CSV export:

```http
Content-Type: text/csv
```

### Security Rules

- Never return secrets.
- Never return stack traces.
- Never expose `DEEPSEEK_API_KEY`.
- The frontend must not call DeepSeek directly.
- Weather facts must come from the weather provider, not from the LLM.

---

## 3. Entity: WeatherRequest

Primary persisted entity.

```ts
type WeatherRequest = {
  id: string;
  locationInput: string;
  resolvedLocationName: string;
  country?: string | null;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  currentWeather: CurrentWeather;
  forecast: ForecastDay[];
  weatherProfile: WeatherProfile;
  travelInsights: string[];
  packingChecklist: PackingChecklist;
  aiRecommendation?: AiRecommendation | null;
  aiStatus: "generated" | "fallback_used" | "disabled" | "not_requested";
  createdAt: string;
  updatedAt: string;
};
```

---

## 4. Shared Types

### CurrentWeather

```ts
type CurrentWeather = {
  temperatureC: number;
  feelsLikeC?: number | null;
  condition: string;
  weatherCode?: number | null;
  humidityPercent?: number | null;
  windSpeedKmh?: number | null;
  windGustKmh?: number | null;
  uvIndex?: number | null;
  precipitationProbabilityPercent?: number | null;
  isDay?: boolean | null;
  observedAt?: string | null;
};
```

### ForecastDay

```ts
type ForecastDay = {
  date: string;
  minTemperatureC: number;
  maxTemperatureC: number;
  precipitationProbabilityMaxPercent?: number | null;
  rainSumMm?: number | null;
  snowfallSumCm?: number | null;
  windSpeedMaxKmh?: number | null;
  windGustsMaxKmh?: number | null;
  uvIndexMax?: number | null;
  weatherCode?: number | null;
  condition: string;
};
```

### WeatherProfile

```ts
type WeatherProfile = {
  mainScenario: string;
  riskLevel: "low" | "moderate" | "high";
  detectedConditions: string[];
  summary: string;
};
```

### PackingChecklist

```ts
type PackingChecklist = {
  clothing: string[];
  weatherProtection: string[];
  accessories: string[];
  healthAndSafety: string[];
  optional: string[];
};
```

### AiRecommendation

```ts
type AiRecommendation = {
  summary: string;
  travelInsights: string[];
  packingChecklist: PackingChecklist;
  model?: string;
};
```

---

## 5. Endpoint: Health Check

### Request

```http
GET /api/health
```

### Success Response

Status: `200 OK`

```json
{
  "data": {
    "status": "ok",
    "service": "weather-packing-assistant-api",
    "version": "0.1"
  }
}
```

---

## 6. Endpoint: Create Weather Request

Creates a weather request, resolves location, fetches weather data, generates interpretation, stores the result, and returns the saved record.

### Request

```http
POST /api/weather-requests
```

### Body

```json
{
  "location": "London",
  "startDate": "2026-07-10",
  "endDate": "2026-07-15",
  "useAi": true
}
```

### Required Fields

- `location`
- `startDate`
- `endDate`

### Optional Fields

- `useAi`: boolean. Defaults to `true` when AI recommendations are enabled in the backend.

### Success Response

Status: `201 Created`

```json
{
  "data": {
    "id": "req_001",
    "locationInput": "London",
    "resolvedLocationName": "London",
    "country": "United Kingdom",
    "latitude": 51.5072,
    "longitude": -0.1276,
    "startDate": "2026-07-10",
    "endDate": "2026-07-15",
    "currentWeather": {
      "temperatureC": 18,
      "feelsLikeC": 17,
      "condition": "Rainy",
      "weatherCode": 61,
      "humidityPercent": 76,
      "windSpeedKmh": 22,
      "windGustKmh": 35,
      "uvIndex": 5,
      "precipitationProbabilityPercent": 70,
      "isDay": true,
      "observedAt": "2026-07-10T12:00:00.000Z"
    },
    "forecast": [
      {
        "date": "2026-07-10",
        "minTemperatureC": 12,
        "maxTemperatureC": 18,
        "precipitationProbabilityMaxPercent": 70,
        "rainSumMm": 4.2,
        "snowfallSumCm": 0,
        "windSpeedMaxKmh": 25,
        "windGustsMaxKmh": 38,
        "uvIndexMax": 5,
        "weatherCode": 61,
        "condition": "Rain"
      }
    ],
    "weatherProfile": {
      "mainScenario": "Cool and rainy",
      "riskLevel": "moderate",
      "detectedConditions": ["cool", "rain", "wind"],
      "summary": "Cool temperatures with rain and moderate wind."
    },
    "travelInsights": [
      "Rain may affect outdoor plans.",
      "Wind may make the temperature feel colder."
    ],
    "packingChecklist": {
      "clothing": ["Light sweater", "Long pants"],
      "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
      "accessories": ["Power bank", "Reusable water bottle"],
      "healthAndSafety": [],
      "optional": ["Extra socks"]
    },
    "aiRecommendation": {
      "summary": "Expect cool and rainy weather. Pack layers and rain protection.",
      "travelInsights": [
        "Rain may affect outdoor plans.",
        "Wind may make the temperature feel colder."
      ],
      "packingChecklist": {
        "clothing": ["Light sweater", "Long pants"],
        "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
        "accessories": ["Power bank", "Reusable water bottle"],
        "healthAndSafety": [],
        "optional": ["Extra socks"]
      },
      "model": "deepseek-chat"
    },
    "aiStatus": "generated",
    "createdAt": "2026-06-26T12:00:00.000Z",
    "updatedAt": "2026-06-26T12:00:00.000Z"
  }
}
```

### AI Fallback Response Behavior

If DeepSeek fails but deterministic weather and packing rules succeed, return success with `aiStatus = "fallback_used"`.

Status: `201 Created`

```json
{
  "data": {
    "id": "req_001",
    "aiRecommendation": null,
    "aiStatus": "fallback_used",
    "weatherProfile": {
      "mainScenario": "Cool and rainy",
      "riskLevel": "moderate",
      "detectedConditions": ["cool", "rain"],
      "summary": "Generated from deterministic fallback rules."
    },
    "travelInsights": ["Rain is likely during this trip."],
    "packingChecklist": {
      "clothing": ["Light sweater"],
      "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
      "accessories": [],
      "healthAndSafety": [],
      "optional": ["Extra socks"]
    }
  },
  "warning": {
    "code": "AI_RECOMMENDATION_UNAVAILABLE",
    "message": "The packing checklist was generated using deterministic fallback rules."
  }
}
```

---

## 7. Endpoint: List Weather Requests

Returns stored weather requests.

### Request

```http
GET /api/weather-requests
```

### Optional Query Parameters

```text
limit=20
offset=0
location=London
```

### Success Response

Status: `200 OK`

```json
{
  "data": [
    {
      "id": "req_001",
      "locationInput": "London",
      "resolvedLocationName": "London",
      "country": "United Kingdom",
      "startDate": "2026-07-10",
      "endDate": "2026-07-15",
      "weatherProfile": {
        "mainScenario": "Cool and rainy",
        "riskLevel": "moderate",
        "detectedConditions": ["cool", "rain"],
        "summary": "Cool temperatures with rain."
      },
      "aiStatus": "generated",
      "createdAt": "2026-06-26T12:00:00.000Z",
      "updatedAt": "2026-06-26T12:00:00.000Z"
    }
  ],
  "meta": {
    "limit": 20,
    "offset": 0,
    "count": 1
  }
}
```

---

## 8. Endpoint: Get Weather Request by ID

### Request

```http
GET /api/weather-requests/:id
```

### Success Response

Status: `200 OK`

```json
{
  "data": {
    "id": "req_001",
    "locationInput": "London",
    "resolvedLocationName": "London",
    "country": "United Kingdom",
    "latitude": 51.5072,
    "longitude": -0.1276,
    "startDate": "2026-07-10",
    "endDate": "2026-07-15",
    "currentWeather": {},
    "forecast": [],
    "weatherProfile": {},
    "travelInsights": [],
    "packingChecklist": {},
    "aiRecommendation": null,
    "aiStatus": "fallback_used",
    "createdAt": "2026-06-26T12:00:00.000Z",
    "updatedAt": "2026-06-26T12:00:00.000Z"
  }
}
```

### Not Found Response

Status: `404 Not Found`

```json
{
  "error": "WEATHER_REQUEST_NOT_FOUND",
  "message": "Weather request not found."
}
```

---

## 9. Endpoint: Update Weather Request

Updates a weather request. Updating location or date range should refresh weather data and recommendations.

### Request

```http
PUT /api/weather-requests/:id
```

### Body

```json
{
  "location": "Paris",
  "startDate": "2026-07-12",
  "endDate": "2026-07-16",
  "useAi": true
}
```

### Editable Fields

- `location`
- `startDate`
- `endDate`
- `useAi`

### Success Response

Status: `200 OK`

```json
{
  "data": {
    "id": "req_001",
    "locationInput": "Paris",
    "resolvedLocationName": "Paris",
    "country": "France",
    "startDate": "2026-07-12",
    "endDate": "2026-07-16",
    "forecast": [],
    "weatherProfile": {},
    "packingChecklist": {},
    "aiStatus": "generated",
    "updatedAt": "2026-06-26T12:30:00.000Z"
  }
}
```

### Not Found Response

Status: `404 Not Found`

```json
{
  "error": "WEATHER_REQUEST_NOT_FOUND",
  "message": "Weather request not found."
}
```

---

## 10. Endpoint: Delete Weather Request

### Request

```http
DELETE /api/weather-requests/:id
```

### Success Response

Status: `200 OK`

```json
{
  "data": {
    "deleted": true,
    "id": "req_001"
  }
}
```

### Not Found Response

Status: `404 Not Found`

```json
{
  "error": "WEATHER_REQUEST_NOT_FOUND",
  "message": "Weather request not found."
}
```

---

## 11. Endpoint: Export CSV

Exports stored records as CSV.

### Request

```http
GET /api/weather-requests/export.csv
```

### Optional Query Parameters

```text
location=London
startDate=2026-07-10
endDate=2026-07-15
```

### Success Response

Status: `200 OK`

Headers:

```http
Content-Type: text/csv
Content-Disposition: attachment; filename="weather-requests.csv"
```

Example CSV columns:

```csv
id,locationInput,resolvedLocationName,country,startDate,endDate,mainScenario,riskLevel,detectedConditions,aiStatus,createdAt,updatedAt
req_001,London,London,United Kingdom,2026-07-10,2026-07-15,Cool and rainy,moderate,"cool|rain|wind",generated,2026-06-26T12:00:00.000Z,2026-06-26T12:00:00.000Z
```

---

## 12. Endpoint: Export JSON

Exports stored records as JSON.

### Request

```http
GET /api/weather-requests/export.json
```

### Success Response

Status: `200 OK`

```json
{
  "data": [
    {
      "id": "req_001",
      "locationInput": "London",
      "resolvedLocationName": "London",
      "country": "United Kingdom",
      "startDate": "2026-07-10",
      "endDate": "2026-07-15",
      "weatherProfile": {},
      "packingChecklist": {},
      "aiStatus": "generated",
      "createdAt": "2026-06-26T12:00:00.000Z",
      "updatedAt": "2026-06-26T12:00:00.000Z"
    }
  ],
  "meta": {
    "exportedAt": "2026-06-26T13:00:00.000Z",
    "count": 1
  }
}
```

---

## 13. Validation Rules

### Location

`location` must be:

- A non-empty string
- At least 2 characters after trimming
- Resolvable through geocoding or valid GPS coordinates

If location cannot be resolved:

Status: `404 Not Found`

```json
{
  "error": "LOCATION_NOT_FOUND",
  "message": "We could not find this location. Please try a city, postal code, landmark, or GPS coordinates."
}
```

### Date Range

Rules:

- `startDate` is required
- `endDate` is required
- Dates must use `YYYY-MM-DD`
- `endDate` must be equal to or after `startDate`
- Date range must be supported by the selected weather API

Invalid date range:

Status: `400 Bad Request`

```json
{
  "error": "INVALID_DATE_RANGE",
  "message": "The end date must be equal to or after the start date."
}
```

### AI Output

AI output must:

- Be valid JSON
- Include `summary`
- Include `travelInsights`
- Include `packingChecklist`
- Preserve checklist categories
- Not contradict detected weather conditions

Invalid AI output should not fail the entire request. It should trigger fallback.

---

## 14. Standard Error Codes

| Error Code | Status | Meaning |
|---|---:|---|
| `INVALID_REQUEST_BODY` | 400 | Request body is missing or malformed |
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing |
| `INVALID_LOCATION_INPUT` | 400 | Location field is invalid before geocoding |
| `LOCATION_NOT_FOUND` | 404 | Location could not be resolved |
| `INVALID_DATE_RANGE` | 400 | Date range is invalid |
| `UNSUPPORTED_DATE_RANGE` | 400 | Date range is not supported by the weather API |
| `WEATHER_API_ERROR` | 502 | Weather provider failed |
| `AI_RECOMMENDATION_UNAVAILABLE` | 200/201 warning | AI failed, fallback used |
| `WEATHER_REQUEST_NOT_FOUND` | 404 | Stored request was not found |
| `EXPORT_ERROR` | 500 | Export generation failed |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected backend failure |

---

## 15. HTTP Status Guidelines

| Operation | Success Status |
|---|---:|
| Health check | 200 |
| Create weather request | 201 |
| List weather requests | 200 |
| Get weather request | 200 |
| Update weather request | 200 |
| Delete weather request | 200 |
| Export CSV | 200 |
| Export JSON | 200 |

---

## 16. Implementation Notes

- Create and update endpoints should call weather/geocoding APIs.
- Read endpoints should return persisted records and should not call external APIs.
- Export endpoints should read from the database and should not call external APIs.
- DeepSeek failures should not block the main weather request when deterministic fallback is available.
- API responses should remain stable for frontend implementation.
- Any route contract change must update this document.

---

## 17. Minimal Curl Examples

### Health

```bash
curl http://localhost:4000/api/health
```

### Create

```bash
curl -X POST http://localhost:4000/api/weather-requests \
  -H "Content-Type: application/json" \
  -d '{"location":"London","startDate":"2026-07-10","endDate":"2026-07-15","useAi":true}'
```

### List

```bash
curl http://localhost:4000/api/weather-requests
```

### Get by ID

```bash
curl http://localhost:4000/api/weather-requests/req_001
```

### Update

```bash
curl -X PUT http://localhost:4000/api/weather-requests/req_001 \
  -H "Content-Type: application/json" \
  -d '{"location":"Paris","startDate":"2026-07-12","endDate":"2026-07-16","useAi":true}'
```

### Delete

```bash
curl -X DELETE http://localhost:4000/api/weather-requests/req_001
```

### Export CSV

```bash
curl -L http://localhost:4000/api/weather-requests/export.csv -o weather-requests.csv
```

### Export JSON

```bash
curl http://localhost:4000/api/weather-requests/export.json
```
