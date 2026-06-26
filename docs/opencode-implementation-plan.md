# OpenCode Implementation Plan — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Document status:** Initial implementation plan for code agents  
**Version:** 0.1  
**Target agent:** OpenCode or any coding agent working in small patches

---

## 1. Purpose

This document gives a coding agent a safe, ordered implementation plan for Weather Packing Assistant.

The goal is to avoid a large, messy implementation by working in small patches with clear verification after each step.

The agent should use this document together with:

```text
README.md
docs/product-requirements.md
docs/architecture.md
docs/api-contract.md
docs/ai-weather-interpretation-contract.md
docs/weather-rules.md
docs/data-model.md
docs/devops.md
docs/testing-plan.md
docs/ui-reference.md
```

---

## 2. Non-Negotiable Rules

The agent must follow these rules:

```text
1. Read the docs before writing code.
2. Make one small patch at a time.
3. Keep the app runnable after each meaningful patch.
4. Do not commit secrets.
5. Do not call DeepSeek from the frontend.
6. Do not rely on DeepSeek for core functionality.
7. Weather API data is the source of truth.
8. Deterministic fallback must work without AI.
9. API response shapes must follow docs/api-contract.md.
10. Database model must follow docs/data-model.md.
11. Weather rules must follow docs/weather-rules.md.
12. Update docs if a contract changes.
```

---

## 3. Recommended Implementation Strategy

Use a staged build:

```text
Phase 0: repository hygiene
Phase 1: package/workspace scaffold
Phase 2: backend foundation
Phase 3: database and repository
Phase 4: validators
Phase 5: deterministic weather engine
Phase 6: weather/geocoding integration
Phase 7: DeepSeek integration and validation
Phase 8: CRUD API routes
Phase 9: export routes
Phase 10: frontend scaffold
Phase 11: frontend weather search/result UI
Phase 12: frontend saved requests/export UI
Phase 13: tests and demo polish
```

Do not jump directly to frontend polish before backend contracts are working.

---

## 4. Phase 0 — Repository Hygiene

### Goal

Ensure base repository files are safe and useful before code implementation.

### Files

```text
.gitignore
.env.example
package.json
README.md
```

### Tasks

```text
- Fill .gitignore with Node, env, build, and SQLite ignores.
- Fill .env.example with required variables.
- Ensure root package.json is valid JSON.
- Ensure README setup instructions are not misleading.
```

### Verification

```bash
git status
cat .gitignore
cat .env.example
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json ok')"
```

### Done When

```text
- package.json is valid.
- .gitignore prevents secrets and local DB files.
- .env.example documents all required env vars.
```

---

## 5. Phase 1 — Package and Workspace Scaffold

### Goal

Create a working npm workspace structure.

### Files / Folders

```text
apps/api/
apps/web/
packages/shared/
package.json
```

### Tasks

```text
- Configure root package.json with workspaces.
- Add basic scripts: dev, build, test, lint, typecheck.
- Add package.json for apps/api.
- Add package.json for apps/web.
- Add package.json for packages/shared.
- Install TypeScript where needed.
```

### Suggested Root package.json Shape

```json
{
  "private": true,
  "workspaces": [
    "apps/api",
    "apps/web",
    "packages/shared"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "npm --workspace apps/api run dev",
    "dev:web": "npm --workspace apps/web run dev",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "typecheck": "npm run typecheck --workspaces"
  }
}
```

### Verification

```bash
npm install
npm run typecheck
```

At this phase, placeholder scripts are acceptable only if no app code exists yet.

### Done When

```text
- npm install succeeds.
- Workspace package files exist.
- Root scripts exist and are documented.
```

---

## 6. Phase 2 — Backend Foundation

### Goal

Create a minimal Express API that starts locally and exposes health check.

### Files

```text
apps/api/src/server.ts
apps/api/src/app.ts
apps/api/src/routes/health.routes.ts
apps/api/src/middleware/errorHandler.ts
apps/api/tsconfig.json
```

### Tasks

```text
- Add Express.
- Add TypeScript config.
- Add app factory.
- Add /api/health route.
- Add centralized error handler.
- Add dev script using tsx or ts-node-dev.
```

### Expected Endpoint

```http
GET /api/health
```

Expected response:

```json
{
  "data": {
    "status": "ok",
    "service": "weather-packing-assistant-api",
    "version": "0.1"
  }
}
```

### Verification

```bash
npm run dev:api
curl http://localhost:4000/api/health
```

### Done When

```text
- Backend starts.
- Health route returns 200.
- Error handler exists.
- Response shape follows docs/api-contract.md.
```

---

## 7. Phase 3 — Database and Repository

### Goal

Implement Prisma + SQLite persistence for WeatherRequest.

### Files

```text
prisma/schema.prisma
apps/api/src/repositories/weatherRequest.repository.ts
apps/api/src/types/weather.types.ts
```

### Tasks

```text
- Add Prisma dependencies.
- Create schema from docs/data-model.md.
- Run initial migration.
- Generate Prisma client.
- Implement repository functions.
```

### Repository Functions

```ts
createWeatherRequest(data)
listWeatherRequests(filters)
getWeatherRequestById(id)
updateWeatherRequest(id, data)
deleteWeatherRequest(id)
```

### Verification

```bash
npx prisma validate
npx prisma migrate dev --name init
npx prisma generate
```

Optional:

```bash
npx prisma studio
```

### Done When

```text
- Prisma schema validates.
- Migration runs locally.
- Repository can create/read/update/delete records in tests or a script.
- Local SQLite files are ignored by Git.
```

---

## 8. Phase 4 — Request Validators

### Goal

Validate API input before geocoding, weather calls, or DB writes.

### Files

```text
apps/api/src/validators/weatherRequest.validator.ts
apps/api/src/errors/AppError.ts
```

### Tasks

```text
- Validate location input.
- Validate startDate and endDate.
- Validate date format YYYY-MM-DD.
- Validate endDate >= startDate.
- Return normalized validation result.
- Use API error codes from docs/api-contract.md.
```

### Required Error Codes

```text
INVALID_REQUEST_BODY
MISSING_REQUIRED_FIELD
INVALID_LOCATION_INPUT
INVALID_DATE_RANGE
UNSUPPORTED_DATE_RANGE
```

### Verification

```bash
npm run test:api
```

At minimum, write unit tests for invalid date range and missing location.

### Done When

```text
- Invalid body does not reach service layer.
- Date range validation is tested.
- Location input validation is tested.
```

---

## 9. Phase 5 — Deterministic Weather Engine

### Goal

Implement rules that generate weather profile, insights, and checklist without AI.

### Files

```text
apps/api/src/utils/weatherCodes.ts
apps/api/src/services/weatherClassifier.service.ts
apps/api/src/services/packingRules.service.ts
apps/api/src/services/checklistValidator.service.ts
```

### Tasks

```text
- Implement WMO weather code helpers.
- Implement detected condition classifier.
- Implement risk level selection.
- Implement main scenario selection.
- Implement deterministic packing checklist.
- Implement duplicate removal.
- Ensure all checklist categories are always returned.
```

### Contract Source

Read first:

```text
docs/weather-rules.md
```

### Verification

```bash
npm run test:api
```

Minimum unit tests:

```text
- rain classification
- snow classification
- high UV classification
- strong wind classification
- packing checklist categories
- duplicate removal
```

### Done When

```text
- Weather rules engine works without API calls.
- Packing checklist works without DeepSeek.
- Output matches docs/weather-rules.md.
```

---

## 10. Phase 6 — Weather and Geocoding Integration

### Goal

Connect backend to external geocoding and weather APIs.

### Files

```text
apps/api/src/services/geocoding.service.ts
apps/api/src/services/weatherApi.service.ts
apps/api/src/services/weatherNormalizer.service.ts
apps/api/src/config/env.ts
```

### Tasks

```text
- Read API base URLs from env.
- Resolve location to latitude/longitude.
- Fetch current weather and forecast.
- Normalize weather provider response.
- Convert provider-specific fields into internal types.
- Handle provider errors with normalized API errors.
```

### Important Rule

```text
Weather API data is the source of truth.
```

### Verification

```bash
npm run dev:api
curl -X POST http://localhost:4000/api/weather-requests \
  -H "Content-Type: application/json" \
  -d '{"location":"London","startDate":"2026-07-10","endDate":"2026-07-15","useAi":false}'
```

During tests, mock external API calls.

### Done When

```text
- Valid location resolves.
- Weather data is fetched.
- Normalized forecast exists.
- Weather API failures return WEATHER_API_ERROR.
- Location failures return LOCATION_NOT_FOUND.
```

---

## 11. Phase 7 — DeepSeek Integration and AI Validation

### Goal

Add optional AI-assisted recommendation while preserving deterministic fallback.

### Files

```text
apps/api/src/services/deepseek.service.ts
apps/api/src/services/aiRecommendation.service.ts
apps/api/src/services/checklistValidator.service.ts
```

### Contract Source

Read first:

```text
docs/ai-weather-interpretation-contract.md
```

### Tasks

```text
- Add DeepSeek API client in backend only.
- Build compact structured prompt.
- Request JSON output.
- Parse output safely.
- Validate AI output against checklist contract.
- Reject contradictory recommendations.
- Use fallback when AI fails.
- Set aiStatus correctly.
```

### Required Status Values

```text
generated
fallback_used
disabled
not_requested
```

### Verification

Tests should mock DeepSeek.

```bash
npm run test:api
```

Manual fallback check:

```env
DEEPSEEK_API_KEY=""
AI_RECOMMENDATIONS_ENABLED="true"
```

Expected:

```text
Request succeeds with fallback checklist.
aiStatus = fallback_used or disabled depending config.
```

### Done When

```text
- Frontend never receives or uses DeepSeek key.
- DeepSeek failure does not break request.
- AI output is validated before persistence.
- Fallback always works.
```

---

## 12. Phase 8 — CRUD API Routes

### Goal

Implement weather request CRUD routes.

### Files

```text
apps/api/src/routes/weatherRequests.routes.ts
apps/api/src/controllers/weatherRequests.controller.ts
apps/api/src/services/weatherRequestWorkflow.service.ts
```

### Routes

```http
POST   /api/weather-requests
GET    /api/weather-requests
GET    /api/weather-requests/:id
PUT    /api/weather-requests/:id
DELETE /api/weather-requests/:id
```

### Tasks

```text
- Wire validator -> services -> repository.
- Create weather request workflow.
- Read saved records without calling external APIs.
- Update record and refresh weather data when location/date changes.
- Delete record.
- Return documented response shapes.
```

### Verification

```bash
curl http://localhost:4000/api/weather-requests
curl http://localhost:4000/api/weather-requests/<id>
```

Run integration tests for create/read/update/delete.

### Done When

```text
- CRUD works.
- API response shape follows docs/api-contract.md.
- Read operations do not call Weather API or DeepSeek.
```

---

## 13. Phase 9 — Export Routes

### Goal

Implement CSV and JSON exports from persisted records.

### Files

```text
apps/api/src/services/export.service.ts
apps/api/src/routes/weatherRequests.routes.ts
apps/api/src/controllers/weatherRequests.controller.ts
```

### Routes

```http
GET /api/weather-requests/export.csv
GET /api/weather-requests/export.json
```

### Tasks

```text
- Read persisted records.
- Flatten fields for CSV.
- Preserve nested objects for JSON export.
- Set correct content types.
- Do not call external APIs.
```

### Verification

```bash
curl -L http://localhost:4000/api/weather-requests/export.csv -o weather-requests.csv
curl http://localhost:4000/api/weather-requests/export.json
```

### Done When

```text
- CSV export returns valid CSV.
- JSON export returns valid JSON.
- Export works with zero records and multiple records.
```

---

## 14. Phase 10 — Frontend Scaffold

### Goal

Create a Next.js app that runs locally.

### Files

```text
apps/web/src/app/page.tsx
apps/web/src/app/layout.tsx
apps/web/src/app/globals.css
apps/web/src/services/apiClient.ts
apps/web/src/types/weather.ts
```

### Tasks

```text
- Scaffold Next.js with TypeScript.
- Add Tailwind CSS.
- Add API client using NEXT_PUBLIC_API_BASE_URL.
- Add base page layout.
- Add header and hero section.
```

### Verification

```bash
npm run dev:web
```

Expected:

```text
Frontend loads in browser.
App name and search area visible.
```

### Done When

```text
- Web app starts.
- Tailwind works.
- API base URL is configurable.
```

---

## 15. Phase 11 — Frontend Weather Search and Results

### Goal

Implement the main user flow.

### Components

```text
LocationSearchForm.tsx
CurrentWeatherCard.tsx
WeatherInterpretationCard.tsx
ForecastGrid.tsx
ForecastDayCard.tsx
PackingChecklist.tsx
LoadingState.tsx
ErrorMessage.tsx
EmptyState.tsx
```

### Tasks

```text
- Build search form.
- Submit POST /api/weather-requests.
- Show loading state.
- Show current weather card.
- Show 5-day forecast grid.
- Show weather interpretation.
- Show packing checklist.
- Show friendly errors.
- Support current location if possible.
```

### Verification

Manual browser test:

```text
Search London -> current weather + forecast + checklist visible.
Search invalid location -> friendly error visible.
Invalid date range -> friendly error visible.
```

### Done When

```text
- Assessment frontend requirements are visibly covered.
- UI follows docs/ui-reference.md.
```

---

## 16. Phase 12 — Saved Requests and Export UI

### Goal

Expose backend CRUD and export features in the frontend.

### Components

```text
SavedRequestsTable.tsx
SavedRequestCard.tsx
ExportActions.tsx
```

### Tasks

```text
- Fetch saved requests.
- Display saved request list/table.
- View saved record.
- Update saved record using existing form or simple edit UI.
- Delete saved record with confirmation.
- Add Export CSV button.
- Add Export JSON button.
```

### Verification

Manual browser flow:

```text
Create -> appears in saved list -> update -> changed result appears -> delete -> removed from list -> export CSV/JSON works.
```

### Done When

```text
- Backend CRUD is visible through UI.
- Export buttons work.
- Saved requests demonstrate persistence.
```

---

## 17. Phase 13 — Tests and Demo Polish

### Goal

Prepare for final evaluation.

### Tasks

```text
- Add missing tests from docs/testing-plan.md.
- Ensure README run instructions are correct.
- Ensure .env.example is correct.
- Ensure candidate name is visible.
- Ensure PM Accelerator section is visible.
- Run build/test/lint/typecheck.
- Record demo video script.
```

### Verification Commands

```bash
npm install
cp .env.example .env
npm run typecheck
npm test
npm run build
npm run dev
```

### Manual Demo Checklist

```text
- App loads.
- User searches location.
- Current weather appears.
- 5-day forecast appears.
- Packing checklist appears.
- Saved request appears.
- Update works.
- Delete works.
- CSV export works.
- JSON export works.
- App works without DeepSeek key.
```

### Done When

```text
- App is demoable in 1-2 minutes.
- README matches actual behavior.
- No secrets are committed.
```

---

## 18. Patch Template for OpenCode

When asking OpenCode for a patch, use this structure:

```text
Read the project docs first:
- README.md
- docs/architecture.md
- docs/api-contract.md
- docs/data-model.md
- docs/weather-rules.md
- docs/testing-plan.md

Task:
<one small task only>

Constraints:
- Keep the patch minimal.
- Do not change documented contracts unless necessary.
- Do not commit secrets.
- Add or update tests for the changed logic.
- Run the smallest relevant verification command.

Return:
- Summary of files changed
- Commands run
- Result
- Any follow-up needed
```

---

## 19. Suggested First OpenCode Prompt

Use this after documentation is complete:

```text
Read README.md and all files in docs/.
Implement Phase 0 and Phase 1 from docs/opencode-implementation-plan.md.
Create a valid npm workspace scaffold for apps/api, apps/web, and packages/shared.
Fill .gitignore and .env.example according to docs/devops.md.
Keep the patch minimal and do not implement app logic yet.
After the patch, run npm install and a basic package.json validation command.
Return a summary of changed files and commands run.
```

---

## 20. Suggested Second OpenCode Prompt

```text
Read docs/api-contract.md and docs/opencode-implementation-plan.md.
Implement Phase 2 only: minimal Express backend foundation with GET /api/health.
Do not implement weather requests yet.
Response shape must match docs/api-contract.md.
Add a minimal test for /api/health if the test framework is already configured; otherwise leave a clear TODO.
Run the smallest relevant command to verify the API starts.
```

---

## 21. Suggested Third OpenCode Prompt

```text
Read docs/data-model.md and docs/devops.md.
Implement Phase 3 only: Prisma schema and WeatherRequest repository skeleton.
Use SQLite and Prisma.
Do not implement API routes yet.
Ensure local database files are ignored by Git.
Run npx prisma validate and npx prisma generate.
Return changed files and command results.
```

---

## 22. Stop Conditions

The agent should stop and report instead of guessing if:

```text
- A command fails repeatedly.
- A package version conflict blocks progress.
- A documented contract contradicts implementation reality.
- External API behavior does not match expected response shape.
- A secret appears in a file that would be committed.
```

The agent should not silently bypass failing tests.

---

## 23. Final Acceptance Criteria

The implementation is complete when:

```text
- Frontend assessment requirements are met.
- Backend assessment requirements are met.
- CRUD works.
- Persistence works.
- Export works.
- Weather API integration works.
- Deterministic weather rules work.
- DeepSeek integration is implemented or safely optional.
- Fallback works without DeepSeek.
- README instructions are accurate.
- Demo video can be recorded in 1-2 minutes.
```

---

## 24. Final Rule

Build the smallest complete product that proves the full-stack requirements.

```text
Working app first.
Polish second.
Complexity only when it supports the assessment.
```
