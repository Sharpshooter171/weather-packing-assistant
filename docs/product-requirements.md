# Product Requirements — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Assessment:** AI Engineer Intern Technical Assessment  
**Candidate:** Igor Caldas  
**Document status:** Initial PRD for implementation planning  
**Version:** 0.1

---

## 1. Product Summary

Weather Packing Assistant is a full-stack weather application that helps travelers search for real-time weather and forecast data, then receive practical packing suggestions based on the weather conditions at their destination.

The product goes beyond a traditional weather app by translating forecast data into user-friendly travel decisions.

Core question answered by the product:

> What should I bring based on the weather where I am going?

The application combines weather API retrieval, location validation, date range validation, database persistence, CRUD operations, export functionality, and an AI-assisted weather interpretation layer using the DeepSeek API.

---

## 2. Problem Statement

Travelers often check the weather before a trip but still need to manually interpret what the forecast means for packing.

A user may see values like:

- 8°C minimum temperature
- 70% rain probability
- 42 km/h wind gusts
- UV index 8
- Snowfall forecast
- Large temperature variation during the day

However, the user still needs to decide:

- Should I bring a jacket?
- Do I need waterproof shoes?
- Is sunscreen necessary?
- Should I pack gloves or a scarf?
- Will the weather affect outdoor plans?
- Are there mixed conditions across the trip?

This app reduces that cognitive load by converting raw weather data into practical travel insights and a packing checklist.

---

## 3. Target Users

### Primary User

A traveler who wants to quickly understand the weather at a destination and decide what to pack.

Examples:

- Someone traveling to another city for a weekend
- Someone planning a vacation
- A student or professional traveling for an event
- A user checking the weather for their current location before leaving home

### Secondary User

A technical evaluator reviewing the project for full-stack, backend, frontend, API integration, persistence, CRUD, and AI usage.

---

## 4. Product Goals

### User Goals

- Search weather by location or current position
- Understand current weather and 5-day forecast
- Receive practical packing suggestions
- Save weather requests
- Manage previous requests
- Export saved weather data

### Engineering Goals

- Demonstrate frontend development with Next.js, React, and TypeScript
- Demonstrate backend development with Node.js, Express, and TypeScript
- Demonstrate RESTful API design
- Demonstrate database persistence and CRUD operations
- Demonstrate API integration with a real weather provider
- Demonstrate responsible AI integration using DeepSeek API
- Demonstrate validation, error handling, and fallback behavior
- Demonstrate documentation-first development practices

---

## 5. Value Proposition

Traditional weather apps show weather data.

Weather Packing Assistant helps users act on weather data.

The product provides:

- Clear weather information
- Practical travel insights
- Packing recommendations by weather scenario
- Saved searches and history
- Exportable records
- AI-assisted explanations with deterministic backend validation

---

## 6. MVP Scope

The MVP must satisfy both frontend and backend assessment requirements.

### Must Have

#### Frontend

- Location input field
- Current location support using browser geolocation when available
- Current weather display
- 5-day forecast display
- Packing checklist display
- Error states for invalid input and API failures
- Responsive layout for desktop, tablet, and mobile
- Weather icons or simple visual indicators
- Informational section about PM Accelerator
- Candidate name visible in the app

#### Backend

- REST API
- Weather API integration
- Geocoding/location validation
- Date range validation
- SQLite database using Prisma
- CREATE weather request
- READ weather requests
- UPDATE weather request
- DELETE weather request
- Export data as CSV
- Export data as JSON
- Normalized error responses

#### AI / Interpretation

- Weather normalizer
- Rule-based weather classifier
- DeepSeek AI recommendation service
- Checklist validation service
- Deterministic fallback checklist when DeepSeek is unavailable

---

## 7. Out of Scope for MVP

The first version will not include:

- User authentication
- User accounts
- Row-level security
- Payments
- Airline baggage rules
- Carry-on size restrictions
- Real-time severe weather official alerts from government agencies
- Mobile native app
- Multi-language support
- Complex itinerary planning
- Hotel or flight booking

Airline luggage dimensions and baggage policies are intentionally out of scope. The packing checklist is based only on weather interpretation.

---

## 8. User Stories

### Weather Search

As a traveler, I want to enter a destination so that I can see current weather and forecast information.

Acceptance criteria:

- User can submit a city, town, landmark, postal code, GPS coordinates, or current location
- System validates the location
- System returns current weather and forecast
- System shows a useful error if the location is not found

### 5-Day Forecast

As a traveler, I want to see a 5-day forecast so that I can understand weather changes during my trip.

Acceptance criteria:

- Forecast is displayed in a clear list or grid
- Each forecast day shows key weather information
- Forecast includes temperature range and weather condition

### Packing Checklist

As a traveler, I want a packing checklist based on the forecast so that I know what essential items to bring.

Acceptance criteria:

- Checklist changes based on weather conditions
- Checklist includes categories such as clothing, weather protection, accessories, and health/safety
- Checklist is generated from weather interpretation, not static text
- If AI fails, checklist still works using deterministic rules

### Saved Requests

As a user, I want my weather searches to be saved so that I can review them later.

Acceptance criteria:

- Created weather requests are stored in the database
- User can list previous requests
- User can open a saved request

### Update Request

As a user, I want to update a saved weather request so that I can change location or travel dates.

Acceptance criteria:

- User can update editable fields
- Backend validates new values
- Weather data and recommendations are refreshed after update

### Delete Request

As a user, I want to delete a saved request so that I can remove records I no longer need.

Acceptance criteria:

- User can delete a record
- Deleted record no longer appears in list results

### Export Data

As a user or evaluator, I want to export saved data so that I can inspect or reuse the stored weather records.

Acceptance criteria:

- User can export saved requests as CSV
- User can export saved requests as JSON
- Export includes location, date range, forecast summary, weather profile, and packing checklist

---

## 9. Weather Interpretation Requirements

The app should classify raw weather data into practical scenarios.

### Supported Scenarios

- Hot weather
- Cold weather
- Very cold weather
- Rain
- Heavy rain
- Snow
- Heavy snow
- Fog or low visibility
- Strong wind
- Storm or thunderstorm risk
- High UV exposure
- Large temperature variation
- Mixed weather conditions across the trip period

### Example Mapping

```text
Cold + rain + wind
→ Warm layer, waterproof jacket, extra socks, water-resistant shoes

Hot + high UV
→ Light clothing, sunscreen, sunglasses, hat, reusable water bottle

Snow + very cold
→ Heavy coat, gloves, scarf, beanie, insulated or waterproof shoes

Storm risk
→ Waterproof outer layer, power bank, avoid exposed outdoor activities
```

---

## 10. AI Requirements

The DeepSeek API should be used as an AI-assisted interpretation layer.

The LLM may:

- Explain weather conditions in user-friendly language
- Organize packing suggestions into categories
- Generate travel insights from structured weather data
- Produce a structured JSON recommendation

The LLM must not:

- Invent weather data
- Override temperature, wind, rain, snow, or UV data from the weather API
- Add unsafe or unrelated recommendations
- Return unstructured text when JSON is required
- Become the only source of packing recommendations

Backend rule:

> The weather API is the source of truth for weather data. DeepSeek may interpret and explain, but the backend validates the final response.

If the LLM fails, times out, or returns invalid JSON, the backend must use deterministic fallback rules.

---

## 11. Functional Requirements

### Location Input

The system must accept at least:

- City
- Town
- Landmark
- Postal code / ZIP code
- GPS coordinates
- Current browser location

### Date Range

The system must validate:

- `startDate` is present
- `endDate` is present
- `endDate` is equal to or after `startDate`
- Date range is supported by the selected weather API

### Storage

The system must store:

- Original location input
- Resolved location
- Coordinates
- Date range
- Current weather JSON
- Forecast JSON
- Weather profile JSON
- Packing checklist JSON
- Optional AI recommendation JSON
- Created and updated timestamps

### Export

The system must support:

- CSV export
- JSON export

---

## 12. Non-Functional Requirements

### Reliability

- The app should still provide a checklist if DeepSeek is unavailable
- The app should return useful errors when external APIs fail
- Backend should not expose stack traces to users

### Security

- No secrets committed to Git
- API keys must use environment variables
- `.env.example` should document required variables
- DeepSeek API key must never be exposed to the frontend

### Performance

- Avoid unnecessary repeated weather API calls when reading saved records
- Keep API responses reasonably small
- Store raw weather JSON only when useful for debugging and export

### Maintainability

- Keep weather retrieval, normalization, AI interpretation, validation, and persistence in separate modules
- Keep documented API contracts stable
- Update documentation when contracts change

---

## 13. Success Criteria

The project is successful if:

- The evaluator can clone the repository and run the app locally
- The frontend allows location search and displays current weather
- The frontend displays a 5-day forecast
- The frontend displays a useful packing checklist
- The backend supports full CRUD
- The backend persists weather requests in a database
- The app exports stored data
- The app handles invalid location and invalid date range gracefully
- DeepSeek integration is implemented safely or documented as optional if unavailable
- Deterministic fallback works without the LLM
- README clearly explains how to run and test the project

---

## 14. Demo Requirements

The demo video should show:

1. Project introduction
2. Location search
3. Current weather display
4. 5-day forecast
5. Weather interpretation
6. Packing checklist
7. Saved request in database
8. CRUD operation example
9. CSV or JSON export
10. Code walkthrough showing:
    - frontend components
    - backend routes
    - weather service
    - interpretation layer
    - DeepSeek service
    - database model

---

## 15. Implementation Priorities

### Phase 1 — Documentation and Scaffold

- README
- Product requirements
- Architecture
- API contract
- Environment example
- Monorepo scaffold

### Phase 2 — Backend Core

- Express server
- Health route
- Weather request routes
- Validation utilities
- Prisma schema
- SQLite database

### Phase 3 — Weather Integration

- Geocoding service
- Forecast service
- Weather normalizer
- Error handling

### Phase 4 — Interpretation Engine

- Rule-based weather classifier
- Packing fallback engine
- DeepSeek recommendation service
- Checklist validation

### Phase 5 — Frontend

- Search UI
- Current weather card
- Forecast grid
- Packing checklist cards
- Saved requests table
- Error states

### Phase 6 — Export, Testing, and Demo Polish

- CSV export
- JSON export
- Tests
- README final update
- Demo script

---

## 16. Product Principle

This product should remain simple, useful, and demoable.

The goal is not to build the most complex weather app. The goal is to show strong full-stack engineering, API integration, persistence, responsible AI usage, and product thinking.
