# Data Model — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Document status:** Initial data model contract  
**Version:** 0.1  
**Database target:** SQLite with Prisma

---

## 1. Purpose

This document defines the initial persistence model for Weather Packing Assistant.

The data model must support:

- Saving weather requests
- Storing resolved locations
- Persisting normalized weather data
- Persisting forecast data
- Persisting deterministic weather profiles
- Persisting packing checklists
- Persisting optional DeepSeek AI recommendations
- Supporting CRUD operations
- Supporting CSV and JSON export

The first version intentionally uses a compact model so the project remains easy to implement, run, and evaluate locally.

---

## 2. Storage Strategy

The MVP uses:

```text
SQLite + Prisma
```

SQLite is enough for local development and technical assessment because:

- It requires no external database service.
- It is easy for evaluators to run locally.
- It works well with Prisma migrations.
- It supports the CRUD and export requirements.

A future migration to PostgreSQL is possible without changing the API contract significantly.

---

## 3. Main Entity

The MVP has one primary entity:

```text
WeatherRequest
```

A WeatherRequest represents one user request for weather and packing guidance for a location and date range.

It stores both:

- User input and resolved location data
- Generated weather/packing result data

This allows saved requests to be read later without calling external APIs again.

---

## 4. Prisma Schema

Initial schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model WeatherRequest {
  id                   String   @id @default(cuid())

  locationInput        String
  resolvedLocationName String
  country              String?
  latitude             Float
  longitude            Float

  startDate            DateTime
  endDate              DateTime

  currentWeatherJson   Json
  forecastJson         Json
  weatherProfileJson   Json
  travelInsightsJson   Json
  packingChecklistJson Json
  aiRecommendationJson Json?

  aiStatus             String   @default("not_requested")

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([resolvedLocationName])
  @@index([country])
  @@index([startDate])
  @@index([endDate])
  @@index([createdAt])
}
```

---

## 5. Field Definitions

### `id`

Unique identifier for each stored request.

Type:

```prisma
String @id @default(cuid())
```

Used by:

- `GET /api/weather-requests/:id`
- `PUT /api/weather-requests/:id`
- `DELETE /api/weather-requests/:id`

---

### `locationInput`

Original location submitted by the user.

Examples:

```text
London
Paris
10001
Eiffel Tower
-23.5505,-46.6333
```

This field preserves what the user typed before geocoding.

---

### `resolvedLocationName`

Normalized location name returned by the geocoding service.

Examples:

```text
London
Paris
São Paulo
New York
```

Used for display, filtering, and export.

---

### `country`

Optional country returned by the geocoding provider.

Examples:

```text
United Kingdom
France
Brazil
United States
```

---

### `latitude` and `longitude`

Coordinates used to fetch weather data.

Type:

```prisma
Float
```

These values should come from geocoding or browser geolocation.

---

### `startDate` and `endDate`

Date range for the weather request.

Type:

```prisma
DateTime
```

API input format:

```text
YYYY-MM-DD
```

Rules:

- `startDate` is required.
- `endDate` is required.
- `endDate` must be equal to or after `startDate`.
- Date range must be supported by the selected weather API.

---

## 6. JSON Fields

The model stores structured JSON snapshots so saved requests can be read and exported without recomputing or re-fetching.

### `currentWeatherJson`

Stores normalized current weather.

Expected shape:

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

---

### `forecastJson`

Stores normalized forecast days.

Expected shape:

```ts
type ForecastDay[] = Array<{
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
}>;
```

---

### `weatherProfileJson`

Stores the deterministic weather classification profile.

Expected shape:

```ts
type WeatherProfile = {
  mainScenario: string;
  riskLevel: "low" | "moderate" | "high";
  detectedConditions: string[];
  summary: string;
};
```

Examples:

```json
{
  "mainScenario": "Cool and rainy",
  "riskLevel": "moderate",
  "detectedConditions": ["cool", "rain", "wind"],
  "summary": "Cool temperatures with likely rain and some wind."
}
```

---

### `travelInsightsJson`

Stores practical insights for the user.

Expected shape:

```ts
type TravelInsights = string[];
```

Examples:

```json
[
  "Rain may affect outdoor plans.",
  "A light layer should be useful during cooler periods."
]
```

---

### `packingChecklistJson`

Stores the final validated checklist returned to the frontend.

Expected shape:

```ts
type PackingChecklist = {
  clothing: string[];
  weatherProtection: string[];
  accessories: string[];
  healthAndSafety: string[];
  optional: string[];
};
```

Example:

```json
{
  "clothing": ["Light jacket", "Long pants"],
  "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
  "accessories": ["Power bank"],
  "healthAndSafety": [],
  "optional": ["Extra socks"]
}
```

---

### `aiRecommendationJson`

Stores the valid DeepSeek recommendation when available.

Expected shape:

```ts
type AiRecommendation = {
  summary: string;
  travelInsights: string[];
  packingChecklist: PackingChecklist;
  model?: string;
};
```

Rules:

- Nullable.
- Must only be stored after backend validation.
- Must not contain API keys.
- Must not contain raw internal stack traces.
- Must not be used as source of truth for weather facts.

---

## 7. AI Status

The `aiStatus` field stores how the final recommendation was produced.

Allowed values:

```ts
type AiStatus =
  | "generated"
  | "fallback_used"
  | "disabled"
  | "not_requested";
```

Meanings:

| Value | Meaning |
|---|---|
| `generated` | DeepSeek returned valid JSON and backend validation passed |
| `fallback_used` | DeepSeek failed, timed out, or returned invalid output; deterministic rules were used |
| `disabled` | AI recommendations were disabled by config or request |
| `not_requested` | AI was not attempted |

For Prisma MVP, this can be stored as `String`. A future migration may convert it to an enum if needed.

---

## 8. Data Lifecycle

### Create Flow

```text
POST /api/weather-requests
  -> validate request
  -> resolve location
  -> fetch weather
  -> normalize weather
  -> classify weather
  -> generate deterministic checklist
  -> optionally call DeepSeek
  -> validate AI output
  -> persist final result
  -> return saved WeatherRequest
```

### Read Flow

```text
GET /api/weather-requests/:id
  -> read persisted record
  -> return stored result
```

Read operations should not call:

- Geocoding API
- Weather API
- DeepSeek API

### Update Flow

```text
PUT /api/weather-requests/:id
  -> find existing record
  -> validate new request data
  -> resolve location again if location changed
  -> fetch weather again if location/date changed
  -> regenerate profile and checklist
  -> optionally call DeepSeek
  -> validate AI output
  -> update persisted record
  -> return updated WeatherRequest
```

### Delete Flow

```text
DELETE /api/weather-requests/:id
  -> find existing record
  -> delete record
  -> return deleted status
```

### Export Flow

```text
GET /api/weather-requests/export.csv
GET /api/weather-requests/export.json
  -> read persisted records
  -> transform for export
  -> return file/JSON
```

Export operations should not call external APIs.

---

## 9. API Response Mapping

The database model should not be returned directly without mapping.

Repository record:

```ts
{
  currentWeatherJson: Json;
  forecastJson: Json;
  weatherProfileJson: Json;
  travelInsightsJson: Json;
  packingChecklistJson: Json;
  aiRecommendationJson: Json | null;
}
```

API response:

```ts
{
  currentWeather: CurrentWeather;
  forecast: ForecastDay[];
  weatherProfile: WeatherProfile;
  travelInsights: string[];
  packingChecklist: PackingChecklist;
  aiRecommendation: AiRecommendation | null;
}
```

This keeps persistence naming separate from API contract naming.

---

## 10. Export Mapping

CSV export should flatten complex JSON fields.

Suggested CSV columns:

```text
id
locationInput
resolvedLocationName
country
latitude
longitude
startDate
endDate
mainScenario
riskLevel
detectedConditions
aiStatus
createdAt
updatedAt
```

For `detectedConditions`, use a delimiter:

```text
cool|rain|wind
```

JSON export can preserve nested objects.

---

## 11. Indexing Strategy

Initial indexes:

```prisma
@@index([resolvedLocationName])
@@index([country])
@@index([startDate])
@@index([endDate])
@@index([createdAt])
```

Why:

- `resolvedLocationName`: supports filtering by location.
- `country`: supports future filtering/grouping.
- `startDate` and `endDate`: support date range filters.
- `createdAt`: supports sorting saved requests.

---

## 12. Validation Before Persistence

Before saving a record, the backend must validate:

- Location is resolved.
- Latitude and longitude are valid numbers.
- Date range is valid.
- Current weather exists.
- Forecast exists.
- Weather profile has required fields.
- Checklist has required categories.
- AI recommendation is either valid or null.
- AI status is one of the allowed values.

Invalid data should not be persisted.

---

## 13. Data Not to Store

Do not store:

- DeepSeek API key
- Authorization headers
- Raw secrets
- Stack traces
- Browser geolocation permission metadata
- Unvalidated AI output
- Sensitive user information unrelated to the request

This assessment does not require user accounts, so no personal account profile should be stored.

---

## 14. Future Data Model Extensions

Possible future models:

```prisma
model UserPreference {
  id                String   @id @default(cuid())
  preferredUnits    String   @default("metric")
  packingStyle      String   @default("balanced")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

```prisma
model ExportLog {
  id         String   @id @default(cuid())
  format     String
  recordCount Int
  createdAt  DateTime @default(now())
}
```

These are out of scope for the MVP unless implementation time allows.

---

## 15. Migration Plan

Initial migration command:

```bash
npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npx prisma generate
```

Inspect database:

```bash
npx prisma studio
```

---

## 16. Repository Layer Contract

Suggested repository file:

```text
apps/api/src/repositories/weatherRequest.repository.ts
```

Suggested functions:

```ts
createWeatherRequest(data: CreateWeatherRequestRecord): Promise<WeatherRequestRecord>
listWeatherRequests(filters: WeatherRequestFilters): Promise<WeatherRequestRecord[]>
getWeatherRequestById(id: string): Promise<WeatherRequestRecord | null>
updateWeatherRequest(id: string, data: UpdateWeatherRequestRecord): Promise<WeatherRequestRecord>
deleteWeatherRequest(id: string): Promise<void>
```

Repository functions should only handle persistence concerns.

They should not:

- Call Weather API
- Call DeepSeek
- Generate packing recommendations
- Validate business rules beyond basic persistence constraints

---

## 17. Acceptance Criteria

This data model is complete for MVP when:

- Prisma schema includes `WeatherRequest`.
- SQLite database can be migrated locally.
- Create endpoint persists a full weather request result.
- Read endpoint returns persisted data without external API calls.
- Update endpoint refreshes and persists new data.
- Delete endpoint removes records.
- CSV export can flatten records.
- JSON export can preserve nested records.
- AI output is stored only after validation.
- The app works when `aiRecommendationJson` is null.

---

## 18. Final Rule

Persist final validated product state, not untrusted intermediate output.

```text
Weather API data + deterministic validation + optional valid AI output = stored WeatherRequest
```
