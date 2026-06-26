# Testing Plan — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Document status:** Initial testing strategy  
**Version:** 0.1

---

## 1. Purpose

This document defines the testing strategy for Weather Packing Assistant.

The goal is to prove that the app satisfies the full-stack technical assessment requirements and remains reliable when external services or AI responses fail.

The testing plan covers:

- Request validation
- Weather rules
- Packing checklist generation
- DeepSeek output validation
- Fallback behavior
- CRUD operations
- Database persistence
- Export behavior
- Frontend user flows
- Manual demo readiness

---

## 2. Testing Philosophy

The project should prioritize simple, high-value tests over excessive coverage.

Core principles:

```text
1. Test deterministic logic first.
2. Mock external APIs in automated tests.
3. Verify fallback behavior without DeepSeek.
4. Keep tests easy to run locally.
5. Do not depend on live weather API calls for unit tests.
6. Do not depend on a real DeepSeek API key for core tests.
7. Manual tests should cover the final user experience.
```

The evaluator should be able to run the project and understand what is tested.

---

## 3. Test Types

### Unit Tests

Used for isolated logic:

- Date validation
- Location input validation
- Weather code mapping
- Weather classification
- Packing rules
- Checklist validation
- AI JSON parsing
- Export format utilities

### Integration Tests

Used for module interaction:

- API route + controller + service
- Repository + Prisma test database
- Create/read/update/delete flows
- Export routes
- AI fallback path

### Manual Tests

Used for end-to-end demo validation:

- User searches location
- App displays current weather
- App displays 5-day forecast
- App displays packing checklist
- User manages saved records
- User exports data
- App handles invalid input

---

## 4. Recommended Test Tools

Suggested backend tools:

```text
Vitest
Supertest
Prisma test database
```

Suggested frontend tools if time allows:

```text
Vitest
React Testing Library
Playwright optional
```

The MVP can pass assessment with strong backend tests and a clear manual frontend verification path.

---

## 5. Backend Unit Test Areas

### 5.1 Date Range Validation

File target:

```text
apps/api/src/validators/weatherRequest.validator.ts
```

Test cases:

```text
- accepts valid startDate and endDate
- rejects missing startDate
- rejects missing endDate
- rejects invalid date format
- rejects endDate before startDate
- rejects unsupported future date range if provider cannot support it
- trims and validates location string
```

Expected errors:

```text
MISSING_REQUIRED_FIELD
INVALID_DATE_RANGE
UNSUPPORTED_DATE_RANGE
INVALID_LOCATION_INPUT
```

---

### 5.2 Location Input Validation

Test cases:

```text
- accepts city name
- accepts town name
- accepts landmark-like string
- accepts postal code / ZIP code
- accepts GPS coordinates
- rejects empty string
- rejects one-character location
- rejects null location
- rejects non-string location
```

This validation happens before geocoding.

Geocoding failure is tested separately as `LOCATION_NOT_FOUND`.

---

### 5.3 Weather Code Mapping

File target:

```text
apps/api/src/utils/weatherCodes.ts
```

Test cases:

```text
- maps fog codes to fog
- maps drizzle/rain codes to rain
- maps heavy rain codes to heavy_rain
- maps snow codes to snow
- maps heavy snow codes to heavy_snow
- maps thunderstorm codes to storm
- ignores unknown codes safely
```

---

### 5.4 Weather Classification

File target:

```text
apps/api/src/services/weatherClassifier.service.ts
```

Test cases:

```text
- classifies very_cold when minTemperatureC <= 5
- classifies cold when minTemperatureC is between 6 and 12
- classifies cool when minTemperatureC is between 13 and 18
- classifies hot when maxTemperatureC is between 28 and 34
- classifies very_hot when maxTemperatureC >= 35
- classifies rain from precipitation probability
- classifies heavy_rain from high probability or rain amount
- classifies snow from snowfall data
- classifies heavy_snow from snowfall amount or codes
- classifies strong_wind from gusts or speed
- classifies high_uv when uvIndexMax >= 7
- classifies fog from low visibility or fog codes
- classifies storm from thunderstorm codes
- classifies large_temperature_variation when variation >= 12
- classifies mixed_conditions when multiple major groups exist
```

---

### 5.5 Packing Rules

File target:

```text
apps/api/src/services/packingRules.service.ts
```

Test cases:

```text
- cold adds warm jacket and warm socks
- very_cold adds heavy coat, gloves, beanie, scarf
- rain adds umbrella and waterproof jacket
- heavy_rain adds water-resistant shoes and waterproof pouch
- snow adds waterproof or insulated shoes
- heavy_snow adds thermal base layer and extra travel time insight
- strong_wind adds windbreaker and avoid fragile umbrellas
- high_uv adds sunscreen, sunglasses, hat, water bottle
- large_temperature_variation adds layered clothing
- duplicate checklist items are removed
- checklist always returns all categories
```

Required checklist categories:

```text
clothing
weatherProtection
accessories
healthAndSafety
optional
```

---

### 5.6 Checklist Validator

File target:

```text
apps/api/src/services/checklistValidator.service.ts
```

Test cases:

```text
- accepts valid AI checklist
- rejects non-JSON AI output
- rejects missing summary
- rejects missing travelInsights
- rejects missing packingChecklist
- rejects missing checklist categories
- rejects non-array checklist values
- rejects snow-specific items when no snow or cold exists
- rejects high UV warning when uvIndexMax is low
- accepts rain items when rain is detected
- falls back to deterministic checklist when validation fails
```

---

### 5.7 DeepSeek Service

File target:

```text
apps/api/src/services/deepseek.service.ts
```

Automated tests should mock the DeepSeek HTTP client.

Test cases:

```text
- builds structured prompt from normalized weather summary
- returns parsed JSON when provider returns valid JSON
- handles timeout safely
- handles provider error safely
- handles invalid JSON safely
- does not expose API key in returned errors
- returns fallback signal when disabled
```

These tests should not require a real API key.

---

## 6. Backend Integration Tests

### 6.1 Health Route

Request:

```http
GET /api/health
```

Expected:

```text
200 OK
response.data.status = ok
```

---

### 6.2 Create Weather Request

Request:

```http
POST /api/weather-requests
```

Mock:

```text
Geocoding API
Weather API
DeepSeek API optional
```

Expected:

```text
201 Created
record persisted
weatherProfile returned
packingChecklist returned
aiStatus returned
```

Test cases:

```text
- creates with valid location/date range
- uses fallback when AI fails
- rejects invalid location input
- returns LOCATION_NOT_FOUND when geocoding fails
- returns WEATHER_API_ERROR when weather provider fails
```

---

### 6.3 List Weather Requests

Request:

```http
GET /api/weather-requests
```

Expected:

```text
200 OK
data is array
meta.count exists
```

Test cases:

```text
- returns empty array when no records exist
- returns created records
- supports limit/offset if implemented
- supports location filter if implemented
```

---

### 6.4 Get Weather Request by ID

Request:

```http
GET /api/weather-requests/:id
```

Test cases:

```text
- returns saved record by id
- does not call Weather API again
- does not call DeepSeek again
- returns WEATHER_REQUEST_NOT_FOUND for missing id
```

---

### 6.5 Update Weather Request

Request:

```http
PUT /api/weather-requests/:id
```

Expected:

```text
200 OK
record updated
weather data refreshed when location/date changes
updatedAt changes
```

Test cases:

```text
- updates location and date range
- rejects invalid date range
- returns not found for unknown id
- uses fallback when AI fails during update
```

---

### 6.6 Delete Weather Request

Request:

```http
DELETE /api/weather-requests/:id
```

Expected:

```text
200 OK
data.deleted = true
record no longer exists
```

Test cases:

```text
- deletes existing record
- returns not found for missing id
```

---

### 6.7 Export CSV

Request:

```http
GET /api/weather-requests/export.csv
```

Expected:

```text
200 OK
Content-Type includes text/csv
CSV contains header row
CSV contains saved records
```

Test cases:

```text
- exports no records with header only or valid empty output
- exports one record
- flattens detectedConditions with delimiter
- does not call external APIs
```

---

### 6.8 Export JSON

Request:

```http
GET /api/weather-requests/export.json
```

Expected:

```text
200 OK
Content-Type application/json
data is array
meta.exportedAt exists
```

Test cases:

```text
- exports empty list
- exports nested weatherProfile and packingChecklist
- does not call external APIs
```

---

## 7. Frontend Test Plan

Automated frontend tests are optional for MVP, but manual frontend checks are required.

If frontend automated tests are added, prioritize:

```text
- renders search form
- shows validation error for empty location
- shows loading state
- renders current weather card from mocked API response
- renders 5-day forecast cards
- renders packing checklist categories
- renders saved requests table
- shows error message when API returns error
```

Suggested component test targets:

```text
LocationSearchForm.tsx
CurrentWeatherCard.tsx
ForecastGrid.tsx
PackingChecklist.tsx
SavedRequestsTable.tsx
ErrorMessage.tsx
```

---

## 8. Manual End-to-End Test Scenarios

### Scenario 1 — Valid City Search

Input:

```text
Location: London
Start date: valid date
End date: valid date
```

Expected:

```text
- Current weather displayed
- 5-day forecast displayed
- Weather profile displayed
- Packing checklist displayed
- Record saved in history
```

---

### Scenario 2 — Current Location

Action:

```text
Click current location button
Allow browser geolocation
```

Expected:

```text
- Coordinates are sent to backend or resolved location is displayed
- Current weather appears
- Forecast appears
- Packing checklist appears
```

If user denies permission:

```text
- Friendly error message appears
- Manual location search still works
```

---

### Scenario 3 — Invalid Location

Input:

```text
Location: asdfasdfnotacity
```

Expected:

```text
- Backend returns LOCATION_NOT_FOUND
- Frontend shows friendly error
- No record is saved
```

---

### Scenario 4 — Invalid Date Range

Input:

```text
Start date: 2026-07-15
End date: 2026-07-10
```

Expected:

```text
- Backend returns INVALID_DATE_RANGE
- Frontend shows friendly error
- No record is saved
```

---

### Scenario 5 — AI Disabled

Config:

```env
AI_RECOMMENDATIONS_ENABLED="false"
DEEPSEEK_API_KEY=""
```

Expected:

```text
- App still returns weather results
- Packing checklist is generated
- aiStatus is disabled or fallback_used
- No crash occurs
```

---

### Scenario 6 — CRUD Flow

Steps:

```text
1. Create weather request
2. View saved request in table
3. Open saved request
4. Update location/date
5. Confirm updated result appears
6. Delete record
7. Confirm record disappears
```

Expected:

```text
- All CRUD operations succeed
- UI updates after each action
- Database state matches UI
```

---

### Scenario 7 — Export Flow

Steps:

```text
1. Create at least one saved request
2. Click Export CSV
3. Click Export JSON
```

Expected:

```text
- CSV downloads or opens
- JSON returns saved records
- Export includes weather profile and checklist data
```

---

## 9. Mock Data Fixtures

Create reusable fixtures for tests.

Suggested path:

```text
apps/api/src/__tests__/fixtures/weather.fixtures.ts
```

Recommended fixtures:

```text
mildWeatherFixture
coolRainyWeatherFixture
heavyRainFixture
veryColdSnowFixture
hotHighUvFixture
stormFixture
fogFixture
strongWindFixture
largeTemperatureVariationFixture
```

Example fixture:

```ts
export const coolRainyWeatherFixture = {
  minTemperatureC: 12,
  maxTemperatureC: 18,
  rainProbabilityMaxPercent: 70,
  rainSumMaxMm: 4.2,
  snowfallExpected: false,
  snowfallMaxCm: 0,
  windGustMaxKmh: 38,
  uvIndexMax: 4,
  visibilityMinMeters: 10000,
  weatherCodes: [61],
  temperatureVariationC: 6
};
```

---

## 10. Minimum Test Coverage for MVP

Before final submission, at minimum test:

```text
- validator rejects invalid date range
- classifier detects rain
- classifier detects snow
- classifier detects high UV
- packing rules return required categories
- checklist validator rejects invalid AI output
- fallback works when AI is disabled
- create endpoint persists record
- read endpoint returns saved record
- update endpoint updates record
- delete endpoint deletes record
- CSV export returns CSV
- JSON export returns JSON
```

---

## 11. Commands

Planned commands:

```bash
npm test
npm run test:api
npm run test:web
npm run lint
npm run typecheck
npm run build
```

During scaffold, scripts may be placeholders. Replace them with real commands as soon as packages are implemented.

---

## 12. Demo Readiness Checklist

Before recording the demo video:

```text
- npm install succeeds
- .env.example can be copied to .env
- App runs locally
- Backend starts successfully
- Frontend starts successfully
- Valid location search works
- 5-day forecast appears
- Packing checklist appears
- Saved requests table works
- Update works
- Delete works
- CSV export works
- JSON export works
- AI fallback works without API key
- README setup instructions are accurate
```

---

## 13. Known External Dependency Risks

### Weather API unavailable

Expected handling:

```text
Return WEATHER_API_ERROR with friendly message.
Do not save incomplete record.
```

### DeepSeek unavailable

Expected handling:

```text
Use deterministic fallback rules.
Return successful response with aiStatus fallback_used.
```

### Browser geolocation denied

Expected handling:

```text
Show friendly UI message.
Allow manual location search.
```

---

## 14. Acceptance Criteria

Testing plan is satisfied when:

```text
- Deterministic weather rules are tested.
- Fallback behavior is tested.
- CRUD behavior is tested.
- Export behavior is tested.
- Invalid location and invalid date range are tested.
- Manual frontend flow is verified.
- App can be demonstrated without requiring a DeepSeek API key.
```

---

## 15. Final Rule

The most important test is reliability without AI.

```text
If the weather API works and DeepSeek fails, the user should still receive useful weather-based packing guidance.
```
